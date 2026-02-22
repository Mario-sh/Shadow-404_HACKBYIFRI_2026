from django.contrib import admin
from .models import *

@admin.register(Administrateur)
class AdministrateurAdmin(admin.ModelAdmin):
    list_display = ('id_admin', 'nom', 'prenom', 'email')
    search_fields = ('nom', 'prenom', 'email')

@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ('id_classe', 'nom_class', 'niveau')
    search_fields = ('nom_class', 'niveau')

@admin.register(Professeur)
class ProfesseurAdmin(admin.ModelAdmin):
    list_display = ('id_professeur', 'nom_prof', 'prenom_prof', 'email', 'specialite')
    search_fields = ('nom_prof', 'prenom_prof', 'email')

@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'nom', 'prenom', 'email', 'classe', 'date_inscription')
    list_filter = ('classe',)
    search_fields = ('matricule', 'nom', 'prenom', 'email')

@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ('id_matiere', 'nom_matière', 'coefficient')
    search_fields = ('nom_matière',)

@admin.register(BanqueExercices)
class BanqueExercicesAdmin(admin.ModelAdmin):
    list_display = ('titre', 'subject', 'niveau_difficulte', 'cree_par', 'created_at')
    list_filter = ('subject', 'niveau_difficulte')
    search_fields = ('titre',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('student', 'matiere', 'type_evaluation', 'valeur_note', 'date_note', 'valide')
    list_filter = ('type_evaluation', 'valide', 'matiere')
    search_fields = ('student__nom', 'student__prenom', 'matiere__nom_matière')

@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'matiere', 'Type_ressource', 'cree_par_admin', 'created_at')
    list_filter = ('Type_ressource', 'matiere')
    search_fields = ('titre', 'description')