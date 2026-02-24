from django.urls import path
from . import views

urlpatterns = [
    # Performance stats
    path('performance/', views.PerformanceStatListView.as_view(), name='performance-list'),
    path('performance/<int:pk>/', views.PerformanceStatDetailView.as_view(), name='performance-detail'),
    path('performance/calculate/<int:etudiant_id>/', views.CalculatePerformanceStatsView.as_view(),
         name='performance-calculate'),

    # Classe stats
    path('classes/', views.ClasseStatListView.as_view(), name='classe-stats-list'),
    path('classes/calculate/<int:classe_id>/', views.CalculateClasseStatsView.as_view(), name='classe-stats-calculate'),

    # Global stats
    path('global/', views.GlobalStatListView.as_view(), name='global-stats-list'),
    path('global/calculate/', views.CalculateGlobalStatsView.as_view(), name='global-stats-calculate'),
]