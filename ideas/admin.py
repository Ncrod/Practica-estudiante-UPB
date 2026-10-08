from django.contrib import admin

from .models import Idea


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ['title', 'color', 'pos_x', 'pos_y', 'updated_at']
