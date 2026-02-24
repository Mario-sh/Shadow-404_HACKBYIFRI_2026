from django.contrib import admin
from .models import SuggestionExercice, StatistiqueApprentissage

@admin.register(SuggestionExercice)
class SuggestionExerciceAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'exercice', 'note_actuelle', 'date_suggestion', 'est_consultee')
    list_filter = ('est_consultee', 'est_faite', 'niveau_suggere')
    search_fields = ('etudiant__nom', 'etudiant__prenom', 'raison')
    readonly_fields = ('date_suggestion',)

@admin.register(StatistiqueApprentissage)
class StatistiqueApprentissageAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'moyenne', 'taux_reussite', 'date_mise_a_jour')
    list_filter = ('matiere',)
    search_fields = ('etudiant__nom', 'etudiant__prenom')
    readonly_fields = ('date_mise_a_jour',)