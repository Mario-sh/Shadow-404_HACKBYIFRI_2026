from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic.base import RedirectView

schema_view = get_schema_view(
    openapi.Info(
        title="Academic Twins API",
        default_version='v1',
        description="API pour la plateforme de gestion académique",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@academictwins.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
path('', RedirectView.as_view(url='/swagger/'), name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/academic/', include('apps.academic.api.urls')),
    path('api/ia/', include('apps.ai_engine.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api-auth/', include('rest_framework.urls')),
re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)