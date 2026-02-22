from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Notification(models.Model):
    TYPE_CHOICES = [
        ('suggestion', 'Suggestion d\'exercice'),
        ('rappel', 'Rappel'),
        ('info', 'Information'),
        ('alerte', 'Alerte'),
        ('validation', 'Note validée'),
    ]

    destinataire = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=200)
    message = models.TextField()

    # Pour lier à n'importe quel objet (suggestion, note, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')

    est_lu = models.BooleanField(default=False)
    est_envoye = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_lecture = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notification'
        ordering = ['-date_creation']

    def __str__(self):
        return f"[{self.get_type_display()}] {self.titre} - {self.destinataire.username}"

    def marquer_comme_lu(self):
        from django.utils import timezone
        self.est_lu = True
        self.date_lecture = timezone.now()
        self.save()