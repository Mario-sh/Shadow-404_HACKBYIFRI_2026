from django.contrib.contenttypes.models import ContentType
from .models import Notification
from apps.academic.models import Etudiant
from apps.ai_engine.models import SuggestionExercice


class NotificationService:

    @staticmethod
    def notifier_suggestion(suggestion):
        """Notifier un étudiant d'une nouvelle suggestion d'exercice"""
        etudiant = suggestion.etudiant
        from apps.accounts.models import User
        user = User.objects.filter(email=etudiant.email).first()

        if user:
            content_type = ContentType.objects.get_for_model(suggestion)

            Notification.objects.create(
                destinataire=user,
                type='suggestion',
                titre=f"Nouvel exercice suggéré : {suggestion.exercice.titre}",
                message=suggestion.raison,
                content_type=content_type,
                object_id=suggestion.id_suggestion
            )

    @staticmethod
    def notifier_note_validee(note):
        """Notifier un étudiant quand une note est validée"""
        etudiant = note.student
        from apps.accounts.models import User
        user = User.objects.filter(email=etudiant.email).first()

        if user:
            content_type = ContentType.objects.get_for_model(note)

            Notification.objects.create(
                destinataire=user,
                type='validation',
                titre=f"Note validée : {note.matiere.nom_matière}",
                message=f"Vous avez obtenu {note.valeur_note}/20 en {note.matiere.nom_matière} ({note.get_type_evaluation_display()})",
                content_type=content_type,
                object_id=note.id_note
            )

    @staticmethod
    def get_notifications_non_lues(user):
        """Récupère les notifications non lues d'un utilisateur"""
        return Notification.objects.filter(destinataire=user, est_lu=False)

    @staticmethod
    def marquer_tout_comme_lu(user):
        """Marque toutes les notifications d'un utilisateur comme lues"""
        Notification.objects.filter(destinataire=user, est_lu=False).update(est_lu=True)