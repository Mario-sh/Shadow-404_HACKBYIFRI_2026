from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User


class Notification(models.Model):
    TYPES = (
        ('suggestion', 'Suggestion d\'exercice'),
        ('rappel', 'Rappel'),
        ('info', 'Information'),
        ('alerte', 'Alerte'),
        ('validation', 'Validation de note'),
    )

    id_notification = models.AutoField(primary_key=True)
    destinataire = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPES)
    titre = models.CharField(max_length=200)
    message = models.TextField()

    # Pour lier à n'importe quel objet
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField(null=True)
    related_object = GenericForeignKey('content_type', 'object_id')

    est_lu = models.BooleanField(default=False)
    est_envoye = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_lecture = models.DateTimeField(null=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.titre}"