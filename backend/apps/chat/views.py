from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from .models import Conversation, Message, Participant
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer


class ConversationListView(generics.ListAPIView):
    """Liste des conversations de l'utilisateur"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).order_by('-updated_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ConversationCreateView(generics.CreateAPIView):
    """Créer une nouvelle conversation"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation = serializer.save(created_by=self.request.user)
        conversation.participants.add(self.request.user)

        # Ajouter les autres participants
        participant_ids = self.request.data.get('participant_ids', [])
        for pid in participant_ids:
            conversation.participants.add(pid)

        # Créer les participants dans la table Participant
        for user in conversation.participants.all():
            Participant.objects.get_or_create(
                conversation=conversation,
                user=user
            )


class ConversationDetailView(generics.RetrieveAPIView):
    """Détails d'une conversation avec ses messages"""
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MessageListCreateView(generics.ListCreateAPIView):
    """Liste et création des messages d'une conversation"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(conversation_id=conversation_id).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)

        # Vérifier que l'utilisateur participe à la conversation
        if self.request.user not in conversation.participants.all():
            raise PermissionError("Vous ne participez pas à cette conversation")

        message = serializer.save(
            conversation=conversation,
            sender=self.request.user
        )

        # Marquer comme lu pour l'expéditeur
        message.read_by.add(self.request.user)

        # Mettre à jour la date de la conversation
        conversation.updated_at = timezone.now()
        conversation.save()


class MarkAsReadView(APIView):
    """Marquer les messages d'une conversation comme lus"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Marquer tous les messages non lus comme lus
        messages = Message.objects.filter(
            conversation=conversation
        ).exclude(
            sender=request.user
        ).exclude(
            read_by=request.user
        )

        for message in messages:
            message.read_by.add(request.user)

        # Mettre à jour last_read pour le participant
        Participant.objects.filter(
            conversation=conversation,
            user=request.user
        ).update(last_read=timezone.now())

        return Response({'message': 'Messages marqués comme lus'})


class TypingStatusView(APIView):
    """Mettre à jour le statut de frappe"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            participant = Participant.objects.get(
                conversation_id=conversation_id,
                user=request.user
            )
        except Participant.DoesNotExist:
            return Response(
                {'error': 'Participant non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        is_typing = request.data.get('is_typing', False)
        participant.is_typing = is_typing
        participant.save()

        return Response({'status': 'ok'})


class UnreadCountView(APIView):
    """Récupérer le nombre total de messages non lus"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(participants=request.user)
        total_unread = 0

        for conv in conversations:
            unread = conv.messages.filter(
                ~Q(read_by=request.user),
                ~Q(sender=request.user)
            ).count()
            total_unread += unread

        return Response({'unread_count': total_unread})