from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('activites/recentes/', views.RecentActivitiesView.as_view(), name='recent-activities'),
    path('professeurs/en-attente/', views.PendingProfessorsView.as_view(), name='pending-professors'),
    path('professeurs/<int:pk>/valider/', views.ValidateProfessorView.as_view(), name='validate-professor'),
    path('professeurs/<int:pk>/', views.RejectProfessorView.as_view(), name='reject-professor'),
    path('utilisateurs/', views.UtilisateurListCreateView.as_view(), name='utilisateur-list'),
    path('utilisateurs/<int:pk>/', views.UtilisateurRetrieveUpdateDestroyView.as_view(), name='utilisateur-detail'),
    path('classes/', views.ClasseListCreateView.as_view(), name='classe-list'),
    path('classes/<int:pk>/', views.ClasseRetrieveUpdateDestroyView.as_view(), name='classe-detail'),
    path('matieres/', views.MatiereListCreateView.as_view(), name='matiere-list'),
    path('matieres/<int:pk>/', views.MatiereRetrieveUpdateDestroyView.as_view(), name='matiere-detail'),

    # Nouveaux endpoints pour les logs
    path('logs/', views.LogListView.as_view(), name='log-list'),
    path('logs/<int:pk>/', views.LogDetailView.as_view(), name='log-detail'),
]