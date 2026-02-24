from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', views.ConversationCreateView.as_view(), name='conversation-create'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListCreateView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/mark-read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('conversations/<int:conversation_id>/typing/', views.TypingStatusView.as_view(), name='typing-status'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
]