from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """Liste des notifications de l'utilisateur connecté"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            destinataire=self.request.user
        ).order_by('-date_creation')


class NotificationNonLuesView(generics.ListAPIView):
    """Notifications non lues uniquement"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            destinataire=self.request.user,
            est_lu=False
        ).order_by('-date_creation')


class MarquerNotificationLuView(APIView):
    """Marquer une notification spécifique comme lue"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, destinataire=request.user)
        notification.est_lu = True
        notification.date_lecture = timezone.now()
        notification.save()
        return Response({'message': 'Notification marquée comme lue'})


class MarquerToutLuView(APIView):
    """Marquer toutes les notifications comme lues"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            destinataire=request.user,
            est_lu=False
        ).update(est_lu=True, date_lecture=timezone.now())
        return Response({'message': 'Toutes les notifications ont été marquées comme lues'})