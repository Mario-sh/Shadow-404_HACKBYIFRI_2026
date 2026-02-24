from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Log, LogStats
from .serializers import LogSerializer, LogStatsSerializer


class LogListView(generics.ListAPIView):
    """Liste des logs (admin seulement)"""
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Log.objects.all()

        # Filtres
        level = self.request.query_params.get('level')
        log_type = self.request.query_params.get('type')
        user_id = self.request.query_params.get('user_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        search = self.request.query_params.get('search')

        if level and level != 'all':
            queryset = queryset.filter(level=level)

        if log_type and log_type != 'all':
            queryset = queryset.filter(type=log_type)

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        if search:
            queryset = queryset.filter(
                Q(message__icontains=search) |
                Q(details__icontains=search) |
                Q(path__icontains=search)
            )

        return queryset


class LogDetailView(generics.RetrieveAPIView):
    """Détail d'un log (admin seulement)"""
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAdminUser]


class LogStatsView(APIView):
    """Statistiques des logs (admin seulement)"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'day')  # day, week, month

        if period == 'day':
            start_date = timezone.now().date()
            end_date = start_date + timedelta(days=1)
        elif period == 'week':
            start_date = timezone.now().date() - timedelta(days=7)
            end_date = timezone.now().date() + timedelta(days=1)
        elif period == 'month':
            start_date = timezone.now().date() - timedelta(days=30)
            end_date = timezone.now().date() + timedelta(days=1)
        else:
            start_date = timezone.now().date() - timedelta(days=1)
            end_date = timezone.now().date() + timedelta(days=1)

        logs = Log.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lt=end_date
        )

        stats = {
            'total': logs.count(),
            'by_level': {
                'info': logs.filter(level='info').count(),
                'success': logs.filter(level='success').count(),
                'warning': logs.filter(level='warning').count(),
                'error': logs.filter(level='error').count(),
                'debug': logs.filter(level='debug').count(),
            },
            'by_type': {
                'auth': logs.filter(type='auth').count(),
                'user': logs.filter(type='user').count(),
                'system': logs.filter(type='system').count(),
                'data': logs.filter(type='data').count(),
                'api': logs.filter(type='api').count(),
                'security': logs.filter(type='security').count(),
            },
            'unique_users': logs.values('user').distinct().count(),
            'period': period,
            'start_date': start_date,
            'end_date': end_date - timedelta(days=1),
        }

        return Response(stats)


class LogCleanupView(APIView):
    """Nettoyer les vieux logs (admin seulement)"""
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request):
        days = int(request.query_params.get('days', 30))
        cutoff_date = timezone.now() - timedelta(days=days)

        deleted_count = Log.objects.filter(created_at__lt=cutoff_date).delete()[0]

        return Response({
            'message': f'{deleted_count} logs supprimés',
            'deleted_count': deleted_count
        })


class LogCreateView(APIView):
    """Créer un log (utilisé en interne)"""
    permission_classes = [permissions.AllowAny]  # Mais avec validation

    def post(self, request):
        data = request.data.copy()

        # Ajouter des infos automatiquement
        if request.user.is_authenticated:
            data['user'] = request.user.id

        data['ip_address'] = request.META.get('REMOTE_ADDR')
        data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        data['path'] = request.path
        data['method'] = request.method

        serializer = LogSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)