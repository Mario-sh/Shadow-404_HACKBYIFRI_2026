from rest_framework import generics, permissions, status,serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.academic.models import Etudiant, Professeur, Classe, Matiere, Note
from apps.accounts.serializers import UserSerializer
from apps.academic.serializers import ClasseSerializer, MatiereSerializer
from .models import Log
from django.core.paginator import Paginator

class AdminStatsView(APIView):
    """Statistiques pour le dashboard admin"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            period = request.query_params.get('period', 'week')

            # Calculer les dates selon la période
            today = timezone.now().date()
            if period == 'day':
                start_date = today
            elif period == 'week':
                start_date = today - timedelta(days=7)
            elif period == 'month':
                start_date = today - timedelta(days=30)
            else:
                start_date = today - timedelta(days=7)

            # Statistiques générales
            total_users = User.objects.count()
            total_students = Etudiant.objects.count()
            total_teachers = Professeur.objects.count()
            total_classes = Classe.objects.count()
            total_subjects = Matiere.objects.count()
            total_notes = Note.objects.count()

            # Connexions aujourd'hui
            today_start = timezone.now().replace(hour=0, minute=0, second=0)
            today_logins = User.objects.filter(last_login__gte=today_start).count()

            # Utilisateurs actifs (connectés dans la période)
            active_users = User.objects.filter(last_login__gte=start_date).count()

            # Moyenne générale
            avg_grade = Note.objects.aggregate(Avg('valeur_note'))['valeur_note__avg'] or 0

            # Professeurs en attente - PAS de référence à user
            pending_teachers = 0

            return Response({
                'totalUsers': total_users,
                'totalStudents': total_students,
                'totalTeachers': total_teachers,
                'pendingTeachers': pending_teachers,
                'totalClasses': total_classes,
                'totalSubjects': total_subjects,
                'todayLogins': today_logins,
                'activeUsers': active_users,
                'totalNotes': total_notes,
                'averageGrade': round(avg_grade, 2),
            })
        except Exception as e:
            print(f"❌ Erreur dans AdminStatsView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecentActivitiesView(APIView):
    """Activités récentes pour le dashboard admin"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            activities = []

            # Derniers utilisateurs inscrits
            recent_users = User.objects.order_by('-date_joined')[:3]
            for user in recent_users:
                activities.append({
                    'type': 'user',
                    'message': f'Nouvel utilisateur inscrit: {user.username}',
                    'time': self.get_time_display(user.date_joined)
                })

            # Dernières notes saisies
            recent_notes = Note.objects.select_related('matiere').order_by('-created_at')[:3]
            for note in recent_notes:
                if note.matiere:
                    matiere_nom = note.matiere.nom_matière
                else:
                    matiere_nom = "Inconnue"
                activities.append({
                    'type': 'note',
                    'message': f'Note ajoutée: {note.valeur_note}/20 en {matiere_nom}',
                    'time': self.get_time_display(note.created_at)
                })

            # Derniers professeurs inscrits - PAS de user__is_verified
            recent_profs = Professeur.objects.order_by('-created_at')[:2]
            for prof in recent_profs:
                activities.append({
                    'type': 'professeur',
                    'message': f'Nouveau professeur inscrit: {prof.prenom_prof} {prof.nom_prof}',
                    'time': self.get_time_display(prof.created_at)
                })

            return Response(activities[:5])
        except Exception as e:
            print(f"❌ Erreur dans RecentActivitiesView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response([], status=status.HTTP_200_OK)

    def get_time_display(self, dt):
        if not dt:
            return "Date inconnue"
        now = timezone.now()
        diff = now - dt

        if diff.days > 0:
            return f"Il y a {diff.days} jour{'s' if diff.days > 1 else ''}"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"Il y a {hours} heure{'s' if hours > 1 else ''}"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
        else:
            return "À l'instant"


class PendingProfessorsView(APIView):
    """Liste des professeurs en attente de validation"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            data = []

            # Récupérer tous les professeurs
            professeurs = Professeur.objects.all().order_by('-created_at')

            # Trouver les professeurs qui n'ont pas de compte utilisateur associé
            for prof in professeurs:
                # Vérifier si un utilisateur existe avec cet email
                user_exists = User.objects.filter(email=prof.email).exists()

                if not user_exists:
                    data.append({
                        'id': prof.id_professeur,
                        'username': f"{prof.prenom_prof.lower()}.{prof.nom_prof.lower()}",
                        'email': prof.email,
                        'specialite': prof.specialite or '',
                        'telephone': '',
                        'date_joined': prof.created_at.isoformat() if prof.created_at else None,
                        'nom': prof.nom_prof,
                        'prenom': prof.prenom_prof
                    })

            return Response({'results': data})
        except Exception as e:
            print(f"❌ Erreur dans PendingProfessorsView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'results': [], 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ValidateProfessorView(APIView):
    """Valider un professeur - Crée un compte utilisateur associé"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            # Récupérer le professeur
            professeur = Professeur.objects.get(id_professeur=pk)

            # Vérifier si un utilisateur existe déjà avec cet email
            if User.objects.filter(email=professeur.email).exists():
                return Response(
                    {'error': 'Un utilisateur avec cet email existe déjà'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer un nom d'utilisateur à partir du prénom et nom
            base_username = f"{professeur.prenom_prof}.{professeur.nom_prof}".lower()
            username = base_username

            # Vérifier si le nom d'utilisateur existe déjà
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Créer l'utilisateur
            user = User.objects.create_user(
                username=username,
                email=professeur.email,
                password='password123',
                role='professeur',
                telephone='',
                is_active=True
            )

            return Response({
                'message': 'Professeur validé avec succès',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            })
        except Professeur.DoesNotExist:
            return Response(
                {'error': 'Professeur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"❌ Erreur dans ValidateProfessorView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RejectProfessorView(APIView):
    """Rejeter un professeur (le supprimer de la table professeur)"""
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            professeur = Professeur.objects.get(id_professeur=pk)
            professeur.delete()
            return Response({'message': 'Professeur rejeté et supprimé'})
        except Professeur.DoesNotExist:
            return Response(
                {'error': 'Professeur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"❌ Erreur dans RejectProfessorView: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Ajoutez ces classes à la fin de votre fichier apps/gestion_admin/views.py

class UtilisateurListCreateView(generics.ListCreateAPIView):
    """Liste et création des utilisateurs"""
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Vous devez créer ce sérialiseur
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()

        # Filtres
        role = self.request.query_params.get('role')
        if role and role != 'all':
            queryset = queryset.filter(role=role)

        status = self.request.query_params.get('status')
        if status and status != 'all':
            if status == 'active':
                queryset = queryset.filter(is_active=True)
            elif status == 'inactive':
                queryset = queryset.filter(is_active=False)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset.order_by('-date_joined')


class UtilisateurRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un utilisateur"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'


# Ajoutez ces classes à la fin du fichier, après les vues utilisateurs

class ClasseListCreateView(generics.ListCreateAPIView):
    """Liste et création des classes"""
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer  # Vous devez importer ce sérialiseur
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Classe.objects.all()

        # Filtre par recherche
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom_class__icontains=search) |
                Q(niveau__icontains=search)
            )

        return queryset.order_by('nom_class')


class ClasseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une classe"""
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id_classe'
    lookup_url_kwarg = 'pk'


# Ajoutez ces classes après les vues des classes

class MatiereListCreateView(generics.ListCreateAPIView):
    """Liste et création des matières"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Matiere.objects.all()

        # Filtre par recherche
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom_matière__icontains=search)
            )

        # Filtre par classe
        classe_id = self.request.query_params.get('classe_id')
        if classe_id:
            queryset = queryset.filter(classe_id=classe_id)

        return queryset.order_by('nom_matière')


class MatiereRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une matière"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id_matiere'
    lookup_url_kwarg = 'pk'


# Ajoutez ce sérialiseur
class LogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = Log
        fields = ['id', 'user', 'username', 'level', 'type', 'message',
                  'details', 'ip_address', 'created_at']


# Ajoutez cette vue
class LogListView(generics.ListAPIView):
    """Liste des logs"""
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Log.objects.all()

        # Filtres
        level = self.request.query_params.get('level')
        if level and level != 'all':
            queryset = queryset.filter(level=level)

        log_type = self.request.query_params.get('type')
        if log_type and log_type != 'all':
            queryset = queryset.filter(type=log_type)

        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(created_at__date=date)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(message__icontains=search) |
                Q(details__icontains=search)
            )

        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Pagination manuelle
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))

        paginator = Paginator(queryset, limit)
        current_page = paginator.page(page)

        serializer = self.get_serializer(current_page.object_list, many=True)

        return Response({
            'results': serializer.data,
            'total': paginator.count,
            'page': page,
            'pages': paginator.num_pages
        })


class LogDetailView(generics.RetrieveAPIView):
    """Détail d'un log"""
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'