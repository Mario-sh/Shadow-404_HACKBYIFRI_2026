from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.EventListCreateView.as_view(), name='event-list'),
    path('events/<int:pk>/', views.EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),
    path('events/upcoming/', views.UpcomingEventsView.as_view(), name='events-upcoming'),
    path('events/today/', views.TodayEventsView.as_view(), name='events-today'),
    path('events/week/', views.WeekEventsView.as_view(), name='events-week'),
]