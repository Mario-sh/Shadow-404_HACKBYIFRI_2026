from django.db.models import Avg, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from apps.academic.models import Etudiant, Note, BanqueExercices, Matiere
from .models import SuggestionExercice, StatistiqueApprentissage
import random
import math


class SmartSuggestionEngine:
    """
    Moteur de suggestions intelligent basé sur :
    - Notes de l'étudiant
    - Difficulté des exercices
    - Historique des suggestions
    - Progression dans le temps
    - Matières prioritaires
    """

    def __init__(self, etudiant_id):
        self.etudiant = Etudiant.objects.get(id_student=etudiant_id)
        self.notes = Note.objects.filter(student=etudiant, valide=True)
        self.suggestions_recents = SuggestionExercice.objects.filter(
            etudiant=etudiant,
            date_suggestion__gte=timezone.now() - timedelta(days=7)
        )

    def analyser_performance(self):
        """Analyse complète de la performance de l'étudiant"""

        # 1. Moyenne générale
        moyenne_generale = self.notes.aggregate(Avg('valeur_note'))['valeur_note__avg'] or 0

        # 2. Performance par matière
        performance_par_matiere = {}
        for matiere in Matiere.objects.all():
            notes_matiere = self.notes.filter(matiere=matiere)
            if notes_matiere.exists():
                moyenne = notes_matiere.aggregate(Avg('valeur_note'))['valeur_note__avg']
                nb_notes = notes_matiere.count()
                performance_par_matiere[matiere.id_matiere] = {
                    'nom': matiere.nom_matière,
                    'moyenne': moyenne,
                    'nb_notes': nb_notes,
                    'coefficient': matiere.coefficient,
                    'priorite': self._calculer_priorite(moyenne, matiere.coefficient)
                }

        # 3. Matières à risque (notes < 10)
        matieres_risque = [
            m for m in performance_par_matiere.values()
            if m['moyenne'] < 10
        ]

        # 4. Progression récente
        progression = self._analyser_progression()

        return {
            'moyenne_generale': round(moyenne_generale, 2),
            'performance_par_matiere': performance_par_matiere,
            'matieres_risque': matieres_risque,
            'progression': progression,
            'niveau_global': self._determiner_niveau_global(moyenne_generale)
        }

    def _calculer_priorite(self, moyenne, coefficient):
        """Calcule la priorité d'une matière (0-100)"""
        if moyenne >= 16:
            return 0  # Déjà excellent
        elif moyenne >= 12:
            return 30  # Correct
        elif moyenne >= 10:
            return 60  # Limite
        else:
            # Priorité élevée : (10 - moyenne) * coefficient * 5
            return min(100, (10 - moyenne) * coefficient * 5)

    def _determiner_niveau_global(self, moyenne):
        """Détermine le niveau global de l'étudiant"""
        if moyenne >= 16:
            return "expert"
        elif moyenne >= 12:
            return "intermediaire"
        elif moyenne >= 10:
            return "débutant"
        else:
            return "critique"

    def _analyser_progression(self):
        """Analyse la progression sur les 30 derniers jours"""
        date_limite = timezone.now() - timedelta(days=30)

        notes_recentes = self.notes.filter(date_note__gte=date_limite)

        if notes_recentes.count() < 2:
            return "progression_insuffisante"

        # Moyenne des 15 premiers jours vs 15 derniers jours
        mi_parcours = timezone.now() - timedelta(days=15)

        anciennes = notes_recentes.filter(date_note__lt=mi_parcours)
        recentes = notes_recentes.filter(date_note__gte=mi_parcours)

        if not anciennes.exists() or not recentes.exists():
            return "donnees_insuffisantes"

        moyenne_ancienne = anciennes.aggregate(Avg('valeur_note'))['valeur_note__avg']
        moyenne_recente = recentes.aggregate(Avg('valeur_note'))['valeur_note__avg']

        difference = moyenne_recente - moyenne_ancienne

        if difference > 2:
            return "en_progres"
        elif difference < -2:
            return "en_baisse"
        else:
            return "stable"

    def suggerer_exercices(self, nb_suggestions=5):
        """Génère des suggestions d'exercices intelligentes"""

        # 1. Analyser la performance
        performance = self.analyser_performance()

        # 2. Récupérer les exercices déjà suggérés récemment
        exercices_deja_suggeres = self.suggestions_recents.values_list('exercice_id', flat=True)

        # 3. Définir les poids pour chaque matière
        suggestions = []

        for matiere_id, data in performance['performance_par_matiere'].items():
            priorite = data['priorite']

            if priorite == 0:
                continue  # Ignorer les matières où l'étudiant excelle

            # Déterminer la difficulté appropriée
            if data['moyenne'] < 8:
                difficulte = 1  # Facile
            elif data['moyenne'] < 12:
                difficulte = 2  # Moyen
            else:
                difficulte = 3  # Difficile

            # Chercher des exercices non suggérés récemment
            exercices = BanqueExercices.objects.filter(
                subject_id=matiere_id,
                niveau_difficulte=difficulte
            ).exclude(
                id_exercice__in=exercices_deja_suggeres
            ).order_by('?')[:min(3, nb_suggestions)]

            for exo in exercices:
                suggestions.append({
                    'exercice': exo,
                    'matiere': data['nom'],
                    'note_actuelle': data['moyenne'],
                    'priorite': priorite,
                    'raison': self._generer_raison(data, performance['niveau_global']),
                    'difficulte': difficulte
                })

        # 4. Trier par priorité et limiter
        suggestions.sort(key=lambda x: x['priorite'], reverse=True)
        suggestions = suggestions[:nb_suggestions]

        # 5. Compléter si pas assez de suggestions
        if len(suggestions) < nb_suggestions:
            suggestions += self._suggestions_aleatoires(
                nb_suggestions - len(suggestions),
                exercices_deja_suggeres
            )

        return suggestions

    def _generer_raison(self, data_matiere, niveau_global):
        """Génère une raison personnalisée pour la suggestion"""

        moyenne = data_matiere['moyenne']
        nom_matiere = data_matiere['nom']

        if moyenne < 8:
            return f"⚠️ **Urgent** : Ta moyenne en {nom_matiere} est de {moyenne}/20. Commence par des exercices faciles pour consolider les bases."
        elif moyenne < 10:
            return f"📚 **À travailler** : Tu as {moyenne}/20 en {nom_matiere}. Avec un peu de travail, tu peux passer au-dessus de la moyenne !"
        elif moyenne < 12:
            return f"👍 **Bon niveau** : Ta moyenne de {moyenne}/20 en {nom_matiere} est correcte. Voici des exercices pour viser l'excellence !"
        else:
            return f"🌟 **Déjà bon** : Tu as {moyenne}/20 en {nom_matiere}. Challenge-toi avec ces exercices plus difficiles !"

    def _suggestions_aleatoires(self, nombre, a_exclure):
        """Complète avec des suggestions aléatoires si besoin"""
        exercices = BanqueExercices.objects.exclude(
            id_exercice__in=a_exclure
        ).order_by('?')[:nombre]

        suggestions = []
        for exo in exercices:
            suggestions.append({
                'exercice': exo,
                'matiere': exo.subject.nom_matière,
                'note_actuelle': None,
                'priorite': 30,
                'raison': "🌱 Pour diversifier tes compétences, essaie cet exercice !",
                'difficulte': exo.niveau_difficulte
            })

        return suggestions

    def sauvegarder_suggestions(self, suggestions):
        """Sauvegarde les suggestions en base de données"""
        for sugg in suggestions:
            SuggestionExercice.objects.create(
                etudiant=self.etudiant,
                exercice=sugg['exercice'],
                matiere=sugg['exercice'].subject,
                note_actuelle=sugg.get('note_actuelle'),
                raison=sugg['raison'],
                niveau_suggere=sugg['difficulte']
            )

    def get_statistiques_apprentissage(self):
        """Retourne les statistiques d'apprentissage"""
        stats, created = StatistiqueApprentissage.objects.get_or_create(
            etudiant=self.etudiant,
            defaults={
                'moyenne': self.analyser_performance()['moyenne_generale'],
                'taux_reussite': self._calculer_taux_reussite()
            }
        )
        return stats

    def _calculer_taux_reussite(self):
        """Calcule le taux de réussite aux exercices suggérés"""
        suggestions_faites = self.suggestions_recents.filter(est_faite=True)
        if not suggestions_faites.exists():
            return 0

        # Ici tu pourrais ajouter une logique pour évaluer la réussite
        # Par exemple, vérifier si l'étudiant a amélioré ses notes après
        return 50  # Valeur par défaut