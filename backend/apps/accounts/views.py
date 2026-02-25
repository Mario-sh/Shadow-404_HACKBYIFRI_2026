from rest_framework import generics, permissions, status,serializers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserUpdateSerializer
from apps.academic.models import Etudiant, Classe
from django.contrib.auth import get_user_model
from django.http import JsonResponse
User = get_user_model()
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import sys
from io import StringIO
import contextlib

from .populate_utils import (  # On va créer ce fichier
    create_users, create_classes, create_matieres,
    create_administrateurs, create_exercices, create_ressources,
    create_notes, create_suggestions, create_events,
    create_notifications, create_logs, create_stats_apprentissage,
    print_header, print_success, print_info, print_warning
)


class PopulateDatabaseView(APIView):
    """
    Endpoint pour peupler la base de données avec des données de test.
    PROTÉGÉ PAR UN TOKEN SECRET - À SUPPRIMER APRÈS USAGE !
    """
    permission_classes = [permissions.AllowAny]  # Temporaire, mais protégé par token

    def get(self, request):
        """Version GET - simple confirmation"""
        return Response({
            'message': 'Utilisez POST pour exécuter le script de peuplement',
            'instruction': 'Inclure le header X-POPULATE-TOKEN avec le bon secret'
        })

    def post(self, request):
        # Vérification du token secret (protège l'accès public)
        token = request.headers.get('X-POPULATE-TOKEN') or request.data.get('secret_token')
        if token != "ACADEMIC_TWINS_POPULATE_2026":
            return Response({
                'error': 'Token invalide. Accès non autorisé.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Capturer la sortie console
        output = StringIO()

        try:
            with contextlib.redirect_stdout(output):
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
            result = {
                'success': True,
                'message': 'Base de données peuplée avec succès',
                'stats': {
                    'users_created': users_created,
                    'classes_created': classes_created,
                    'matieres_created': matieres_created,
                    'admins_created': admins_created,
                    'exercices_created': exercices_created,
                    'ressources_created': ressources_created,
                    'notes_created': notes_created,
                    'suggestions_created': suggestions_created,
                    'events_created': events_created,
                    'notifications_created': notifs_created,
                    'logs_created': logs_created,
                    'stats_apprentissage_created': stats_created,
                },
                'output': output.getvalue().split('\n')[-20:]  # Dernières 20 lignes
            }
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'output': output.getvalue().split('\n')[-20:]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouvel utilisateur avec création automatique de l'étudiant"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        print("=== DÉBUT INSCRIPTION ===")
        print(f"Données reçues: {request.data}")

        # Utiliser le sérialiseur normalement
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Sauvegarder l'utilisateur
        user = serializer.save()
        print(f"✅ Utilisateur créé: {user.username} (ID: {user.id}, Rôle: {user.role})")

        # Si c'est un étudiant, créer automatiquement l'entrée dans la table etudiant
        if user.role == 'etudiant':
            try:
                print("🎓 Création de l'étudiant associé...")

                # Trouver la classe correspondante à partir de la filière et du niveau
                classe = None
                if user.filiere and user.niveau:
                    print(f"Recherche classe pour: {user.filiere} - {user.niveau}")

                    # Chercher une classe qui correspond à la filière et au niveau
                    classes = Classe.objects.filter(
                        niveau__icontains=user.niveau
                    )

                    print(f"Classes trouvées pour le niveau {user.niveau}: {classes.count()}")

                    # Filtrer par filière dans le nom de la classe
                    for c in classes:
                        if user.filiere.lower() in c.nom_class.lower():
                            classe = c
                            print(f"✅ Classe trouvée: {c.nom_class}")
                            break

                    # Si pas trouvé, prendre la première classe du niveau
                    if not classe and classes.exists():
                        classe = classes.first()
                        print(f"⚠️ Classe par défaut: {classe.nom_class}")

                # Extraire le nom et prénom à partir duusername
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
                    # Si pas de séparateur, prendre tout leusername comme nom
                    nom = username.capitalize()
                    prenom = ""

                print(f"Nom extrait: {nom}, Prénom extrait: {prenom}")

                # Générer un matricule si non fourni
                matricule = user.numero_etudiant
                if not matricule:
                    # Format: ANNEE + ID (ex: 2026001)
                    annee = str(timezone.now().year)
                    matricule = f"{annee}{user.id:04d}"
                    print(f"Matricule généré: {matricule}")

                # Vérifier si l'étudiant existe déjà
                if Etudiant.objects.filter(user=user).exists():
                    print("⚠️ Un étudiant existe déjà pour cet utilisateur")
                else:
                    # Créer l'étudiant
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

        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)

        # Sérialiser l'utilisateur pour la réponse
        user_serializer = UserSerializer(user)

        print("=== FIN INSCRIPTION ===\n")

        # Retourner la réponse complète
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
        """
        Crée ou met à jour un superutilisateur avec tous les privilèges.
        Permet de corriger le rôle si nécessaire.
        À UTILISER UNE SEULE FOIS, PUIS SUPPRIMER !
        """
        # Paramètres sécurisés (à changer selon tes besoins)
        admin_data = {
            'username': request.data.get('username', 'admin'),
            'email': request.data.get('email', 'admin@academictwins.com'),
            'password': request.data.get('password', 'Admin@2026!Secure'),
            'role': request.data.get('role', 'admin'),  # Permet de spécifier le rôle
            'force_update': request.data.get('force_update', False),  # Force la mise à jour du rôle
        }

        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=admin_data['username']).exists():
            existing_user = User.objects.get(username=admin_data['username'])

            # Afficher l'état actuel
            current_state = {
                'username': existing_user.username,
                'email': existing_user.email,
                'is_superuser': existing_user.is_superuser,
                'is_staff': existing_user.is_staff,
                'role': existing_user.role
            }

            modifications = []

            # Vérifier et corriger les permissions superuser/staff
            if not existing_user.is_superuser or not existing_user.is_staff:
                existing_user.is_superuser = True
                existing_user.is_staff = True
                modifications.append("permissions superuser")

            # Vérifier et corriger le rôle si nécessaire
            if existing_user.role != admin_data['role'] or admin_data['force_update']:
                old_role = existing_user.role
                existing_user.role = admin_data['role']
                modifications.append(f"rôle ({old_role} → {admin_data['role']})")

            # Appliquer les modifications si nécessaire
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

        # Création du superutilisateur (s'il n'existe pas)
        try:
            user = User.objects.create_superuser(
                username=admin_data['username'],
                email=admin_data['email'],
                password=admin_data['password']
            )

            # Ajouter le rôle spécifié
            user.role = admin_data['role']
            user.save()

            # Générer des tokens JWT
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
        """Version GET - retourne un formulaire simple ou crée l'admin par défaut"""
        # Si des paramètres sont passés en GET, les traiter
        if request.GET:
            # Simuler un POST avec les paramètres GET
            modified_request = type('Request', (), {'data': request.GET.dict()})()
            return self.post(modified_request)

        # Sinon, créer l'admin par défaut
        return self.post(request)

    def patch(self, request):
        """Permet de mettre à jour partiellement un utilisateur existant"""
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

        # Si l'utilisateur est un étudiant, mettre à jour aussi la table etudiant
        if instance.role == 'etudiant':
            try:
                etudiant = Etudiant.objects.get(user=instance)
                # Mettre à jour les champs pertinents
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


# Exporter toutes les vues
__all__ = [
    'RegisterView',
    'LoginView',
    'LogoutView',
    'ProfileView',
    'UserDetailView'
]