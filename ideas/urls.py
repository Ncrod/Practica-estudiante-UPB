from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import IdeaViewSet, board

router = DefaultRouter()
router.register('ideas', IdeaViewSet)

urlpatterns = [
    path('', board, name='board'),
    path('api/', include(router.urls)),
]
