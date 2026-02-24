from django.db import models
from apps.accounts.models import User


class Event(models.Model):
    TYPE_CHOICES = (
        ('cours', 'Cours'),
        ('examen', 'Examen'),
        ('tp', 'TP'),
        ('reunion', 'Réunion'),
        ('devoir', 'Devoir'),
        ('autre', 'Autre'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='cours')
    date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    professor = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events_event'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%d/%m/%Y')}"