from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'user', 'title', 'type', 'date', 'end_date',
                  'location', 'professor', 'description', 'color',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']