from django.db import models


class Board(models.Model):
    name = models.CharField(max_length=120)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.name


class Idea(models.Model):
    board = models.ForeignKey(Board, related_name='ideas', on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    content = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#ffe066')
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    width = models.FloatField(default=220)
    height = models.FloatField(default=140)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
