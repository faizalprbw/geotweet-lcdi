from pathlib import Path
import os
from datetime import timedelta

# --------------------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------------------
# Core settings
# --------------------------------------------------------------------------------------
SECRET_KEY = os.getenv('DJANGO_SECRET', 'insecure')
DEBUG = str(os.getenv('DJANGO_DEBUG', '0')).lower() in ['1', 'true', 'yes']
ALLOWED_HOSTS = [h for h in os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',') if h] or ['*']

# Silence system check about default AutoField
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Internationalization / Timezone
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Jakarta'
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------------------
# Applications
# --------------------------------------------------------------------------------------
INSTALLED_APPS = [
    # Django core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # GeoDjango

    # Third-party
    'rest_framework',
    'corsheaders',
    'drf_spectacular',

    # Local apps
    'app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# --------------------------------------------------------------------------------------
# Database (PostGIS)
# --------------------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('POSTGRES_DB', 'geodb'),
        'USER': os.getenv('POSTGRES_USER', 'geo'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'geo123'),
        'HOST': os.getenv('POSTGRES_HOST', 'db'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# --------------------------------------------------------------------------------------
# Static / Media
# --------------------------------------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --------------------------------------------------------------------------------------
# REST Framework / Auth
# --------------------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 5,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
}

# OpenAPI / Swagger
SPECTACULAR_SETTINGS = {
    'TITLE': 'GeoTweet API',
    'DESCRIPTION': 'Posts with geocoded locations (Nominatim) stored in PostGIS',
    'VERSION': '1.0.0',
}

# --------------------------------------------------------------------------------------
# CORS / CSRF
# --------------------------------------------------------------------------------------
_cors = os.getenv('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = [s for s in _cors.split(',') if s]
CORS_ALLOW_ALL_ORIGINS = not bool(CORS_ALLOWED_ORIGINS)

_csrf = os.getenv('CSRF_TRUSTED_ORIGINS', '')
CSRF_TRUSTED_ORIGINS = [s for s in _csrf.split(',') if s]

# --------------------------------------------------------------------------------------
# Nominatim
# --------------------------------------------------------------------------------------
NOMINATIM_EMAIL = os.getenv('NOMINATIM_EMAIL', '')
