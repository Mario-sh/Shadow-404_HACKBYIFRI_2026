from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('etudiant', 'Étudiant'),
        ('professeur', 'Enseignant'),
        ('admin', 'Administrateur'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='etudiant')
    filiere = models.CharField(max_length=100, blank=True)
    niveau = models.CharField(max_length=50, blank=True)
    numero_etudiant = models.CharField(max_length=20, unique=True, null=True, blank=True)
    telephone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"