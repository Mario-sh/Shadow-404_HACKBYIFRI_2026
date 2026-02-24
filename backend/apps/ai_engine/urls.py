from django.urls import path
from . import views

urlpatterns = [
    path('suggestions/pour_etudiant/',
         views.SuggestionsPourEtudiantView.as_view(),
         name='suggestions-pour-etudiant'),
    path('suggestions/analyse_complete/',
         views.AnalyseCompleteView.as_view(),
         name='analyse-complete'),
    path('suggestions/feedback/',
         views.FeedbackSuggestionView.as_view(),
         name='suggestions-feedback'),
]