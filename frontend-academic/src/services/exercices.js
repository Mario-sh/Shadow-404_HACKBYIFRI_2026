// src/services/exercices.js
import api from './api'

export const exercicesService = {
  // Récupérer tous les exercices (avec filtres optionnels)
  getExercices: async (params = {}) => {
    try {
      const response = await api.get('/api/exercices/', { params })
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des exercices:', error)
      throw error
    }
  },

  // Récupérer un exercice par son ID
  getExerciceById: async (id) => {
    try {
      const response = await api.get(`/api/exercices/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors du chargement de l'exercice ${id}:`, error)
      throw error
    }
  },

  // Créer un nouvel exercice (professeur/admin)
  createExercice: async (exerciceData) => {
    try {
      const response = await api.post('/api/exercices/', exerciceData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de l\'exercice:', error)
      throw error
    }
  },

  // Mettre à jour un exercice
  updateExercice: async (id, exerciceData) => {
    try {
      const response = await api.put(`/api/exercices/${id}/`, exerciceData)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'exercice ${id}:`, error)
      throw error
    }
  },

  // Supprimer un exercice
  deleteExercice: async (id) => {
    try {
      const response = await api.delete(`/api/exercices/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'exercice ${id}:`, error)
      throw error
    }
  },

  // Soumettre une réponse à un exercice (étudiant)
  submitReponse: async (exerciceId, reponseData) => {
    try {
      const response = await api.post(`/api/exercices/${exerciceId}/soumettre/`, reponseData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error)
      throw error
    }
  },

  // Récupérer les exercices par matière
  getExercicesByMatiere: async (matiereId) => {
    try {
      const response = await api.get(`/api/exercices/?matiere=${matiereId}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des exercices par matière:', error)
      throw error
    }
  },

  // Récupérer les exercices à faire pour un étudiant
  getExercicesAEfaire: async () => {
    try {
      const response = await api.get('/api/exercices/a_faire/')
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des exercices à faire:', error)
      throw error
    }
  },

  // Récupérer les exercices corrigés pour un étudiant
  getExercicesCorriges: async () => {
    try {
      const response = await api.get('/api/exercices/corriges/')
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des exercices corrigés:', error)
      throw error
    }
  }
}