from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.academic.models import Etudiant, Matiere, Note, Professeur, Classe


class PerformanceStat(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name='performance_stats')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, null=True, blank=True)
    moyenne = models.FloatField(null=True, blank=True)
    progression = models.FloatField(default=0)  # en pourcentage
    nb_notes = models.IntegerField(default=0)
    nb_exercices = models.IntegerField(default=0)
    taux_reussite = models.FloatField(default=0)  # en pourcentage
    temps_moyen = models.IntegerField(default=0)  # en minutes
    date_calcul = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'stats_performance'
        unique_together = ['etudiant', 'matiere', 'date_calcul']
        indexes = [
            models.Index(fields=['etudiant', 'date_calcul']),
        ]

    def __str__(self):
        return f"Stats {self.etudiant} - {self.date_calcul}"


class ClasseStat(models.Model):
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='stats')
    moyenne_generale = models.FloatField(null=True, blank=True)
    taux_reussite = models.FloatField(default=0)
    nb_etudiants = models.IntegerField(default=0)
    nb_notes = models.IntegerField(default=0)
    meilleure_matiere = models.CharField(max_length=100, blank=True)
    matiere_faible = models.CharField(max_length=100, blank=True)
    distribution = models.JSONField(default=dict)  # {'excellent': 5, 'bon': 10, ...}
    date_calcul = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'stats_classe'
        unique_together = ['classe', 'date_calcul']

    def __str__(self):
        return f"Stats {self.classe} - {self.date_calcul}"


class GlobalStat(models.Model):
    total_etudiants = models.IntegerField(default=0)
    total_professeurs = models.IntegerField(default=0)
    total_classes = models.IntegerField(default=0)
    total_matieres = models.IntegerField(default=0)
    total_notes = models.IntegerField(default=0)
    moyenne_generale = models.FloatField(null=True, blank=True)
    taux_reussite_global = models.FloatField(default=0)
    utilisateurs_actifs = models.IntegerField(default=0)
    connexions_jour = models.IntegerField(default=0)
    date_calcul = models.DateField(auto_now_add=True, unique=True)

    class Meta:
        db_table = 'stats_global'
        ordering = ['-date_calcul']

    def __str__(self):
        return f"Stats globales du {self.date_calcul}"