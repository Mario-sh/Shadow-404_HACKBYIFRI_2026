import api from './api'

// Données mockées pour le développement
const mockNotifications = [
  {
    id_notification: 1,
    type: 'suggestion',
    titre: 'Nouvelle suggestion d\'exercice',
    message: 'Un exercice en Mathématiques vous est recommandé',
    date_creation: new Date(Date.now() - 3600000).toISOString(),
    est_lu: false,
    date_lecture: null
  },
  {
    id_notification: 2,
    type: 'validation',
    titre: 'Note validée',
    message: 'Votre note de Physique a été validée',
    date_creation: new Date(Date.now() - 86400000).toISOString(),
    est_lu: true,
    date_lecture: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id_notification: 3,
    type: 'info',
    titre: 'Nouveau cours disponible',
    message: 'Un nouveau cours d\'Informatique a été ajouté',
    date_creation: new Date(Date.now() - 172800000).toISOString(),
    est_lu: false,
    date_lecture: null
  }
]

export const notificationsService = {
  // Liste des notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/')
      // Si la réponse a une propriété results, retourner results
      if (response.data?.results) {
        return { data: response.data.results }
      }
      // Si la réponse est déjà un tableau
      if (Array.isArray(response.data)) {
        return { data: response.data }
      }
      // Sinon, retourner un tableau vide
      return { data: [] }
    } catch (error) {
      console.log('⚠️ Utilisation des données mockées pour les notifications')
      return { data: mockNotifications }
    }
  },

  // Notifications non lues
  getNonLues: async () => {
    try {
      const response = await api.get('/notifications/non_lues/')
      if (response.data?.results) {
        return { data: response.data.results }
      }
      if (Array.isArray(response.data)) {
        return { data: response.data }
      }
      return { data: mockNotifications.filter(n => !n.est_lu) }
    } catch (error) {
      console.log('⚠️ Utilisation des données mockées pour les notifications non lues')
      return { data: mockNotifications.filter(n => !n.est_lu) }
    }
  },

  // Marquer une notification comme lue
  marquerLu: async (id) => {
    try {
      const response = await api.post(`/notifications/${id}/marquer_lu/`)
      return response.data
    } catch (error) {
      console.log('⚠️ Simulation de marquage comme lu')
      return { success: true }
    }
  },

  // Marquer toutes comme lues
  marquerToutLu: async () => {
    try {
      const response = await api.post('/notifications/marquer_tout_lu/')
      return response.data
    } catch (error) {
      console.log('⚠️ Simulation de marquage tout comme lu')
      return { success: true }
    }
  }
}