import api from './api'

export const academicService = {
  // Étudiants
  getEtudiants: (params = {}) => api.get('/academic/etudiants/', { params }),
  getEtudiant: (id) => api.get(`/academic/etudiants/${id}/`),

  // Notes - CORRIGÉ
  getNotes: (etudiantId) => {
    const id = Number(etudiantId)
    return api.get(`/academic/etudiants/${id}/notes/`)
  },

  // Statistiques - CORRIGÉ
  getStatistiques: (etudiantId) => {
    const id = Number(etudiantId)
    return api.get(`/academic/etudiants/${id}/statistiques/`)
  },

  // Classes
  getClasses: () => api.get('/academic/classes/'),

  // Matières
  getMatieres: () => api.get('/academic/matieres/'),

  // Exercices
  getExercices: (params = {}) =>
    api.get('/academic/exercices/', { params })
      .then(response => {
        if (Array.isArray(response.data)) return response.data
        if (response.data?.results) return response.data.results
        return []
      }),
}