from rest_framework import serializers
from django.db.models import Q
from .models import Conversation, Message, Participant
from apps.accounts.serializers import UserSerializer


class ParticipantSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Participant
        fields = ['id', 'user', 'user_details', 'last_read', 'is_typing', 'joined_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_details', 'content',
                  'file', 'file_name', 'is_read', 'read_by', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    participants_details = UserSerializer(source='participants', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'name', 'type', 'participants', 'participants_details',
                  'created_by', 'created_at', 'updated_at', 'last_message', 'unread_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context.get('request').user
        return obj.messages.filter(
            ~Q(read_by=user),
            ~Q(sender=user)
        ).count()


class ConversationDetailSerializer(ConversationSerializer):
    messages = MessageSerializer(source='messages', many=True, read_only=True)

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ['messages']