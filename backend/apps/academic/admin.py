from django.contrib import admin
from .models import (
    Etudiant, Professeur, Administrateur, Classe,
    Matiere, Note, BanqueExercices, Ressource  # 👈 Ajoutez Ressource ici
)

@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'nom', 'prenom', 'email', 'classe', 'user')
    list_filter = ('classe',)
    search_fields = ('nom', 'prenom', 'matricule', 'email')

@admin.register(Professeur)
class ProfesseurAdmin(admin.ModelAdmin):
    list_display = ('nom_prof', 'prenom_prof', 'email', 'specialite')
    search_fields = ('nom_prof', 'prenom_prof', 'email')

@admin.register(Administrateur)
class AdministrateurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'email')
    search_fields = ('nom', 'prenom', 'email')

@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ('nom_class', 'niveau')
    search_fields = ('nom_class', 'niveau')

@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ('nom_matière', 'coefficient')
    search_fields = ('nom_matière',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('student', 'matiere', 'valeur_note', 'date_note', 'valide')
    list_filter = ('valide', 'type_evaluation', 'matiere')
    search_fields = ('student__nom', 'student__prenom')

@admin.register(BanqueExercices)
class BanqueExercicesAdmin(admin.ModelAdmin):
    list_display = ('titre', 'subject', 'niveau_difficulte', 'created_at')
    list_filter = ('niveau_difficulte', 'subject')
    search_fields = ('titre',)

@admin.register(Ressource)  # 👈 Maintenant Ressource est défini
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'matiere', 'Type_ressource', 'created_at')
    list_filter = ('Type_ressource', 'matiere')
    search_fields = ('titre', 'description')