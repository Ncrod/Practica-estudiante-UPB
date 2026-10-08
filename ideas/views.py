from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets

from .models import Board, Idea
from .serializers import BoardSerializer, IdeaSerializer


@ensure_csrf_cookie
def board(request, board_id=None):
    if board_id is None:
        first_board = Board.objects.order_by('created_at').first()
        if first_board is None:
            first_board = Board.objects.create(name='Tablero 1')
        return redirect('board-detail', board_id=first_board.id)
    get_object_or_404(Board, pk=board_id)
    return render(request, 'ideas/board.html', {'board_id': board_id})


class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer


class IdeaViewSet(viewsets.ModelViewSet):
    serializer_class = IdeaSerializer

    def get_queryset(self):
        queryset = Idea.objects.all()
        board_id = self.request.query_params.get('board')
        if board_id is not None:
            queryset = queryset.filter(board_id=board_id)
        return queryset
