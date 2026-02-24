import api from './api'

export const iaService = {
  // Suggestions d'exercices pour un étudiant
  getSuggestions: (etudiantId, nb = 5) =>
    api.get(`/ia/suggestions/pour_etudiant/?etudiant_id=${etudiantId}&nb=${nb}`),

  // Analyse complète des performances
  getAnalyseComplete: (etudiantId) =>
    api.get(`/ia/suggestions/analyse_complete/?etudiant_id=${etudiantId}`),

  // Feedback sur une suggestion
  sendFeedback: (suggestionId, estUtile) =>
    api.post('/ia/suggestions/feedback/', { suggestion_id: suggestionId, est_utile: estUtile }),
}