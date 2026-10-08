from rest_framework import serializers

from .models import Idea


class IdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = [
            'id', 'title', 'content', 'color',
            'pos_x', 'pos_y', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
