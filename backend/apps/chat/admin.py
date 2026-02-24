from django.contrib import admin
from .models import Conversation, Message, Participant

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('created_at',)

class ParticipantInline(admin.TabularInline):
    model = Participant
    extra = 0

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'created_by', 'created_at', 'updated_at')
    list_filter = ('type',)
    search_fields = ('name',)
    inlines = [ParticipantInline, MessageInline]
    raw_id_fields = ('created_by', 'participants')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('content',)
    raw_id_fields = ('conversation', 'sender', 'read_by')
    readonly_fields = ('created_at',)

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'user', 'is_typing', 'joined_at', 'last_read')
    list_filter = ('is_typing',)
    raw_id_fields = ('conversation', 'user')