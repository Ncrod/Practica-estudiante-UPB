from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets

from .models import Idea
from .serializers import IdeaSerializer


@ensure_csrf_cookie
def board(request):
    return render(request, 'ideas/board.html')


class IdeaViewSet(viewsets.ModelViewSet):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
