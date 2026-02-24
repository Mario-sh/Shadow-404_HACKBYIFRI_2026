// src/services/ressources.js
import api from './api'

export const ressourcesService = {
  // Récupérer toutes les ressources
  getRessources: async (params = {}) => {
    try {
      const response = await api.get('/api/ressources/', { params })
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
      throw error
    }
  },

  // Récupérer une ressource par son ID
  getRessourceById: async (id) => {
    try {
      const response = await api.get(`/api/ressources/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors du chargement de la ressource ${id}:`, error)
      throw error
    }
  },

  // Créer une nouvelle ressource (professeur/admin)
  createRessource: async (ressourceData) => {
    try {
      // Si c'est un fichier, utiliser FormData
      if (ressourceData.fichier instanceof File) {
        const formData = new FormData()
        Object.keys(ressourceData).forEach(key => {
          formData.append(key, ressourceData[key])
        })
        const response = await api.post('/api/ressources/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
      } else {
        const response = await api.post('/api/ressources/', ressourceData)
        return response.data
      }
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error)
      throw error
    }
  },

  // Mettre à jour une ressource
  updateRessource: async (id, ressourceData) => {
    try {
      const response = await api.put(`/api/ressources/${id}/`, ressourceData)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la ressource ${id}:`, error)
      throw error
    }
  },

  // Supprimer une ressource
  deleteRessource: async (id) => {
    try {
      const response = await api.delete(`/api/ressources/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la suppression de la ressource ${id}:`, error)
      throw error
    }
  },

  // Télécharger une ressource
  downloadRessource: async (id) => {
    try {
      const response = await api.get(`/api/ressources/${id}/telecharger/`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error(`Erreur lors du téléchargement de la ressource ${id}:`, error)
      throw error
    }
  },

  // Récupérer les ressources par matière
  getRessourcesByMatiere: async (matiereId) => {
    try {
      const response = await api.get(`/api/ressources/?matiere=${matiereId}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des ressources par matière:', error)
      throw error
    }
  },

  // Récupérer les ressources récentes
  getRessourcesRecentes: async (limit = 5) => {
    try {
      const response = await api.get(`/api/ressources/?recentes=true&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des ressources récentes:', error)
      throw error
    }
  },

  // Rechercher des ressources
  searchRessources: async (query) => {
    try {
      const response = await api.get(`/api/ressources/?search=${query}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la recherche de ressources:', error)
      throw error
    }
  }
}