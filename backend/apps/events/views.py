from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Event
from .serializers import EventSerializer


class EventListCreateView(generics.ListCreateAPIView):
    """Liste et création des événements"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Event.objects.filter(user=user)

        # Filtres optionnels
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if month and year:
            queryset = queryset.filter(
                date__month=month,
                date__year=year
            )

        if start_date and end_date:
            queryset = queryset.filter(
                date__date__gte=start_date,
                date__date__lte=end_date
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un événement"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)


class UpcomingEventsView(APIView):
    """Récupérer les prochains événements"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        events = Event.objects.filter(
            user=request.user,
            date__gte=datetime.now()
        ).order_by('date')[:limit]

        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


class TodayEventsView(APIView):
    """Récupérer les événements du jour"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = datetime.now().date()
        events = Event.objects.filter(
            user=request.user,
            date__date=today
        ).order_by('date')

        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


class WeekEventsView(APIView):
    """Récupérer les événements de la semaine"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = datetime.now().date()
        week_later = today + timedelta(days=7)

        events = Event.objects.filter(
            user=request.user,
            date__date__gte=today,
            date__date__lte=week_later
        ).order_by('date')

        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)