from rest_framework import serializers
from .models import PerformanceStat, ClasseStat, GlobalStat


class PerformanceStatSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source='etudiant.nom', read_only=True)
    etudiant_prenom = serializers.CharField(source='etudiant.prenom', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom_matière', read_only=True)

    class Meta:
        model = PerformanceStat
        fields = ['id', 'etudiant', 'etudiant_nom', 'etudiant_prenom', 'matiere', 'matiere_nom',
                  'moyenne', 'progression', 'nb_notes', 'nb_exercices', 'taux_reussite',
                  'temps_moyen', 'date_calcul']


class ClasseStatSerializer(serializers.ModelSerializer):
    classe_nom = serializers.CharField(source='classe.nom_class', read_only=True)

    class Meta:
        model = ClasseStat
        fields = ['id', 'classe', 'classe_nom', 'moyenne_generale', 'taux_reussite',
                  'nb_etudiants', 'nb_notes', 'meilleure_matiere', 'matiere_faible',
                  'distribution', 'date_calcul']


class GlobalStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalStat
        fields = '__all__'