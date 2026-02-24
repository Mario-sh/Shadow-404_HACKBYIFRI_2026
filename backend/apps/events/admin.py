from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'date', 'user', 'location')
    list_filter = ('type', 'user')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'date'
    raw_id_fields = ('user',)