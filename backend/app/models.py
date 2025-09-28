from django.contrib.gis.db import models
from django.contrib.auth.models import User


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    text = models.CharField(max_length=140)
    location_name = models.CharField(max_length=200)
    geom = models.PointField(srid=4326)
    created_at = models.DateTimeField(auto_now_add=True)


class Meta:
    ordering = ['-created_at']


def __str__(self):
    return f"{self.user.username}: {self.text[:20]}..."