from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SmartSuggestionViewSet

router = DefaultRouter()
router.register(r'suggestions', SmartSuggestionViewSet, basename='ia-suggestions')

urlpatterns = [
    path('', include(router.urls)),
]