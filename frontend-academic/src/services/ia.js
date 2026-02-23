import api from './api'

export const iaService = {
  getSuggestions: (etudiantId, nb = 5) => {
    const id = Number(etudiantId)
    return api.get(`/ia/suggestions/pour_etudiant/?etudiant_id=${id}&nb=${nb}`)
  },

  getAnalyseComplete: (etudiantId) => {
    const id = Number(etudiantId)
    return api.get(`/ia/suggestions/analyse_complete/?etudiant_id=${id}`)
  },

  sendFeedback: (data) => api.post('/ia/suggestions/feedback/', data),
}