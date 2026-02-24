from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Avg
from apps.academic.models import Etudiant, Note, BanqueExercices
from .models import SuggestionExercice, StatistiqueApprentissage
from .serializers import SuggestionExerciceSerializer, StatistiqueApprentissageSerializer


class SuggestionsPourEtudiantView(APIView):
    """Suggestions d'exercices personnalisées pour un étudiant"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        etudiant_id = request.query_params.get('etudiant_id')
        nb_suggestions = int(request.query_params.get('nb', 5))

        if not etudiant_id:
            return Response(
                {'error': 'Le paramètre etudiant_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            etudiant = Etudiant.objects.get(id_student=etudiant_id)
        except Etudiant.DoesNotExist:
            return Response(
                {'error': 'Étudiant non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Récupérer toutes les notes de l'étudiant
        notes = Note.objects.filter(student=etudiant)

        # Analyser les performances par matière
        performances = {}
        for note in notes:
            matiere_id = note.matiere.id_matiere
            if matiere_id not in performances:
                performances[matiere_id] = {
                    'nom': note.matiere.nom_matière,
                    'notes': [],
                    'moyenne': 0,
                    'coefficient': note.matiere.coefficient
                }
            performances[matiere_id]['notes'].append(float(note.valeur_note))

        # Calculer les moyennes par matière
        for matiere_id, data in performances.items():
            if data['notes']:
                data['moyenne'] = sum(data['notes']) / len(data['notes'])

        # Identifier les matières faibles (note < 10)
        matieres_faibles = []
        for matiere_id, data in performances.items():
            if data['moyenne'] < 10:
                matieres_faibles.append({
                    'id': matiere_id,
                    'nom': data['nom'],
                    'moyenne': data['moyenne'],
                    'coefficient': data['coefficient']
                })

        # Trier par priorité (les plus faibles d'abord)
        matieres_faibles.sort(key=lambda x: x['moyenne'])

        suggestions = []

        # Pour chaque matière faible, trouver des exercices adaptés
        for matiere in matieres_faibles[:3]:
            # Déterminer le niveau de difficulté approprié
            if matiere['moyenne'] < 8:
                niveau = 1
            elif matiere['moyenne'] < 12:
                niveau = 2
            else:
                niveau = 3

            # Calculer la priorité
            priorite = int((10 - matiere['moyenne']) * matiere['coefficient'] * 5)
            priorite = max(0, min(100, priorite))

            # Chercher des exercices
            exercices = BanqueExercices.objects.filter(
                subject_id=matiere['id'],
                niveau_difficulte=niveau
            )[:2]

            for exercice in exercices:
                if matiere['moyenne'] < 8:
                    raison = f"⚠️ Urgent : Ta moyenne en {matiere['nom']} est de {matiere['moyenne']:.1f}/20. Commence par des exercices faciles."
                elif matiere['moyenne'] < 12:
                    raison = f"📚 À travailler : Tu as {matiere['moyenne']:.1f}/20 en {matiere['nom']}. Des exercices progressifs t'aideront."
                else:
                    raison = f"📊 Pour approfondir : Tu as {matiere['moyenne']:.1f}/20 en {matiere['nom']}. Voici des exercices avancés."

                suggestion = {
                    'id_exercice': exercice.id_exercice,
                    'titre': exercice.titre,
                    'subject_nom': matiere['nom'],
                    'niveau_difficulte': exercice.niveau_difficulte,
                    'raison': raison,
                    'note_actuelle': round(matiere['moyenne'], 1),
                    'priorite': priorite
                }
                suggestions.append(suggestion)

                # Sauvegarder en base
                SuggestionExercice.objects.create(
                    etudiant=etudiant,
                    exercice=exercice,
                    matiere_id=matiere['id'],
                    note_actuelle=matiere['moyenne'],
                    raison=raison,
                    niveau_suggere=exercice.niveau_difficulte
                )

        # Si pas assez de suggestions, ajouter des exercices aléatoires
        if len(suggestions) < nb_suggestions:
            exercices_aleatoires = BanqueExercices.objects.all().order_by('?')[:nb_suggestions - len(suggestions)]
            for exercice in exercices_aleatoires:
                suggestion = {
                    'id_exercice': exercice.id_exercice,
                    'titre': exercice.titre,
                    'subject_nom': exercice.subject.nom_matière,
                    'niveau_difficulte': exercice.niveau_difficulte,
                    'raison': "🌟 Exercice recommandé pour diversifier tes compétences.",
                    'note_actuelle': None,
                    'priorite': 30
                }
                suggestions.append(suggestion)

        # Préparer l'analyse
        moyenne_generale = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']

        analyse = {
            'moyenne_generale': round(moyenne_generale, 1) if moyenne_generale else None,
            'niveau_global': self._determiner_niveau(moyenne_generale),
            'progression': 'stable',
            'matieres_risque': [
                {
                    'nom': m['nom'],
                    'moyenne': round(m['moyenne'], 1),
                    'priorite': int((10 - m['moyenne']) * m['coefficient'] * 5)
                }
                for m in matieres_faibles
            ]
        }

        return Response({
            'success': True,
            'etudiant_id': int(etudiant_id),
            'etudiant_nom': f"{etudiant.prenom} {etudiant.nom}",
            'nb_suggestions': len(suggestions),
            'suggestions': suggestions[:nb_suggestions],
            'analyse': analyse
        })

    def _determiner_niveau(self, moyenne):
        if not moyenne:
            return 'debutant'
        if moyenne < 10:
            return 'debutant'
        if moyenne < 12:
            return 'intermediaire'
        if moyenne < 16:
            return 'avance'
        return 'expert'


class AnalyseCompleteView(APIView):
    """Analyse détaillée des performances d'un étudiant"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        etudiant_id = request.query_params.get('etudiant_id')

        if not etudiant_id:
            return Response(
                {'error': 'Le paramètre etudiant_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            etudiant = Etudiant.objects.get(id_student=etudiant_id)
        except Etudiant.DoesNotExist:
            return Response(
                {'error': 'Étudiant non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        notes = Note.objects.filter(student=etudiant)

        if not notes.exists():
            return Response({
                'moyenne_generale': None,
                'performance_par_matiere': {},
                'matieres_risque': [],
                'progression': 'stable',
                'niveau_global': 'debutant',
                'etudiant': {
                    'id': etudiant.id_student,
                    'nom': f"{etudiant.prenom} {etudiant.nom}",
                    'classe': etudiant.classe.nom_class if etudiant.classe else None
                }
            })

        # Calcul des performances par matière
        performance_par_matiere = {}
        for note in notes:
            matiere_id = note.matiere.id_matiere
            if matiere_id not in performance_par_matiere:
                performance_par_matiere[matiere_id] = {
                    'nom': note.matiere.nom_matière,
                    'notes': [],
                    'coefficient': note.matiere.coefficient
                }
            performance_par_matiere[matiere_id]['notes'].append(float(note.valeur_note))

        for matiere_id, data in performance_par_matiere.items():
            if data['notes']:
                moyenne = sum(data['notes']) / len(data['notes'])
                priorite = int((10 - moyenne) * data['coefficient'] * 5)
                performance_par_matiere[matiere_id] = {
                    'nom': data['nom'],
                    'moyenne': round(moyenne, 2),
                    'nb_notes': len(data['notes']),
                    'coefficient': data['coefficient'],
                    'priorite': max(0, min(100, priorite))
                }

        # Matières à risque
        matieres_risque = [
            {
                'nom': data['nom'],
                'moyenne': data['moyenne'],
                'priorite': data['priorite']
            }
            for data in performance_par_matiere.values()
            if data['moyenne'] < 10
        ]
        matieres_risque.sort(key=lambda x: x['priorite'], reverse=True)

        # Progression
        progression = 'stable'
        moyenne_generale = notes.aggregate(Avg('valeur_note'))['valeur_note__avg']
        niveau_global = self._determiner_niveau(moyenne_generale)

        return Response({
            'moyenne_generale': round(moyenne_generale, 2),
            'performance_par_matiere': performance_par_matiere,
            'matieres_risque': matieres_risque,
            'progression': progression,
            'niveau_global': niveau_global,
            'etudiant': {
                'id': etudiant.id_student,
                'nom': f"{etudiant.prenom} {etudiant.nom}",
                'classe': etudiant.classe.nom_class if etudiant.classe else None
            }
        })

    def _determiner_niveau(self, moyenne):
        if not moyenne:
            return 'debutant'
        if moyenne < 10:
            return 'debutant'
        if moyenne < 12:
            return 'intermediaire'
        if moyenne < 16:
            return 'avance'
        return 'expert'


class FeedbackSuggestionView(APIView):
    """Enregistrer le feedback sur une suggestion"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        suggestion_id = request.data.get('suggestion_id')
        est_utile = request.data.get('est_utile')

        if not suggestion_id or est_utile is None:
            return Response(
                {'error': 'Les champs suggestion_id et est_utile sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            suggestion = SuggestionExercice.objects.get(id_suggestion=suggestion_id)
        except SuggestionExercice.DoesNotExist:
            return Response(
                {'error': 'Suggestion non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        suggestion.est_consultee = True
        suggestion.save()

        return Response({
            'success': True,
            'message': 'Feedback enregistré'
        })