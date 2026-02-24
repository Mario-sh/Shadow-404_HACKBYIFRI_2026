from rest_framework import permissions


class IsEtudiant(permissions.BasePermission):
    """
    Permission pour les étudiants uniquement
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'etudiant'


class IsProfesseur(permissions.BasePermission):
    """
    Permission pour les professeurs uniquement
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'professeur'


class IsAdmin(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsProfesseurOrAdmin(permissions.BasePermission):
    """
    Permission pour les professeurs et administrateurs
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['professeur', 'admin']


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission pour permettre à un utilisateur de modifier uniquement ses propres données
    """

    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True

        # Écriture uniquement pour le propriétaire
        if hasattr(obj, 'student') and obj.student == request.user:
            return True
        if hasattr(obj, 'etudiant') and obj.etudiant == request.user:
            return True
        if hasattr(obj, 'user') and obj.user == request.user:
            return True

        return False