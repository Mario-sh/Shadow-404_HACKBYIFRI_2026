from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from .services import NotificationService


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(destinataire=self.request.user)

    @action(detail=False, methods=['get'])
    def non_lues(self, request):
        """Récupère les notifications non lues"""
        notifications = NotificationService.get_notifications_non_lues(request.user)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def marquer_tout_lu(self, request):
        """Marque toutes les notifications comme lues"""
        NotificationService.marquer_tout_comme_lu(request.user)
        return Response({"message": "Toutes les notifications ont été marquées comme lues"})

    @action(detail=True, methods=['post'])
    def marquer_lu(self, request, pk=None):
        """Marque une notification spécifique comme lue"""
        notification = self.get_object()
        notification.marquer_comme_lu()
        return Response({"message": "Notification marquée comme lue"})