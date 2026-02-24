from django.contrib import admin
from .models import Log, LogStats

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('id', 'level', 'type', 'message', 'user', 'ip_address', 'created_at')
    list_filter = ('level', 'type', 'created_at')
    search_fields = ('message', 'details', 'ip_address', 'path')
    readonly_fields = ('created_at',)
    raw_id_fields = ('user',)
    date_hierarchy = 'created_at'

@admin.register(LogStats)
class LogStatsAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_count', 'error_count', 'warning_count', 'unique_users')
    list_filter = ('date',)
    readonly_fields = ('date',)