from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('non_lues/', views.NotificationNonLuesView.as_view(), name='notification-non-lues'),
    path('<int:pk>/marquer_lu/', views.MarquerNotificationLuView.as_view(), name='notification-marquer-lu'),
    path('marquer_tout_lu/', views.MarquerToutLuView.as_view(), name='notification-marquer-tout-lu'),
]