from rest_framework import serializers
from .models import Log, LogStats


class LogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = Log
        fields = ['id', 'user', 'username', 'level', 'type', 'message', 'details',
                  'ip_address', 'user_agent', 'path', 'method', 'status_code', 'created_at']
        read_only_fields = ['id', 'created_at']


class LogStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogStats
        fields = '__all__'