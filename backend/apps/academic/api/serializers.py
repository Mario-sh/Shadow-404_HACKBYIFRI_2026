import os
from rest_framework import serializers
from ..models import *


# ------------------------------------------------------------
# SERIALIZER ADMINISTRATEUR
# ------------------------------------------------------------
class AdministrateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrateur
        fields = ['id_admin', 'nom', 'prenom', 'email', 'created_at']
        read_only_fields = ['id_admin', 'created_at']


# ------------------------------------------------------------
# SERIALIZER CLASSE
# ------------------------------------------------------------
class ClasseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classe
        fields = ['id_classe', 'nom_class', 'niveau', 'created_at']
        read_only_fields = ['id_classe', 'created_at']


# ------------------------------------------------------------
# SERIALIZER PROFESSEUR
# ------------------------------------------------------------
class ProfesseurSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Professeur
        fields = ['id_professeur', 'nom_prof', 'prenom_prof', 'full_name', 'email', 'specialite', 'created_at']
        read_only_fields = ['id_professeur', 'created_at']

    def get_full_name(self, obj):
        return f"{obj.prenom_prof} {obj.nom_prof}"


# ------------------------------------------------------------
# SERIALIZER ETUDIANT
# ------------------------------------------------------------
class EtudiantSerializer(serializers.ModelSerializer):
    classe_nom = serializers.CharField(source='classe.nom_class', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Etudiant
        fields = [
            'id_student', 'matricule', 'nom', 'prenom', 'full_name',
            'email', 'date_inscription', 'classe', 'classe_nom', 'created_at'
        ]
        read_only_fields = ['id_student', 'created_at']

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"


# ------------------------------------------------------------
# SERIALIZER MATIERE
# ------------------------------------------------------------
class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id_matiere', 'nom_matière', 'coefficient', 'created_at']
        read_only_fields = ['id_matiere', 'created_at']


# ------------------------------------------------------------
# SERIALIZER BANQUE EXERCICES (AVEC VALIDATION FICHIER)
# ------------------------------------------------------------
class BanqueExercicesSerializer(serializers.ModelSerializer):
    subject_nom = serializers.CharField(source='subject.nom_matière', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par.prenom_prof', read_only=True)

    class Meta:
        model = BanqueExercices
        fields = [
            'id_exercice', 'subject', 'subject_nom', 'titre',
            'niveau_difficulte', 'fichier_url', 'cree_par', 'cree_par_nom', 'created_at'
        ]
        read_only_fields = ['id_exercice', 'created_at']

    def validate_fichier_url(self, value):
        """
        Validation personnalisée pour les fichiers d'exercices
        """
        # Vérifier l'extension
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.pdf', '.docx', '.txt', '.md', '.jpg', '.png']

        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Extension '{ext}' non supportée. Extensions autorisées: {', '.join(valid_extensions)}"
            )

        # Vérifier la taille (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Fichier trop volumineux ({value.size / (1024 * 1024):.1f}MB). Maximum: 10MB"
            )

        return value


# ------------------------------------------------------------
# SERIALIZER NOTE (avec validation)
# ------------------------------------------------------------
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
        """Validation personnalisée pour la note (0-20)"""
        if value < 0 or value > 20:
            raise serializers.ValidationError("La note doit être comprise entre 0 et 20")
        return value

    def validate_date_note(self, value):
        """Empêcher les dates futures"""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("La date de la note ne peut pas être dans le futur")
        return value


# ------------------------------------------------------------
# SERIALIZER RESSOURCE (AVEC VALIDATION FICHIER)
# ------------------------------------------------------------
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

    def validate_fichier_url(self, value):
        """
        Validation personnalisée pour les fichiers de ressources
        """
        ext = os.path.splitext(value.name)[1].lower()

        # Extensions autorisées selon le type
        pdf_extensions = ['.pdf']
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg']
        document_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt']

        # Déterminer les extensions autorisées en fonction du type de ressource
        type_ressource = self.initial_data.get('Type_ressource') if hasattr(self, 'initial_data') else None

        if type_ressource == 'pdf':
            valid_extensions = pdf_extensions
            max_size = 20 * 1024 * 1024  # 20MB pour PDF
        elif type_ressource == 'video':
            valid_extensions = video_extensions
            max_size = 100 * 1024 * 1024  # 100MB pour vidéos
        elif type_ressource == 'lien':
            # Pour les liens, on ne valide pas le fichier
            return value
        else:  # document par défaut
            valid_extensions = document_extensions + image_extensions
            max_size = 20 * 1024 * 1024  # 20MB

        # Vérifier l'extension
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Extension '{ext}' non supportée pour le type '{type_ressource}'. "
                f"Extensions autorisées: {', '.join(valid_extensions)}"
            )

        # Vérifier la taille
        if value.size > max_size:
            size_mb = value.size / (1024 * 1024)
            max_size_mb = max_size / (1024 * 1024)
            raise serializers.ValidationError(
                f"Fichier trop volumineux ({size_mb:.1f}MB). Maximum: {max_size_mb:.0f}MB"
            )

        return value

    def validate(self, data):
        """
        Validation croisée entre le type de ressource et le fichier
        """
        type_ressource = data.get('Type_ressource')
        fichier_url = data.get('fichier_url')

        # Si c'est un lien, fichier_url doit être une URL valide
        if type_ressource == 'lien' and fichier_url:
            # Vérifier que c'est une URL valide
            import re
            url_pattern = re.compile(
                r'^https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$')
            if not url_pattern.match(str(fichier_url)):
                raise serializers.ValidationError({"fichier_url": "Veuillez fournir une URL valide pour un lien"})

        return data


# ------------------------------------------------------------
# SERIALIZER POUR LES STATISTIQUES D'UN ETUDIANT
# ------------------------------------------------------------
class StatistiqueEtudiantSerializer(serializers.Serializer):
    """Serializer personnalisé pour les stats (pas lié à un modèle)"""
    total_notes = serializers.IntegerField()
    moyenne_generale = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    matiere_forte = serializers.CharField(allow_null=True)
    matiere_faible = serializers.CharField(allow_null=True)
    notes_par_matiere = serializers.DictField()


# ------------------------------------------------------------
# SERIALIZER POUR LES SUGGESTIONS D'EXERCICES (IA)
# ------------------------------------------------------------
class SuggestionExerciceSerializer(serializers.Serializer):
    """Pour retourner les suggestions IA au frontend"""
    etudiant_id = serializers.IntegerField()
    etudiant_nom = serializers.CharField()
    matiere = serializers.CharField()
    note_actuelle = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    exercices_suggere = serializers.ListField(child=serializers.DictField())
    raison = serializers.CharField()


# ------------------------------------------------------------
# SERIALIZER POUR L'IMPORT EN MASSE DE NOTES
# ------------------------------------------------------------
class NoteBulkImportSerializer(serializers.Serializer):
    """Pour importer plusieurs notes à la fois"""
    notes = NoteSerializer(many=True)

    def validate_notes(self, value):
        if len(value) == 0:
            raise serializers.ValidationError("Au moins une note doit être fournie")
        if len(value) > 100:
            raise serializers.ValidationError("Maximum 100 notes par import")
        return value


# ------------------------------------------------------------
# SERIALIZER POUR LA RECHERCHE AVANCÉE
# ------------------------------------------------------------
class RechercheAvanceeSerializer(serializers.Serializer):
    """Pour les paramètres de recherche avancée"""
    query = serializers.CharField(required=False, allow_blank=True)
    matiere_id = serializers.IntegerField(required=False)
    classe_id = serializers.IntegerField(required=False)
    date_debut = serializers.DateField(required=False)
    date_fin = serializers.DateField(required=False)
    note_min = serializers.DecimalField(max_digits=4, decimal_places=2, required=False)
    note_max = serializers.DecimalField(max_digits=4, decimal_places=2, required=False)
    type_evaluation = serializers.ChoiceField(choices=['devoir', 'examen', 'tp'], required=False)
    valide = serializers.BooleanField(required=False)