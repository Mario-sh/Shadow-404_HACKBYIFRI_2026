from django.db import models
from apps.academic.models import Etudiant, BanqueExercices, Note, Matiere


class ModeleIA(models.Model):
    """Enregistre les modèles d'IA entraînés"""
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    fichier_modele = models.FileField(upload_to='modeles_ia/', null=True, blank=True)
    precision = models.FloatField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    actif = models.BooleanField(default=False)

    class Meta:
        db_table = 'modele_ia'
        verbose_name = "Modèle IA"
        verbose_name_plural = "Modèles IA"

    def __str__(self):
        return f"{self.nom} - {self.date_creation.strftime('%d/%m/%Y')}"


class SuggestionExercice(models.Model):
    """Suggestions d'exercices pour les étudiants"""
    id_suggestion = models.AutoField(primary_key=True)
    etudiant = models.ForeignKey('academic.Etudiant', on_delete=models.CASCADE, related_name='suggestions')
    exercice = models.ForeignKey('academic.BanqueExercices', on_delete=models.CASCADE)
    matiere = models.ForeignKey('academic.Matiere', on_delete=models.CASCADE, null=True)
    note_actuelle = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    raison = models.TextField()
    niveau_suggere = models.IntegerField(choices=[(1, 'Facile'), (2, 'Moyen'), (3, 'Difficile')])
    date_suggestion = models.DateTimeField(auto_now_add=True)
    est_consultee = models.BooleanField(default=False)
    est_faite = models.BooleanField(default=False)

    class Meta:
        db_table = 'suggestion_exercice'
        ordering = ['-date_suggestion']

    def __str__(self):
        return f"{self.etudiant} → {self.exercice.titre}"


class StatistiqueApprentissage(models.Model):
    """Suivi des progrès des étudiants"""
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    moyenne = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    exercices_realises = models.IntegerField(default=0)
    exercices_reussis = models.IntegerField(default=0)
    taux_reussite = models.FloatField(default=0.0)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'statistique_apprentissage'
        unique_together = ['etudiant', 'matiere']

    def __str__(self):
        return f"{self.etudiant} - {self.matiere} - {self.taux_reussite}%"