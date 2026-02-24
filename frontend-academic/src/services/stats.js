import api from './api'

export const statsService = {
  // Performance par étudiant
  getPerformanceStats: (params = {}) => api.get('/stats/performance/', { params }),
  getPerformanceDetail: (id) => api.get(`/stats/performance/${id}/`),
  calculatePerformance: (etudiantId) => api.post(`/stats/performance/calculate/${etudiantId}/`),

  // Statistiques par classe
  getClasseStats: () => api.get('/stats/classes/'),
  calculateClasseStats: (classeId) => api.post(`/stats/classes/calculate/${classeId}/`),

  // Statistiques globales
  getGlobalStats: () => api.get('/stats/global/'),
  calculateGlobalStats: () => api.post('/stats/global/calculate/'),
}