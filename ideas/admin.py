from django.contrib import admin

from .models import Board, Idea


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ['title', 'board', 'color', 'pos_x', 'pos_y', 'updated_at']
