from django.db import models


class Idea(models.Model):
    title = models.CharField(max_length=120)
    content = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#ffe066')
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
