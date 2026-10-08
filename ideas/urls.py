from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BoardViewSet, IdeaViewSet, board

router = DefaultRouter()
router.register('ideas', IdeaViewSet, basename='idea')
router.register('boards', BoardViewSet)

urlpatterns = [
    path('', board, name='board'),
    path('boards/<int:board_id>/', board, name='board-detail'),
    path('api/', include(router.urls)),
]
