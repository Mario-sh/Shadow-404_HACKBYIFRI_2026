from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Q
from django.utils import timezone
from datetime import timedelta

# Import des permissions personnalisées
from apps.accounts.permissions.roles import IsProfesseurOrAdmin, IsAdmin, IsProfesseur, IsEtudiant

from ..models import *
from .serializers import *


# ------------------------------------------------------------
# VIEWSET ADMINISTRATEUR
# ------------------------------------------------------------
class AdministrateurViewSet(viewsets.ModelViewSet):
    """Gestion complète des administrateurs"""
    queryset = Administrateur.objects.all()
    serializer_class = AdministrateurSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Écriture : seulement les admins
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'prenom', 'email']


# ------------------------------------------------------------
# VIEWSET CLASSE
# ------------------------------------------------------------
class ClasseViewSet(viewsets.ModelViewSet):
    """Gestion complète des classes"""
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Écriture : seulement les admins
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['niveau']
    search_fields = ['nom_class', 'niveau']

    @action(detail=True, methods=['get'])
    def etudiants(self, request, pk=None):
        """Récupère tous les étudiants d'une classe"""
        classe = self.get_object()
        etudiants = Etudiant.objects.filter(classe=classe)
        serializer = EtudiantSerializer(etudiants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """Statistiques de la classe (moyennes, effectifs, etc.)"""
        classe = self.get_object()
        etudiants = Etudiant.objects.filter(classe=classe)

        # Récupérer toutes les notes des étudiants de la classe
        notes = Note.objects.filter(student__in=etudiants, valide=True)

        stats = {
            'classe': classe.nom_class,
            'effectif': etudiants.count(),
            'moyenne_classe': notes.aggregate(Avg('valeur_note'))['valeur_note__avg'],
            'nombre_notes': notes.count(),
        }

        return Response(stats)


# ------------------------------------------------------------
# VIEWSET PROFESSEUR
# ------------------------------------------------------------
class ProfesseurViewSet(viewsets.ModelViewSet):
    """Gestion complète des professeurs"""
    queryset = Professeur.objects.all()
    serializer_class = ProfesseurSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Écriture : admins uniquement
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['specialite']
    search_fields = ['nom_prof', 'prenom_prof', 'email', 'specialite']

    @action(detail=True, methods=['get'])
    def exercices_crees(self, request, pk=None):
        """Récupère les exercices créés par ce professeur"""
        professeur = self.get_object()
        exercices = BanqueExercices.objects.filter(cree_par=professeur)
        serializer = BanqueExercicesSerializer(exercices, many=True)
        return Response(serializer.data)


# ------------------------------------------------------------
# VIEWSET ETUDIANT
# ------------------------------------------------------------
class EtudiantViewSet(viewsets.ModelViewSet):
    """Gestion complète des étudiants"""
    queryset = Etudiant.objects.all().select_related('classe')
    serializer_class = EtudiantSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Création/modification : professeurs ou admins
        - Suppression : admins uniquement
        """
        if self.action == 'destroy':
            permission_classes = [IsAdmin]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsProfesseurOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['classe']
    search_fields = ['matricule', 'nom', 'prenom', 'email']

    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Récupère toutes les notes d'un étudiant"""
        etudiant = self.get_object()
        notes = Note.objects.filter(student=etudiant).select_related('matiere')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """Calcule les statistiques d'un étudiant"""
        etudiant = self.get_object()
        notes = Note.objects.filter(student=etudiant, valide=True)

        if not notes.exists():
            return Response({"message": "Aucune note disponible"}, status=status.HTTP_404_NOT_FOUND)

        # Calculs
        total_notes = notes.count()
        moyenne = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']

        # Notes par matière
        notes_par_matiere = {}
        for note in notes:
            matiere = note.matiere.nom_matière
            if matiere not in notes_par_matiere:
                notes_par_matiere[matiere] = []
            notes_par_matiere[matiere].append(float(note.valeur_note))

        # Moyenne par matière
        moyennes = {
            matiere: sum(vals) / len(vals)
            for matiere, vals in notes_par_matiere.items()
        }

        # Matière forte et faible
        matiere_forte = max(moyennes, key=moyennes.get) if moyennes else None
        matiere_faible = min(moyennes, key=moyennes.get) if moyennes else None

        data = {
            'etudiant_id': etudiant.id_student,
            'etudiant_nom': f"{etudiant.prenom} {etudiant.nom}",
            'total_notes': total_notes,
            'moyenne_generale': round(moyenne, 2) if moyenne else None,
            'matiere_forte': matiere_forte,
            'matiere_faible': matiere_faible,
            'moyennes_par_matiere': moyennes
        }

        return Response(data)

    @action(detail=True, methods=['get'])
    def suggestions(self, request, pk=None):
        """Récupère les suggestions d'exercices pour cet étudiant"""
        etudiant = self.get_object()
        suggestions = SuggestionExercice.objects.filter(
            etudiant=etudiant
        ).select_related('exercice', 'matiere').order_by('-date_suggestion')[:10]

        data = []
        for sugg in suggestions:
            data.append({
                'id_suggestion': sugg.id_suggestion,
                'exercice': {
                    'id': sugg.exercice.id_exercice,
                    'titre': sugg.exercice.titre,
                    'niveau': sugg.exercice.niveau_difficulte
                },
                'matiere': sugg.matiere.nom_matière,
                'raison': sugg.raison,
                'date': sugg.date_suggestion,
                'consultee': sugg.est_consultee,
                'faite': sugg.est_faite
            })

        return Response(data)


# ------------------------------------------------------------
# VIEWSET MATIERE
# ------------------------------------------------------------
class MatiereViewSet(viewsets.ModelViewSet):
    """Gestion complète des matières"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Écriture : professeurs ou admins
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsProfesseurOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_matière']

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """Statistiques pour une matière"""
        matiere = self.get_object()
        notes = Note.objects.filter(matiere=matiere, valide=True)

        stats = {
            'matiere': matiere.nom_matière,
            'coefficient': matiere.coefficient,
            'nombre_notes': notes.count(),
            'moyenne': notes.aggregate(Avg('valeur_note'))['valeur_note__avg'],
            'meilleure_note': notes.order_by('-valeur_note').first().valeur_note if notes.exists() else None,
            'moins_bonne_note': notes.order_by('valeur_note').first().valeur_note if notes.exists() else None,
        }

        return Response(stats)


# ------------------------------------------------------------
# VIEWSET BANQUE EXERCICES
# ------------------------------------------------------------
class BanqueExercicesViewSet(viewsets.ModelViewSet):
    """Gestion complète des exercices"""
    queryset = BanqueExercices.objects.all().select_related('subject', 'cree_par')
    serializer_class = BanqueExercicesSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Création/modification : professeurs ou admins
        - Suppression : admins uniquement
        """
        if self.action == 'destroy':
            permission_classes = [IsAdmin]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsProfesseurOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['subject', 'niveau_difficulte']
    search_fields = ['titre']

    def perform_create(self, serializer):
        """Associe automatiquement le professeur connecté"""
        professeur = Professeur.objects.filter(email=self.request.user.email).first()
        if professeur:
            serializer.save(cree_par=professeur)


# ------------------------------------------------------------
# VIEWSET NOTE
# ------------------------------------------------------------
class NoteViewSet(viewsets.ModelViewSet):
    """Gestion complète des notes"""
    queryset = Note.objects.all().select_related('student', 'matiere', 'admin')
    serializer_class = NoteSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Création/modification : professeurs ou admins
        - Suppression : admins uniquement
        """
        if self.action == 'destroy':
            permission_classes = [IsAdmin]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsProfesseurOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'matiere', 'type_evaluation', 'valide']
    search_fields = ['student__nom', 'student__prenom', 'matiere__nom_matière']

    def perform_create(self, serializer):
        """Associe automatiquement l'admin connecté"""
        admin = Administrateur.objects.filter(email=self.request.user.email).first()
        if admin:
            serializer.save(admin=admin)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """Valider une note (la rendre officielle)"""
        note = self.get_object()
        note.valide = True
        note.save()

        # Créer une notification pour l'étudiant
        from apps.notifications.services import NotificationService
        NotificationService.notifier_note_validee(note)

        return Response({"message": "Note validée avec succès"})

    @action(detail=False, methods=['get'])
    def moyennes_par_matiere(self, request):
        """Calcule les moyennes pour chaque matière"""
        matieres = Matiere.objects.all()
        resultat = []

        for matiere in matieres:
            notes = Note.objects.filter(matiere=matiere, valide=True)
            moyenne = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']
            resultat.append({
                'matiere_id': matiere.id_matiere,
                'matiere_nom': matiere.nom_matière,
                'moyenne': round(moyenne, 2) if moyenne else None,
                'nombre_notes': notes.count()
            })

        return Response(resultat)


# ------------------------------------------------------------
# VIEWSET RESSOURCE
# ------------------------------------------------------------
class RessourceViewSet(viewsets.ModelViewSet):
    """Gestion complète des ressources pédagogiques"""
    queryset = Ressource.objects.all().select_related('matiere', 'cree_par_admin')
    serializer_class = RessourceSerializer

    def get_permissions(self):
        """
        - Lecture : tous les utilisateurs authentifiés
        - Création/modification : professeurs ou admins
        - Suppression : admins uniquement
        """
        if self.action == 'destroy':
            permission_classes = [IsAdmin]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsProfesseurOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['matiere', 'Type_ressource']
    search_fields = ['titre', 'description']

    def perform_create(self, serializer):
        """Associe automatiquement l'admin connecté"""
        admin = Administrateur.objects.filter(email=self.request.user.email).first()
        if admin:
            serializer.save(cree_par_admin=admin)

    @action(detail=True, methods=['post'])
    def incrementer_telechargement(self, request, pk=None):
        """Incrémente le compteur de téléchargements"""
        ressource = self.get_object()
        # Si tu veux ajouter un compteur de téléchargements
        # ressource.nb_telechargements += 1
        # ressource.save()
        return Response({"message": "Compteur mis à jour"})