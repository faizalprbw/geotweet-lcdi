from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.gis.geos import Point
from django.contrib.auth.hashers import identify_hasher
import requests, os, re

from rest_framework import generics, permissions, status
from .models import Post
from .serializers import RegisterSerializer, PostSerializer, PostCreateSerializer
from rest_framework.views import APIView
from django.utils.timezone import localtime


# Geocode fleksibel: cari frasa lokasi di dalam teks (prioritas dari akhir)
def geocode_text(raw_text: str):
    url = 'https://nominatim.openstreetmap.org/search'
    headers = {'User-Agent': 'GeoTweet/1.0'}
    base = {'format': 'jsonv2', 'limit': 1}

    email = os.getenv('NOMINATIM_EMAIL', '')
    if email:
        base['email'] = email
    # Bias Indonesia; kosongkan di .env kalau mau global
    countrycodes = os.getenv('NOMINATIM_COUNTRYCODES', 'id')
    if countrycodes:
        base['countrycodes'] = countrycodes
    lang = os.getenv('NOMINATIM_LANG', 'id')
    if lang:
        base['accept-language'] = lang

    try:
        r = requests.get(url, params={**base, 'q': raw_text}, headers=headers, timeout=8)
        if r.ok and r.json():
            return r.json()[0]
    except Exception:
        pass

    cleaned = re.sub(r'[^0-9A-Za-zÀ-ÖØ-öø-ÿ\s]', ' ', raw_text)
    tokens = [t for t in cleaned.split() if len(t) >= 3]
    cands = []
    for n in (3, 2, 1):
        for i in range(len(tokens) - n + 1):
            cands.append(' '.join(tokens[i:i+n]))

    seen, ordered = set(), []
    for cand in reversed(cands):
        lc = cand.lower()
        if lc not in seen:
            seen.add(lc)
            ordered.append(cand)

    for q in ordered[:25]:  # batasi 25 request
        try:
            r = requests.get(url, params={**base, 'q': q}, headers=headers, timeout=5)
            if r.ok and r.json():
                return r.json()[0]
        except Exception:
            continue
    return None


# Auth
class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    #def perform_create(self, serializer):
    #    user = serializer.save()
    #    pwd = serializer.validated_data.get('password')
    #    needs_hash = True
    #    try:
    #        identify_hasher(user.password)
    #        needs_hash = False
    #    except Exception:
    #        needs_hash = True
    #    if needs_hash and pwd:
    #        user.set_password(pwd)
    #        user.save()


# Posts
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.select_related('user').order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


    def get_serializer_class(self):
        return PostCreateSerializer if self.request.method == 'POST' else PostSerializer


    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        text = serializer.validated_data['text']

        # --- Nominatim params ---
        headers = {
            'User-Agent': 'GeoTweet/1.0',
            'Accept-Language': os.getenv('NOMINATIM_LANG', 'id'),
        }
        params = {
            'q': text,
            'format': 'jsonv2',
            'limit': 10,
            'addressdetails': 1,
        }
        cc = os.getenv('NOMINATIM_COUNTRYCODES', 'id')
        if cc:
            params['countrycodes'] = cc
        email = os.getenv('NOMINATIM_EMAIL', '')
        if email:
            params['email'] = email

        r = requests.get('https://nominatim.openstreetmap.org/search', params=params, headers=headers, timeout=10)
        data = r.json() if r.ok else []

        tokens = [t for t in re.findall(r'[A-Za-zÀ-ÖØ-öø-ÿ]+', text) if len(t) >= 3]
        tail = [w.lower() for w in tokens[-6:]]

        if not data:
            for n in (3, 2, 1):
                for i in range(len(tokens) - n, -1, -1):
                    q = ' '.join(tokens[i:i+n])
                    r = requests.get('https://nominatim.openstreetmap.org/search',
                                    params={**params, 'q': q}, headers=headers, timeout=5)
                    cand = r.json() if r.ok else []
                    if cand:
                        data = cand
                        break
                if data:
                    break

        if not data:
            raise ValidationError({'detail': 'Teks harus memuat lokasi yang dapat dikenali (misal: "Jakarta", "Bandung", "Raja Ampat").'})

        def score(c):
            s = float(c.get('importance') or 0.0)
            t = (c.get('type') or '').lower()
            if t in ('city', 'administrative', 'town'):
                s += 1.0
            elif t in ('village', 'suburb', 'county', 'municipality', 'hamlet'):
                s += 0.3
            dn = (c.get('display_name') or '').lower()
            for w in tail:
                if w and w in dn:
                    s += 0.25
            addr = c.get('address') or {}
            if 'bandung' in text.lower():
                state = (addr.get('state') or '').lower()
                city = (addr.get('city') or addr.get('town') or '').lower()
                if state in ('jawa barat', 'west java') or city in ('bandung', 'kota bandung'):
                    s += 1.0
            return s

        hit = max(data, key=score)

        lon = float(hit['lon']); lat = float(hit['lat'])
        location_name = hit.get('display_name', 'Unknown')
        post = Post.objects.create(
            user=self.request.user,
            text=text,
            location_name=location_name,
            geom=Point(lon, lat, srid=4326)
        )
        self.instance = post


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        out = PostSerializer(self.instance, context={'request': request}).data
        headers = self.get_success_headers(out)
        return Response(out, status=status.HTTP_201_CREATED, headers=headers)


class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.select_related('user').order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]


class PostGeoJSONView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        features = []
        for p in Post.objects.select_related('user').all():
            geom = p.geom
            features.append({
                'type': 'Feature',
                'id': p.id,
                'geometry': {
                    'type': 'Point',
                    'coordinates': [geom.x, geom.y],
            },
            'properties': {
                'id': p.id,
                'user': p.user.username,
                'avatar': f"https://ui-avatars.com/api/?name={p.user.username}",
                'text': p.text,
                'location_name': p.location_name,
                'created_at': localtime(p.created_at).isoformat(),
                }
            })
        return Response({ 'type': 'FeatureCollection', 'features': features })