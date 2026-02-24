from rest_framework import serializers
from .models import (
    Etudiant, Professeur, Classe, Matiere,
    Note, Ressource, BanqueExercices, Administrateur
)


class ClasseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classe
        fields = ['id_classe', 'nom_class', 'niveau', 'created_at']
        read_only_fields = ['id_classe', 'created_at']


class EtudiantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    classe_nom = serializers.CharField(source='classe.nom_class', read_only=True)

    class Meta:
        model = Etudiant
        fields = [
            'id_student', 'matricule', 'nom', 'prenom', 'full_name',
            'email', 'date_inscription', 'classe', 'classe_nom', 'user', 'created_at'
        ]
        read_only_fields = ['id_student', 'created_at']

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"


class ProfesseurSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Professeur
        fields = [
            'id_professeur', 'nom_prof', 'prenom_prof', 'full_name',
            'email', 'specialite', 'created_at'
        ]
        read_only_fields = ['id_professeur', 'created_at']

    def get_full_name(self, obj):
        return f"{obj.prenom_prof} {obj.nom_prof}"


class AdministrateurSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Administrateur
        fields = [
            'id_admin', 'nom', 'prenom', 'full_name',
            'email', 'created_at'
        ]
        read_only_fields = ['id_admin', 'created_at']
        extra_kwargs = {'mot_de_passe': {'write_only': True}}

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"


class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id_matiere', 'nom_matière', 'coefficient', 'created_at']
        read_only_fields = ['id_matiere', 'created_at']


class NoteSerializer(serializers.ModelSerializer):
    student_nom = serializers.CharField(source='student.nom', read_only=True)
    student_prenom = serializers.CharField(source='student.prenom', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom_matière', read_only=True)
    admin_nom = serializers.CharField(source='admin.nom', read_only=True)

    class Meta:
        model = Note
        fields = [
            'id_note', 'student', 'student_nom', 'student_prenom',
            'matiere', 'matiere_nom', 'admin', 'admin_nom',
            'type_evaluation', 'valeur_note', 'date_note', 'valide', 'created_at'
        ]
        read_only_fields = ['id_note', 'created_at']

    def validate_valeur_note(self, value):
        if value < 0 or value > 20:
            raise serializers.ValidationError("La note doit être comprise entre 0 et 20")
        return value


class RessourceSerializer(serializers.ModelSerializer):
    matiere_nom = serializers.CharField(source='matiere.nom_matière', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par_admin.nom', read_only=True)

    class Meta:
        model = Ressource
        fields = [
            'id_ressource', 'matiere', 'matiere_nom', 'titre', 'description',
            'Type_ressource', 'fichier_url', 'cree_par_admin', 'cree_par_nom', 'created_at'
        ]
        read_only_fields = ['id_ressource', 'created_at']


class BanqueExercicesSerializer(serializers.ModelSerializer):
    subject_nom = serializers.CharField(source='subject.nom_matière', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par.nom_prof', read_only=True)
    difficulte_label = serializers.SerializerMethodField()

    class Meta:
        model = BanqueExercices
        fields = [
            'id_exercice', 'subject', 'subject_nom', 'titre',
            'niveau_difficulte', 'difficulte_label', 'fichier_url',
            'cree_par', 'cree_par_nom', 'created_at'
        ]
        read_only_fields = ['id_exercice', 'created_at']

    def get_difficulte_label(self, obj):
        return dict(BanqueExercices.NIVEAUX_DIFFICULTE).get(obj.niveau_difficulte, '')