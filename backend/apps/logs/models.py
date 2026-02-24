from django.db import models
from apps.accounts.models import User


class Log(models.Model):
    LEVEL_CHOICES = (
        ('info', 'Information'),
        ('success', 'Succès'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
        ('debug', 'Debug'),
    )

    TYPE_CHOICES = (
        ('auth', 'Authentification'),
        ('user', 'Utilisateur'),
        ('system', 'Système'),
        ('data', 'Données'),
        ('api', 'API'),
        ('security', 'Sécurité'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name='logs_logs')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='info')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    message = models.TextField()
    details = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    path = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'logs_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['level']),
            models.Index(fields=['type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"[{self.level}] {self.message[:50]}"


class LogStats(models.Model):
    date = models.DateField(unique=True)
    total_count = models.IntegerField(default=0)
    info_count = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    warning_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    debug_count = models.IntegerField(default=0)
    auth_count = models.IntegerField(default=0)
    api_count = models.IntegerField(default=0)
    unique_users = models.IntegerField(default=0)

    class Meta:
        db_table = 'logs_stats'
        ordering = ['-date']

    def __str__(self):
        return f"Stats du {self.date}"