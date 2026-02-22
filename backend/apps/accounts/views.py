from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserUpdateSerializer
from .permissions.roles import IsOwnerOrReadOnly

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouvel utilisateur"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(generics.GenericAPIView):
    """Connexion utilisateur - retourne tokens JWT"""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


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
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = UserUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
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