from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id","user","text","location_name","created_at")
    search_fields = ("text","location_name","user__username")