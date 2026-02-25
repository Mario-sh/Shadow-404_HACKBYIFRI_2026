from rest_framework import generics, permissions, status
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


# backend/apps/accounts/views.py
from django.contrib.auth import get_user_model
from django.http import JsonResponse


def create_admin(request):
    """
    Vue temporaire pour créer un administrateur.
    À SUPPRIMER APRÈS UTILISATION !
    """
    User = get_user_model()

    # Paramètres de l'admin
    username = "admin"
    email = "admin@academictwins.com"
    password = "Admin@2026!Secure"  # Changez ce mot de passe !

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        return JsonResponse({
            "status": "success",
            "message": f"✅ Superutilisateur '{username}' créé avec succès !"
        })
    else:
        return JsonResponse({
            "status": "info",
            "message": f"ℹ️ L'utilisateur '{username}' existe déjà."
        })

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