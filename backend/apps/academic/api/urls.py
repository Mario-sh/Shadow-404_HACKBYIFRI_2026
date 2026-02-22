from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from apps.ai_engine.views import SmartSuggestionViewSet  # Import depuis ai_engine



router = DefaultRouter()
router.register(r'administrateurs', AdministrateurViewSet)
router.register(r'classes', ClasseViewSet)
router.register(r'professeurs', ProfesseurViewSet)
router.register(r'etudiants', EtudiantViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'exercices', BanqueExercicesViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'ressources', RessourceViewSet)
router.register(r'suggestions', SmartSuggestionViewSet, basename='suggestions')  # Corrigé

urlpatterns = [
    path('', include(router.urls)),
]