from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserUpdateSerializer
from apps.academic.models import Etudiant, Classe
from django.http import JsonResponse
import os
import sys
import threading
import logging
from io import StringIO
import contextlib

# Import des fonctions de peuplement
from .populate_utils import (
    create_users, create_classes, create_matieres,
    create_administrateurs, create_exercices, create_ressources,
    create_notes, create_suggestions, create_events,
    create_notifications, create_logs, create_stats_apprentissage,
    print_header, print_success, print_info, print_warning
)

User = get_user_model()

# Configuration du logger
logger = logging.getLogger(__name__)

# Variable globale pour suivre l'état du script
script_running = False


# ============================================
# VUE DE PEUPLEMENT (ARRIÈRE-PLAN)
# ============================================

def run_populate_script():
    """Fonction exécutée en arrière-plan"""
    global script_running
    script_running = True

    try:
        logger.info("=" * 60)
        logger.info(" DÉBUT DU SCRIPT DE PEUPLEMENT (ARRIÈRE-PLAN)")
        logger.info("=" * 60)

        # Exécuter toutes les fonctions de peuplement
        users_created = create_users()
        classes_created = create_classes()
        matieres_created = create_matieres()
        admins_created = create_administrateurs()
        exercices_created = create_exercices()
        ressources_created = create_ressources()
        notes_created = create_notes()
        suggestions_created = create_suggestions()
        events_created = create_events()
        notifs_created = create_notifications()
        logs_created = create_logs()
        stats_created = create_stats_apprentissage()

        # Résumé
        logger.info("=" * 60)
        logger.info(" RÉSUMÉ DU PEUPLEMENT")
        logger.info("=" * 60)
        logger.info(f"👥 Utilisateurs créés: {users_created}")
        logger.info(f"🏫 Classes créées: {classes_created}")
        logger.info(f"📚 Matières créées: {matieres_created}")
        logger.info(f"👑 Admins créés: {admins_created}")
        logger.info(f"📝 Exercices créés: {exercices_created}")
        logger.info(f"📁 Ressources créées: {ressources_created}")
        logger.info(f"📊 Notes créées: {notes_created}")
        logger.info(f"🤖 Suggestions IA créées: {suggestions_created}")
        logger.info(f"📅 Événements créés: {events_created}")
        logger.info(f"🔔 Notifications créées: {notifs_created}")
        logger.info(f"📋 Logs créés: {logs_created}")
        logger.info(f"📈 Stats apprentissage créées: {stats_created}")
        logger.info("=" * 60)
        logger.info(" SCRIPT TERMINÉ AVEC SUCCÈS")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ ERREUR DANS LE SCRIPT: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

    finally:
        script_running = False


class PopulateDatabaseView(APIView):
    """
    Endpoint pour peupler la base de données avec des données de test.
    Le script s'exécute en arrière-plan pour éviter le timeout.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Version GET - simple confirmation et statut"""
        return Response({
            'message': 'Utilisez POST pour lancer le script de peuplement',
            'instruction': 'Inclure le header X-POPULATE-TOKEN avec le bon secret',
            'script_running': script_running
        })

    def post(self, request):
        global script_running

        # Vérification du token secret
        token = request.headers.get('X-POPULATE-TOKEN') or request.data.get('secret_token')
        expected_token = os.environ.get('POPULATE_SECRET_TOKEN', 'ACADEMIC_TWINS_POPULATE_2026')

        if token != expected_token:
            return Response({
                'error': 'Token invalide. Accès non autorisé.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Vérifier si un script est déjà en cours
        if script_running:
            return Response({
                'message': 'Un script de peuplement est déjà en cours d\'exécution',
                'script_running': True
            }, status=status.HTTP_409_CONFLICT)

        # Lancer le script dans un thread séparé
        thread = threading.Thread(target=run_populate_script)
        thread.daemon = True
        thread.start()

        return Response({
            'message': '✅ Script de peuplement lancé en arrière-plan',
            'status': 'en cours',
            'script_running': True,
            'info': 'Consulte les logs Render pour suivre la progression'
        }, status=status.HTTP_202_ACCEPTED)


# ============================================
# VUES D'AUTHENTIFICATION
# ============================================

class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouvel utilisateur avec création automatique de l'étudiant"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        print("=== DÉBUT INSCRIPTION ===")
        print(f"Données reçues: {request.data}")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        print(f"✅ Utilisateur créé: {user.username} (ID: {user.id}, Rôle: {user.role})")

        if user.role == 'etudiant':
            try:
                print("🎓 Création de l'étudiant associé...")

                classe = None
                if user.filiere and user.niveau:
                    print(f"Recherche classe pour: {user.filiere} - {user.niveau}")
                    classes = Classe.objects.filter(niveau__icontains=user.niveau)
                    print(f"Classes trouvées pour le niveau {user.niveau}: {classes.count()}")

                    for c in classes:
                        if user.filiere.lower() in c.nom_class.lower():
                            classe = c
                            print(f"✅ Classe trouvée: {c.nom_class}")
                            break

                    if not classe and classes.exists():
                        classe = classes.first()
                        print(f"⚠️ Classe par défaut: {classe.nom_class}")

                username = user.username
                prenom = ""
                nom = ""

                if '.' in username:
                    parts = username.split('.')
                    prenom = parts[0].capitalize()
                    nom = parts[1].capitalize() if len(parts) > 1 else ""
                elif '_' in username:
                    parts = username.split('_')
                    prenom = parts[0].capitalize()
                    nom = parts[1].capitalize() if len(parts) > 1 else ""
                else:
                    nom = username.capitalize()
                    prenom = ""

                print(f"Nom extrait: {nom}, Prénom extrait: {prenom}")

                matricule = user.numero_etudiant
                if not matricule:
                    annee = str(timezone.now().year)
                    matricule = f"{annee}{user.id:04d}"
                    print(f"Matricule généré: {matricule}")

                if Etudiant.objects.filter(user=user).exists():
                    print("⚠️ Un étudiant existe déjà pour cet utilisateur")
                else:
                    etudiant = Etudiant.objects.create(
                        matricule=matricule,
                        nom=nom,
                        prenom=prenom,
                        email=user.email,
                        date_inscription=date.today(),
                        classe=classe,
                        user=user
                    )
                    print(f"✅ Étudiant créé avec succès!")
                    print(f"   ID: {etudiant.id_student}")
                    print(f"   Nom: {etudiant.prenom} {etudiant.nom}")
                    print(f"   Matricule: {etudiant.matricule}")
                    print(f"   Classe: {etudiant.classe.nom_class if etudiant.classe else 'Aucune'}")

            except Exception as e:
                print(f"❌ ERREUR lors de la création de l'étudiant: {str(e)}")
                import traceback
                traceback.print_exc()
        else:
            print(f"👤 Rôle {user.role} - Pas de création d'étudiant")

        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)

        print("=== FIN INSCRIPTION ===\n")

        return Response({
            'user': user_serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Connexion utilisateur - retourne tokens JWT"""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class EmptySerializer(serializers.Serializer):
    """Sérialiseur vide pour satisfaire DRF"""
    pass


class CreateAdminView(generics.GenericAPIView):
    """Vue temporaire pour créer ou mettre à jour un superutilisateur admin"""
    permission_classes = [permissions.AllowAny]
    serializer_class = EmptySerializer

    def post(self, request):
        admin_data = {
            'username': request.data.get('username', 'admin'),
            'email': request.data.get('email', 'admin@academictwins.com'),
            'password': request.data.get('password', 'Admin@2026!Secure'),
            'role': request.data.get('role', 'admin'),
            'force_update': request.data.get('force_update', False),
        }

        if User.objects.filter(username=admin_data['username']).exists():
            existing_user = User.objects.get(username=admin_data['username'])
            current_state = {
                'username': existing_user.username,
                'email': existing_user.email,
                'is_superuser': existing_user.is_superuser,
                'is_staff': existing_user.is_staff,
                'role': existing_user.role
            }
            modifications = []

            if not existing_user.is_superuser or not existing_user.is_staff:
                existing_user.is_superuser = True
                existing_user.is_staff = True
                modifications.append("permissions superuser")

            if existing_user.role != admin_data['role'] or admin_data['force_update']:
                old_role = existing_user.role
                existing_user.role = admin_data['role']
                modifications.append(f"rôle ({old_role} → {admin_data['role']})")

            if modifications:
                existing_user.save()
                return Response({
                    'status': 'success',
                    'message': f"✅ Utilisateur '{admin_data['username']}' mis à jour : {', '.join(modifications)}",
                    'user': {
                        'username': existing_user.username,
                        'email': existing_user.email,
                        'is_superuser': existing_user.is_superuser,
                        'is_staff': existing_user.is_staff,
                        'role': existing_user.role
                    },
                    'previous_state': current_state
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'info',
                    'message': f"ℹ️ L'utilisateur '{admin_data['username']}' est déjà correctement configuré.",
                    'user': current_state
                }, status=status.HTTP_200_OK)

        try:
            user = User.objects.create_superuser(
                username=admin_data['username'],
                email=admin_data['email'],
                password=admin_data['password']
            )
            user.role = admin_data['role']
            user.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                'status': 'success',
                'message': f"✅ Superutilisateur '{admin_data['username']}' créé avec succès !",
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'is_superuser': user.is_superuser,
                    'is_staff': user.is_staff,
                    'role': user.role
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': f"❌ Erreur lors de la création : {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        if request.GET:
            modified_request = type('Request', (), {'data': request.GET.dict()})()
            return self.post(modified_request)
        return self.post(request)

    def patch(self, request):
        return self.post(request)


class LogoutView(generics.GenericAPIView):
    """Déconnexion - blackliste le refresh token"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Voir et modifier son profil"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = UserUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if instance.role == 'etudiant':
            try:
                etudiant = Etudiant.objects.get(user=instance)
                if 'email' in request.data:
                    etudiant.email = request.data['email']
                if 'telephone' in request.data:
                    etudiant.telephone = request.data['telephone']
                etudiant.save()
            except Etudiant.DoesNotExist:
                pass

        return Response(UserSerializer(instance).data)


class UserDetailView(generics.RetrieveAPIView):
    """Voir les détails d'un utilisateur (admin seulement)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


# ============================================
# EXPORT DES VUES
# ============================================
__all__ = [
    'RegisterView',
    'LoginView',
    'LogoutView',
    'ProfileView',
    'UserDetailView',
    'PopulateDatabaseView',
    'CreateAdminView'
]