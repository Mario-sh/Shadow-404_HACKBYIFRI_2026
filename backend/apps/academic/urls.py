from django.urls import path
from . import views

urlpatterns = [
    # ===== ÉTUDIANTS =====
    path('etudiants/', views.EtudiantListCreateView.as_view(), name='etudiant-list'),
    path('etudiants/<int:pk>/', views.EtudiantRetrieveUpdateDestroyView.as_view(), name='etudiant-detail'),
    path('etudiants/<int:pk>/notes/', views.EtudiantNotesView.as_view(), name='etudiant-notes'),
    path('etudiants/<int:pk>/statistiques/', views.EtudiantStatistiquesView.as_view(), name='etudiant-stats'),
    path('etudiants/by_user/<int:user_id>/', views.EtudiantByUserView.as_view(), name='etudiant-by-user'),
    path('etudiants/difficile/', views.EtudiantsEnDifficulteView.as_view(), name='etudiants-difficile'),

    # ===== NOTES =====
    path('notes/', views.NoteListCreateView.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteRetrieveUpdateDestroyView.as_view(), name='note-detail'),
    path('notes/<int:pk>/valider/', views.NoteValiderView.as_view(), name='note-valider'),
    path('notes/recentes/', views.NoteRecentesView.as_view(), name='notes-recentes'),
    path('notes/moyennes_par_matiere/', views.MoyennesParMatiereView.as_view(), name='moyennes-par-matiere'),

    # ===== CLASSES =====
    path('classes/', views.ClasseListCreateView.as_view(), name='classe-list'),
    path('classes/<int:pk>/', views.ClasseRetrieveUpdateDestroyView.as_view(), name='classe-detail'),
    path('classes/<int:pk>/etudiants/', views.ClasseEtudiantsView.as_view(), name='classe-etudiants'),
    path('classes/<int:pk>/notes/', views.ClasseNotesView.as_view(), name='classe-notes'),
    path('classes/<int:pk>/statistiques/', views.ClasseStatistiquesView.as_view(), name='classe-statistiques'),

    # ===== MATIÈRES =====
    path('matieres/', views.MatiereListCreateView.as_view(), name='matiere-list'),
    path('matieres/<int:pk>/', views.MatiereRetrieveUpdateDestroyView.as_view(), name='matiere-detail'),
    path('matieres/<int:pk>/statistiques/', views.MatiereStatistiquesView.as_view(), name='matiere-statistiques'),

    # ===== EXERCICES =====
    path('exercices/', views.ExerciceListCreateView.as_view(), name='exercice-list'),
    path('exercices/<int:pk>/', views.ExerciceRetrieveUpdateDestroyView.as_view(), name='exercice-detail'),

    # ===== RESSOURCES =====
    path('ressources/', views.RessourceListCreateView.as_view(), name='ressource-list'),
    path('ressources/<int:pk>/', views.RessourceRetrieveUpdateDestroyView.as_view(), name='ressource-detail'),

    # ===== PROFESSEURS =====
    path('professeurs/', views.ProfesseurListCreateView.as_view(), name='professeur-list'),
    path('professeurs/<int:pk>/', views.ProfesseurRetrieveUpdateDestroyView.as_view(), name='professeur-detail'),
    path('professeurs/<int:pk>/classes/', views.ProfesseurClassesView.as_view(), name='professeur-classes'),

    # ===== ADMINISTRATEURS =====
    path('administrateurs/', views.AdministrateurListCreateView.as_view(), name='administrateur-list'),
    path('administrateurs/<int:pk>/', views.AdministrateurRetrieveUpdateDestroyView.as_view(),
         name='administrateur-detail'),
]