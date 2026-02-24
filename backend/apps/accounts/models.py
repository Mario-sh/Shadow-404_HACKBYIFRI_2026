from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('etudiant', 'Étudiant'),
        ('professeur', 'Professeur'),
        ('admin', 'Administrateur'),
    )

    NIVEAU_CHOICES = (
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3', 'Licence 3'),
        ('M1', 'Master 1'),
        ('M2', 'Master 2'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='etudiant')
    filiere = models.CharField(max_length=100, blank=True)
    niveau = models.CharField(max_length=50, choices=NIVEAU_CHOICES, blank=True)
    numero_etudiant = models.CharField(max_length=20, unique=True, null=True, blank=True)
    telephone = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False)  # Pour les professeurs


    def __str__(self):
        return f"{self.username} ({self.role})"