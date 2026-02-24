import api from './api'

export const adminService = {
  // ===== UTILISATEURS =====
  getUtilisateurs: (params = {}) => {
    const queryParams = new URLSearchParams()

    if (params.role && params.role !== 'all') {
      queryParams.append('role', params.role)
    }
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status)
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }

    const queryString = queryParams.toString()
    const url = `/gestion-admin/utilisateurs/${queryString ? `?${queryString}` : ''}`

    return api.get(url)
  },

  createUtilisateur: (data) => api.post('/gestion-admin/utilisateurs/', data),
  updateUtilisateur: (id, data) => api.put(`/gestion-admin/utilisateurs/${id}/`, data),
  deleteUtilisateur: (id) => api.delete(`/gestion-admin/utilisateurs/${id}/`),

  // ===== PROFESSEURS EN ATTENTE =====
  getProfesseursEnAttente: () => api.get('/gestion-admin/professeurs/en-attente/'),
  validerProfesseur: (id) => api.post(`/gestion-admin/professeurs/${id}/valider/`),
  rejeterProfesseur: (id) => api.delete(`/gestion-admin/professeurs/${id}/`),

  // ===== CLASSES =====
  getClasses: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    const url = `/gestion-admin/classes/${queryParams.toString() ? `?${queryParams}` : ''}`
    return api.get(url)
  },
  createClasse: (data) => api.post('/gestion-admin/classes/', data),
  updateClasse: (id, data) => api.put(`/gestion-admin/classes/${id}/`, data),
  deleteClasse: (id) => api.delete(`/gestion-admin/classes/${id}/`),

  // ===== MATIÈRES =====
  getMatieres: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.classe_id) queryParams.append('classe_id', params.classe_id)
    const url = `/gestion-admin/matieres/${queryParams.toString() ? `?${queryParams}` : ''}`
    return api.get(url)
  },
  createMatiere: (data) => api.post('/gestion-admin/matieres/', data),
  updateMatiere: (id, data) => api.put(`/gestion-admin/matieres/${id}/`, data),
  deleteMatiere: (id) => api.delete(`/gestion-admin/matieres/${id}/`),

  // ===== LOGS =====
  getLogs: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.type && params.type !== 'all') queryParams.append('type', params.type)
    if (params.level && params.level !== 'all') queryParams.append('level', params.level)
    if (params.date) queryParams.append('date', params.date)
    if (params.search) queryParams.append('search', params.search)
    if (params.limit) queryParams.append('limit', params.limit)

    const url = `/gestion-admin/logs/${queryParams.toString() ? `?${queryParams}` : ''}`
    return api.get(url)
  },

  // ===== STATISTIQUES DASHBOARD =====
  getDashboardStats: (period = 'week') => api.get('/gestion-admin/stats/', { params: { period } }),
  getRecentActivities: () => api.get('/gestion-admin/activites/recentes/'),
}