from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.academic.models import Etudiant
from .models import SuggestionExercice
from .ia_logic import SmartSuggestionEngine
from apps.academic.api.serializers import BanqueExercicesSerializer
from apps.notifications.services import NotificationService


class SmartSuggestionViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def pour_etudiant(self, request):
        """
        Génère des suggestions intelligentes d'exercices pour un étudiant
        et envoie des notifications
        """
        # Récupérer les paramètres
        etudiant_id = request.query_params.get('etudiant_id')
        nb_suggestions = int(request.query_params.get('nb', 5))

        # Validation du paramètre etudiant_id
        if not etudiant_id:
            return Response(
                {"error": "Paramètre 'etudiant_id' requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Récupérer l'étudiant
            etudiant = Etudiant.objects.get(id_student=etudiant_id)

            # 2. Initialiser le moteur IA
            moteur = SmartSuggestionEngine(etudiant_id)

            # 3. Obtenir l'analyse de performance
            analyse = moteur.analyser_performance()

            # 4. Générer les suggestions
            suggestions_data = moteur.suggerer_exercices(nb_suggestions)

            # 5. Sauvegarder en base et créer des notifications
            suggestions_sauvegardees = []
            for sugg_data in suggestions_data:
                # Créer la suggestion en base
                suggestion = SuggestionExercice.objects.create(
                    etudiant=etudiant,
                    exercice=sugg_data['exercice'],
                    matiere=sugg_data['exercice'].subject,
                    note_actuelle=sugg_data.get('note_actuelle'),
                    raison=sugg_data['raison'],
                    niveau_suggere=sugg_data['difficulte']
                )
                suggestions_sauvegardees.append(suggestion)

                # Envoyer une notification à l'étudiant
                NotificationService.notifier_suggestion(suggestion)

            # 6. Préparer la réponse (sérialiser les exercices)
            resultat = []
            for sugg in suggestions_sauvegardees:
                serialized = BanqueExercicesSerializer(sugg.exercice).data
                serialized['suggestion_id'] = sugg.id_suggestion
                serialized['raison'] = sugg.raison
                serialized['note_actuelle'] = float(sugg.note_actuelle) if sugg.note_actuelle else None
                serialized['date_suggestion'] = sugg.date_suggestion
                resultat.append(serialized)

            # 7. Retourner la réponse complète
            return Response({
                'success': True,
                'etudiant_id': etudiant.id_student,
                'etudiant_nom': f"{etudiant.prenom} {etudiant.nom}",
                'nb_suggestions': len(resultat),
                'suggestions': resultat,
                'analyse': {
                    'moyenne_generale': analyse.get('moyenne_generale'),
                    'niveau_global': analyse.get('niveau_global'),
                    'matieres_risque': [
                        {
                            'nom': m['nom'],
                            'moyenne': m['moyenne'],
                            'priorite': m['priorite']
                        } for m in analyse.get('matieres_risque', [])
                    ],
                    'progression': analyse.get('progression')
                }
            }, status=status.HTTP_200_OK)

        except Etudiant.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': "Étudiant non trouvé",
                    'etudiant_id': etudiant_id
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'error': str(e),
                    'etudiant_id': etudiant_id
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def feedback(self, request):
        """
        Enregistre le feedback sur une suggestion
        """
        suggestion_id = request.data.get('suggestion_id')
        est_utile = request.data.get('est_utile')

        try:
            suggestion = SuggestionExercice.objects.get(id_suggestion=suggestion_id)
            suggestion.est_consultee = True
            if est_utile is not None:
                # Tu pourrais ajouter un champ pour ça dans le modèle
                pass
            suggestion.save()
            return Response(
                {
                    'success': True,
                    'message': "Feedback enregistré"
                },
                status=status.HTTP_200_OK
            )
        except SuggestionExercice.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': "Suggestion non trouvée"
                },
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def analyse_complete(self, request):
        """
        Retourne une analyse complète d'un étudiant sans suggestions
        """
        etudiant_id = request.query_params.get('etudiant_id')

        if not etudiant_id:
            return Response(
                {"error": "Paramètre 'etudiant_id' requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            moteur = SmartSuggestionEngine(etudiant_id)
            analyse = moteur.analyser_performance()

            # Ajouter les informations de base de l'étudiant
            etudiant = Etudiant.objects.get(id_student=etudiant_id)
            analyse['etudiant'] = {
                'id': etudiant.id_student,
                'nom': f"{etudiant.prenom} {etudiant.nom}",
                'classe': etudiant.classe.nom_class if etudiant.classe else None
            }

            return Response(analyse, status=status.HTTP_200_OK)

        except Etudiant.DoesNotExist:
            return Response(
                {"error": "Étudiant non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )