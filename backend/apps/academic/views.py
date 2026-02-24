from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Max, Min, Count, Q
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from .models import (
    Etudiant, Professeur, Classe, Matiere,
    Note, Ressource, BanqueExercices, Administrateur
)
from .serializers import (
    EtudiantSerializer, ProfesseurSerializer, ClasseSerializer,
    MatiereSerializer, NoteSerializer, RessourceSerializer,
    BanqueExercicesSerializer, AdministrateurSerializer
)


# ==================== VUES POUR ÉTUDIANTS ====================

class EtudiantListCreateView(generics.ListCreateAPIView):
    """Liste et création des étudiants"""
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Etudiant.objects.all()
        classe = self.request.query_params.get('classe')
        if classe:
            queryset = queryset.filter(classe_id=classe)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(prenom__icontains=search) |
                Q(matricule__icontains=search)
            )
        return queryset


class EtudiantRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un étudiant"""
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_student'
    lookup_url_kwarg = 'pk'


class EtudiantByUserView(APIView):
    """Récupérer un étudiant à partir de l'ID utilisateur"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            etudiant = Etudiant.objects.get(user_id=user_id)
            serializer = EtudiantSerializer(etudiant)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Etudiant.DoesNotExist:
            return Response(
                {'error': 'Aucun étudiant lié à cet utilisateur'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EtudiantNotesView(generics.ListAPIView):
    """Liste des notes d'un étudiant spécifique"""
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Note.objects.none()
        etudiant_id = self.kwargs['pk']
        return Note.objects.filter(student_id=etudiant_id).select_related('matiere').order_by('-date_note')


class EtudiantStatistiquesView(APIView):
    """Statistiques complètes d'un étudiant"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            etudiant = Etudiant.objects.get(id_student=pk)
        except Etudiant.DoesNotExist:
            return Response(
                {'error': 'Étudiant non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        notes = Note.objects.filter(student=etudiant).select_related('matiere')

        if not notes.exists():
            return Response({
                'etudiant_id': pk,
                'etudiant_nom': f"{etudiant.prenom} {etudiant.nom}",
                'total_notes': 0,
                'moyenne_generale': None,
                'matiere_forte': None,
                'matiere_faible': None,
                'moyennes_par_matiere': {},
                'progression': 'stable'
            })

        # Moyenne générale
        moyenne_generale = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']

        # Calcul des moyennes par matière
        moyennes_par_matiere = {}
        for note in notes:
            matiere_nom = note.matiere.nom_matière
            if matiere_nom not in moyennes_par_matiere:
                moyennes_par_matiere[matiere_nom] = []
            moyennes_par_matiere[matiere_nom].append(float(note.valeur_note))

        moyennes = {}
        for matiere, notes_list in moyennes_par_matiere.items():
            moyennes[matiere] = round(sum(notes_list) / len(notes_list), 2)

        # Matière forte et faible
        matiere_forte = max(moyennes, key=moyennes.get) if moyennes else None
        matiere_faible = min(moyennes, key=moyennes.get) if moyennes else None

        # Progression
        progression = 'stable'
        trente_jours_avant = datetime.now().date() - timedelta(days=30)
        notes_recentes = notes.filter(date_note__gte=trente_jours_avant)
        notes_anciennes = notes.filter(date_note__lt=trente_jours_avant)

        if notes_recentes.exists() and notes_anciennes.exists():
            moy_recente = notes_recentes.aggregate(Avg('valeur_note'))['valeur_note__avg']
            moy_ancienne = notes_anciennes.aggregate(Avg('valeur_note'))['valeur_note__avg']

            if moy_recente and moy_ancienne:
                if moy_recente > moy_ancienne + 1:
                    progression = 'en_progres'
                elif moy_recente < moy_ancienne - 1:
                    progression = 'en_baisse'

        return Response({
            'etudiant_id': pk,
            'etudiant_nom': f"{etudiant.prenom} {etudiant.nom}",
            'total_notes': notes.count(),
            'moyenne_generale': round(moyenne_generale, 2) if moyenne_generale else None,
            'matiere_forte': matiere_forte,
            'matiere_faible': matiere_faible,
            'moyennes_par_matiere': moyennes,
            'progression': progression
        })


class EtudiantsEnDifficulteView(generics.ListAPIView):
    """Liste des étudiants en difficulté (moyenne < 10)"""
    serializer_class = EtudiantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        etudiants = Etudiant.objects.all()
        resultats = []
        for etudiant in etudiants:
            notes = Note.objects.filter(student=etudiant)
            if notes.exists():
                moyenne = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']
                if moyenne and moyenne < 10:
                    resultats.append(etudiant)
        return resultats


# ==================== VUES POUR NOTES ====================

class NoteListCreateView(generics.ListCreateAPIView):
    """Liste et création des notes"""
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Note.objects.all()
        student = self.request.query_params.get('student')
        matiere = self.request.query_params.get('matiere')
        type_eval = self.request.query_params.get('type_evaluation')
        valide = self.request.query_params.get('valide')

        if student:
            queryset = queryset.filter(student_id=student)
        if matiere:
            queryset = queryset.filter(matiere_id=matiere)
        if type_eval:
            queryset = queryset.filter(type_evaluation=type_eval)
        if valide is not None:
            queryset = queryset.filter(valide=valide.lower() == 'true')

        return queryset.select_related('student', 'matiere', 'admin').order_by('-date_note')


class NoteRecentesView(generics.ListAPIView):
    """Notes récentes (limite paramétrable)"""
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        limit = self.request.query_params.get('limit', 10)
        return Note.objects.all().select_related('student', 'matiere').order_by('-date_note')[:int(limit)]


class NoteRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une note"""
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_note'
    lookup_url_kwarg = 'pk'


class NoteValiderView(APIView):
    """Valider une note (la rendre officielle)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            note = Note.objects.get(id_note=pk)
        except Note.DoesNotExist:
            return Response(
                {'error': 'Note non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        note.valide = True
        note.save()

        return Response({
            'message': 'Note validée avec succès',
            'note': NoteSerializer(note).data
        })


class MoyennesParMatiereView(APIView):
    """Moyennes générales par matière"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        matieres = Matiere.objects.all()
        resultats = []
        for matiere in matieres:
            notes = Note.objects.filter(matiere=matiere)
            if notes.exists():
                moyenne = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']
                resultats.append({
                    'matiere_id': matiere.id_matiere,
                    'matiere_nom': matiere.nom_matière,
                    'moyenne': round(moyenne, 2) if moyenne else None,
                    'nombre_notes': notes.count()
                })
        return Response(resultats)


# ==================== VUES POUR CLASSES ====================

class ClasseListCreateView(generics.ListCreateAPIView):
    """Liste et création des classes"""
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClasseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une classe"""
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_classe'
    lookup_url_kwarg = 'pk'


class ClasseEtudiantsView(generics.ListAPIView):
    """Étudiants d'une classe spécifique"""
    serializer_class = EtudiantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        classe_id = self.kwargs['pk']
        return Etudiant.objects.filter(classe_id=classe_id)


class ClasseNotesView(generics.ListAPIView):
    """Notes de tous les étudiants d'une classe"""
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        classe_id = self.kwargs['pk']
        etudiants = Etudiant.objects.filter(classe_id=classe_id)
        return Note.objects.filter(student__in=etudiants).select_related('student', 'matiere').order_by('-date_note')


class ClasseStatistiquesView(APIView):
    """Statistiques d'une classe"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            classe = Classe.objects.get(id_classe=pk)
        except Classe.DoesNotExist:
            return Response(
                {'error': 'Classe non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        etudiants = Etudiant.objects.filter(classe=classe)
        notes = Note.objects.filter(student__in=etudiants)

        moyenne_classe = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']

        # Distribution des notes
        distribution = {
            'excellent': notes.filter(valeur_note__gte=16).count(),
            'bon': notes.filter(valeur_note__gte=12, valeur_note__lt=16).count(),
            'moyen': notes.filter(valeur_note__gte=10, valeur_note__lt=12).count(),
            'insuffisant': notes.filter(valeur_note__lt=10).count(),
        }

        # Meilleure matière
        matieres_stats = []
        for matiere in Matiere.objects.all():
            notes_matiere = notes.filter(matiere=matiere)
            if notes_matiere.exists():
                moy_matiere = notes_matiere.aggregate(Avg('valeur_note'))['valeur_note__avg']
                matieres_stats.append({
                    'nom': matiere.nom_matière,
                    'moyenne': round(moy_matiere, 2) if moy_matiere else None
                })

        matieres_stats.sort(key=lambda x: x['moyenne'] if x['moyenne'] else 0, reverse=True)

        return Response({
            'classe_id': pk,
            'classe_nom': classe.nom_class,
            'effectif': etudiants.count(),
            'moyenne_classe': round(moyenne_classe, 2) if moyenne_classe else None,
            'nombre_notes': notes.count(),
            'distribution': distribution,
            'meilleure_matiere': matieres_stats[0]['nom'] if matieres_stats else None,
            'matiere_faible': matieres_stats[-1]['nom'] if matieres_stats else None,
            'matieres': matieres_stats
        })


# ==================== VUES POUR MATIÈRES ====================

class MatiereListCreateView(generics.ListCreateAPIView):
    """Liste et création des matières"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [permissions.IsAuthenticated]


class MatiereRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une matière"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_matiere'
    lookup_url_kwarg = 'pk'


class MatiereStatistiquesView(APIView):
    """Statistiques d'une matière"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            matiere = Matiere.objects.get(id_matiere=pk)
        except Matiere.DoesNotExist:
            return Response(
                {'error': 'Matière non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        notes = Note.objects.filter(matiere=matiere)

        if not notes.exists():
            return Response({
                'matiere_id': pk,
                'matiere_nom': matiere.nom_matière,
                'moyenne': None,
                'meilleure_note': None,
                'pire_note': None,
                'nombre_notes': 0
            })

        stats = notes.aggregate(
            moyenne=Avg('valeur_note'),
            max=Max('valeur_note'),
            min=Min('valeur_note')
        )

        return Response({
            'matiere_id': pk,
            'matiere_nom': matiere.nom_matière,
            'moyenne': round(stats['moyenne'], 2) if stats['moyenne'] else None,
            'meilleure_note': stats['max'],
            'pire_note': stats['min'],
            'nombre_notes': notes.count()
        })


# ==================== VUES POUR EXERCICES ====================

class ExerciceListCreateView(generics.ListCreateAPIView):
    """Liste et création des exercices"""
    queryset = BanqueExercices.objects.all()
    serializer_class = BanqueExercicesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = BanqueExercices.objects.all()
        subject = self.request.query_params.get('subject')
        niveau = self.request.query_params.get('niveau_difficulte')

        if subject:
            queryset = queryset.filter(subject_id=subject)
        if niveau:
            queryset = queryset.filter(niveau_difficulte=niveau)

        return queryset.select_related('subject', 'cree_par')


class ExerciceRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un exercice"""
    queryset = BanqueExercices.objects.all()
    serializer_class = BanqueExercicesSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_exercice'
    lookup_url_kwarg = 'pk'


# ==================== VUES POUR RESSOURCES ====================

class RessourceListCreateView(generics.ListCreateAPIView):
    """Liste et création des ressources"""
    queryset = Ressource.objects.all()
    serializer_class = RessourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Ressource.objects.all()
        matiere = self.request.query_params.get('matiere')
        type_ressource = self.request.query_params.get('Type_ressource')

        if matiere:
            queryset = queryset.filter(id_matiere=matiere)
        if type_ressource:
            queryset = queryset.filter(Type_ressource=type_ressource)

        return queryset.select_related('matiere', 'cree_par_admin')


class RessourceRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une ressource"""
    queryset = Ressource.objects.all()
    serializer_class = RessourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_ressource'
    lookup_url_kwarg = 'pk'


# ==================== VUES POUR PROFESSEURS ====================

class ProfesseurListCreateView(generics.ListCreateAPIView):
    """Liste et création des professeurs"""
    queryset = Professeur.objects.all()
    serializer_class = ProfesseurSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Professeur.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom_prof__icontains=search) |
                Q(prenom_prof__icontains=search) |
                Q(email__icontains=search) |
                Q(specialite__icontains=search)
            )
        return queryset


class ProfesseurRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un professeur"""
    queryset = Professeur.objects.all()
    serializer_class = ProfesseurSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_professeur'
    lookup_url_kwarg = 'pk'


class ProfesseurClassesView(generics.ListAPIView):
    """Classes enseignées par un professeur"""
    serializer_class = ClasseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        professeur_id = self.kwargs['pk']
        # Logique à implémenter selon votre modèle de données
        return Classe.objects.all()[:3]


# ==================== VUES POUR ADMINISTRATEURS ====================

class AdministrateurListCreateView(generics.ListCreateAPIView):
    """Liste et création des administrateurs"""
    queryset = Administrateur.objects.all()
    serializer_class = AdministrateurSerializer
    permission_classes = [permissions.IsAdminUser]


class AdministrateurRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un administrateur"""
    queryset = Administrateur.objects.all()
    serializer_class = AdministrateurSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id_admin'
    lookup_url_kwarg = 'pk'