from django.db import models
from apps.accounts.models import User


class Log(models.Model):
    LEVEL_CHOICES = (
        ('info', 'Information'),
        ('success', 'Succès'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
    )

    TYPE_CHOICES = (
        ('auth', 'Authentification'),
        ('user', 'Utilisateur'),
        ('system', 'Système'),
        ('data', 'Données'),
        ('api', 'API'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gestion_admin_logs'  # ← AJOUTEZ CETTE LIGNE
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='info')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    message = models.TextField()
    details = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    path = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'gestion_admin_log'

    def __str__(self):
        return f"[{self.level}] {self.message[:50]}"