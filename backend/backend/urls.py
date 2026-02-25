from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from apps.accounts.views import PopulateDatabaseView

schema_view = get_schema_view(
    openapi.Info(
        title="Academic Twins API",
        default_version='v1',
        description="API de la plateforme de gestion académique",
        contact=openapi.Contact(email="contact@academictwins.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('create-admin/', PopulateDatabaseView.as_view(), name='populate-db'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/academic/', include('apps.academic.urls')),
    path('api/ia/', include('apps.ai_engine.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    # Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/events/', include('apps.events.urls')),        # ← Nouveau
    path('api/chat/', include('apps.chat.urls')),            # ← Nouveau
    path('api/logs/', include('apps.logs.urls')),            # ← Nouveau
    path('api/stats/', include('apps.stats.urls')),
    path('api/gestion-admin/', include('apps.gestion_admin.urls')),  # ← Nouveau chemin

]