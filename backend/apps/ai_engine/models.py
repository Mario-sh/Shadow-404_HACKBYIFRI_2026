from django.db import models
# Ne pas importer directement depuis academic.models
# Utilisez des chaînes de caractères pour les ForeignKey

class SuggestionExercice(models.Model):
    NIVEAUX = (
        (1, 'Facile'),
        (2, 'Moyen'),
        (3, 'Difficile'),
    )

    id_suggestion = models.AutoField(primary_key=True)
    # Utilisez des chaînes pour éviter les imports circulaires
    etudiant = models.ForeignKey('academic.Etudiant', on_delete=models.CASCADE)
    exercice = models.ForeignKey('academic.BanqueExercices', on_delete=models.CASCADE)
    matiere = models.ForeignKey('academic.Matiere', on_delete=models.CASCADE, null=True)
    note_actuelle = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    raison = models.TextField()
    niveau_suggere = models.IntegerField(choices=NIVEAUX)
    date_suggestion = models.DateTimeField(auto_now_add=True)
    est_consultee = models.BooleanField(default=False)
    est_faite = models.BooleanField(default=False)

    class Meta:
        db_table = 'suggestion_exercice'

    def __str__(self):
        return f"Suggestion pour {self.etudiant_id}"


class StatistiqueApprentissage(models.Model):
    etudiant = models.ForeignKey('academic.Etudiant', on_delete=models.CASCADE)
    matiere = models.ForeignKey('academic.Matiere', on_delete=models.CASCADE)
    moyenne = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    exercices_realises = models.IntegerField(default=0)
    exercices_reussis = models.IntegerField(default=0)
    taux_reussite = models.FloatField(default=0.0)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'statistique_apprentissage'
        unique_together = ['etudiant', 'matiere']

    def __str__(self):
        return f"Stats {self.etudiant_id} - {self.matiere_id}"