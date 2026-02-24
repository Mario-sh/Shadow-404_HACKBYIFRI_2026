from rest_framework import serializers
from .models import SuggestionExercice, StatistiqueApprentissage
from apps.academic.serializers import EtudiantSerializer, BanqueExercicesSerializer, MatiereSerializer


class SuggestionExerciceSerializer(serializers.ModelSerializer):
    etudiant_details = EtudiantSerializer(source='etudiant', read_only=True)
    exercice_details = BanqueExercicesSerializer(source='exercice', read_only=True)
    matiere_details = MatiereSerializer(source='matiere', read_only=True)

    class Meta:
        model = SuggestionExercice
        fields = [
            'id_suggestion', 'etudiant', 'etudiant_details',
            'exercice', 'exercice_details', 'matiere', 'matiere_details',
            'note_actuelle', 'raison', 'niveau_suggere',
            'date_suggestion', 'est_consultee', 'est_faite'
        ]
        read_only_fields = ['id_suggestion', 'date_suggestion']


class StatistiqueApprentissageSerializer(serializers.ModelSerializer):
    etudiant_details = EtudiantSerializer(source='etudiant', read_only=True)
    matiere_details = MatiereSerializer(source='matiere', read_only=True)

    class Meta:
        model = StatistiqueApprentissage
        fields = [
            'etudiant', 'etudiant_details', 'matiere', 'matiere_details',
            'moyenne', 'exercices_realises', 'exercices_reussis',
            'taux_reussite', 'date_mise_a_jour'
        ]
        read_only_fields = ['date_mise_a_jour']