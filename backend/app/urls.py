from django.urls import path
from .views import RegisterView, LoginView, PostListCreateView, PostDetailView, PostGeoJSONView


urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('posts/', PostListCreateView.as_view(), name='posts'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts.geojson', PostGeoJSONView.as_view(), name='posts-geojson'),
]