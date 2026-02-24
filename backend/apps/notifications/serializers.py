from rest_framework import serializers
from django.utils import timezone
from .models import Notification
from apps.accounts.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    destinataire_details = UserSerializer(source='destinataire', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id_notification', 'destinataire', 'destinataire_details',
            'type', 'type_display', 'titre', 'message',
            'est_lu', 'est_envoye', 'date_creation', 'date_lecture'
        ]
        read_only_fields = ['id_notification', 'date_creation', 'date_lecture']