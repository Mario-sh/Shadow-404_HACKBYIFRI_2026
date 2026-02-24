from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from apps.academic.models import Etudiant, Note, Matiere, Classe, Professeur
from apps.accounts.models import User
from .models import PerformanceStat, ClasseStat, GlobalStat
from .serializers import PerformanceStatSerializer, ClasseStatSerializer, GlobalStatSerializer


class PerformanceStatListView(generics.ListAPIView):
    """Liste des statistiques de performance"""
    serializer_class = PerformanceStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'etudiant':
            # Un étudiant ne voit que ses propres stats
            etudiant = Etudiant.objects.get(user=user)
            return PerformanceStat.objects.filter(etudiant=etudiant)
        elif user.role == 'professeur':
            # Un professeur voit les stats de ses étudiants
            # À adapter selon votre logique
            return PerformanceStat.objects.all()
        else:
            # Admin voit tout
            return PerformanceStat.objects.all()


class PerformanceStatDetailView(generics.RetrieveAPIView):
    """Détail d'une statistique de performance"""
    queryset = PerformanceStat.objects.all()
    serializer_class = PerformanceStatSerializer
    permission_classes = [permissions.IsAuthenticated]


class CalculatePerformanceStatsView(APIView):
    """Calculer les statistiques de performance pour un étudiant"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, etudiant_id):
        try:
            etudiant = Etudiant.objects.get(id_student=etudiant_id)
        except Etudiant.DoesNotExist:
            return Response(
                {'error': 'Étudiant non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Récupérer toutes les notes de l'étudiant
        notes = Note.objects.filter(student=etudiant)

        if not notes.exists():
            return Response(
                {'message': "Pas assez de données pour calculer les statistiques"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Statistiques globales
        moyenne_generale = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']
        nb_notes = notes.count()

        # Taux de réussite (notes >= 10)
        taux_reussite = (notes.filter(valeur_note__gte=10).count() / nb_notes) * 100

        # Calculer la progression (comparer avec le mois précédent)
        maintenant = timezone.now().date()
        mois_dernier = maintenant - timedelta(days=30)

        notes_recentes = notes.filter(date_note__gte=mois_dernier)
        notes_anciennes = notes.filter(date_note__lt=mois_dernier)

        progression = 0
        if notes_recentes.exists() and notes_anciennes.exists():
            moy_recente = notes_recentes.aggregate(Avg('valeur_note'))['valeur_note__avg']
            moy_ancienne = notes_anciennes.aggregate(Avg('valeur_note'))['valeur_note__avg']

            if moy_ancienne > 0:
                progression = ((moy_recente - moy_ancienne) / moy_ancienne) * 100

        # Créer ou mettre à jour la statistique globale
        stat, created = PerformanceStat.objects.update_or_create(
            etudiant=etudiant,
            matiere=None,
            date_calcul=maintenant,
            defaults={
                'moyenne': moyenne_generale,
                'progression': progression,
                'nb_notes': nb_notes,
                'taux_reussite': taux_reussite,
            }
        )

        # Calculer les stats par matière
        for matiere in Matiere.objects.all():
            notes_matiere = notes.filter(matiere=matiere)
            if notes_matiere.exists():
                moy_matiere = notes_matiere.aggregate(Avg('valeur_note'))['valeur_note__avg']
                taux_matiere = (notes_matiere.filter(valeur_note__gte=10).count() / notes_matiere.count()) * 100

                PerformanceStat.objects.update_or_create(
                    etudiant=etudiant,
                    matiere=matiere,
                    date_calcul=maintenant,
                    defaults={
                        'moyenne': moy_matiere,
                        'taux_reussite': taux_matiere,
                        'nb_notes': notes_matiere.count(),
                    }
                )

        serializer = PerformanceStatSerializer(stat)
        return Response(serializer.data)


class ClasseStatListView(generics.ListAPIView):
    """Liste des statistiques par classe"""
    serializer_class = ClasseStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ClasseStat.objects.all().order_by('-date_calcul')


class CalculateClasseStatsView(APIView):
    """Calculer les statistiques pour une classe"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, classe_id):
        try:
            classe = Classe.objects.get(id_classe=classe_id)
        except Classe.DoesNotExist:
            return Response(
                {'error': 'Classe non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        etudiants = Etudiant.objects.filter(classe=classe)
        notes = Note.objects.filter(student__in=etudiants)

        if not notes.exists():
            return Response(
                {'message': "Pas assez de données"},
                status=status.HTTP_400_BAD_REQUEST
            )

        moyenne_classe = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']
        nb_etudiants = etudiants.count()
        nb_notes = notes.count()

        # Distribution des notes
        distribution = {
            'excellent': notes.filter(valeur_note__gte=16).count(),
            'bon': notes.filter(valeur_note__gte=12, valeur_note__lt=16).count(),
            'moyen': notes.filter(valeur_note__gte=10, valeur_note__lt=12).count(),
            'insuffisant': notes.filter(valeur_note__lt=10).count(),
        }

        # Meilleure et pire matière
        matieres_stats = []
        for matiere in Matiere.objects.all():
            notes_matiere = notes.filter(matiere=matiere)
            if notes_matiere.exists():
                moy_matiere = notes_matiere.aggregate(Avg('valeur_note'))['valeur_note__avg']
                matieres_stats.append({
                    'nom': matiere.nom_matière,
                    'moyenne': moy_matiere
                })

        matieres_stats.sort(key=lambda x: x['moyenne'], reverse=True)

        meilleure_matiere = matieres_stats[0]['nom'] if matieres_stats else ""
        matiere_faible = matieres_stats[-1]['nom'] if matieres_stats else ""

        stat, created = ClasseStat.objects.update_or_create(
            classe=classe,
            date_calcul=timezone.now().date(),
            defaults={
                'moyenne_generale': moyenne_classe,
                'taux_reussite': (notes.filter(valeur_note__gte=10).count() / nb_notes) * 100,
                'nb_etudiants': nb_etudiants,
                'nb_notes': nb_notes,
                'meilleure_matiere': meilleure_matiere,
                'matiere_faible': matiere_faible,
                'distribution': distribution,
            }
        )

        serializer = ClasseStatSerializer(stat)
        return Response(serializer.data)


class GlobalStatListView(generics.ListAPIView):
    """Liste des statistiques globales"""
    serializer_class = GlobalStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GlobalStat.objects.all().order_by('-date_calcul')


class CalculateGlobalStatsView(APIView):
    """Calculer les statistiques globales"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        aujourd_hui = timezone.now().date()

        total_etudiants = Etudiant.objects.count()
        total_professeurs = Professeur.objects.count()
        total_classes = Classe.objects.count()
        total_matieres = Matiere.objects.count()
        total_notes = Note.objects.count()

        moyenne_generale = Note.objects.aggregate(Avg('valeur_note'))['valeur_note__avg']

        # Utilisateurs actifs (connexion dans les 7 derniers jours)
        semaine_derniere = timezone.now() - timedelta(days=7)
        utilisateurs_actifs = User.objects.filter(last_login__gte=semaine_derniere).count()

        # Connexions aujourd'hui
        aujourd_hui_debut = timezone.now().replace(hour=0, minute=0, second=0)
        connexions_jour = User.objects.filter(last_login__gte=aujourd_hui_debut).count()

        stat, created = GlobalStat.objects.update_or_create(
            date_calcul=aujourd_hui,
            defaults={
                'total_etudiants': total_etudiants,
                'total_professeurs': total_professeurs,
                'total_classes': total_classes,
                'total_matieres': total_matieres,
                'total_notes': total_notes,
                'moyenne_generale': moyenne_generale,
                'taux_reussite_global': (Note.objects.filter(
                    valeur_note__gte=10).count() / total_notes) * 100 if total_notes > 0 else 0,
                'utilisateurs_actifs': utilisateurs_actifs,
                'connexions_jour': connexions_jour,
            }
        )

        serializer = GlobalStatSerializer(stat)
        return Response(serializer.data)