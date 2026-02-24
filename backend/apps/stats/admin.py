from django.contrib import admin
from .models import PerformanceStat, ClasseStat, GlobalStat

@admin.register(PerformanceStat)
class PerformanceStatAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'moyenne', 'progression', 'date_calcul')
    list_filter = ('date_calcul', 'matiere')
    search_fields = ('etudiant__nom', 'etudiant__prenom')
    raw_id_fields = ('etudiant', 'matiere')
    date_hierarchy = 'date_calcul'

@admin.register(ClasseStat)
class ClasseStatAdmin(admin.ModelAdmin):
    list_display = ('classe', 'moyenne_generale', 'taux_reussite', 'nb_etudiants', 'date_calcul')
    list_filter = ('date_calcul',)
    search_fields = ('classe__nom_class',)
    raw_id_fields = ('classe',)
    date_hierarchy = 'date_calcul'

@admin.register(GlobalStat)
class GlobalStatAdmin(admin.ModelAdmin):
    list_display = ('date_calcul', 'total_etudiants', 'total_professeurs', 'moyenne_generale', 'connexions_jour')
    list_filter = ('date_calcul',)
    date_hierarchy = 'date_calcul'