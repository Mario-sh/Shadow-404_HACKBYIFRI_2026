# apps/ai_engine/admin.py
from django.contrib import admin
from .models import ModeleIA, SuggestionExercice, StatistiqueApprentissage

@admin.register(ModeleIA)
class ModeleIAAdmin(admin.ModelAdmin):
    list_display = ('nom', 'precision', 'actif', 'date_creation')
    list_filter = ('actif',)
    search_fields = ('nom', 'description')

@admin.register(SuggestionExercice)
class SuggestionExerciceAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'exercice', 'note_actuelle', 'date_suggestion', 'est_consultee', 'est_faite')
    list_filter = ('est_consultee', 'est_faite', 'niveau_suggere')
    search_fields = ('etudiant__nom', 'etudiant__prenom', 'exercice__titre')
    date_hierarchy = 'date_suggestion'

@admin.register(StatistiqueApprentissage)
class StatistiqueApprentissageAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'moyenne', 'taux_reussite')
    list_filter = ('matiere',)
    search_fields = ('etudiant__nom', 'etudiant__prenom')