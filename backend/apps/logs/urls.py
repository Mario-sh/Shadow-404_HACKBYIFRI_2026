from django.urls import path
from . import views

urlpatterns = [
    path('logs/', views.LogListView.as_view(), name='log-list'),
    path('logs/<int:pk>/', views.LogDetailView.as_view(), name='log-detail'),
    path('logs/stats/', views.LogStatsView.as_view(), name='log-stats'),
    path('logs/cleanup/', views.LogCleanupView.as_view(), name='log-cleanup'),
    path('logs/create/', views.LogCreateView.as_view(), name='log-create'),
]