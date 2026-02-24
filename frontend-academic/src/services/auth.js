import api from './api'

export const authService = {
  // Connexion
  login: (credentials) => api.post('/auth/login/', credentials),

  // Inscription
  register: (userData) => api.post('/auth/register/', userData),

  // Récupérer le profil
  getProfile: () => api.get('/auth/profile/'),

  // Mettre à jour le profil
  updateProfile: (data) => api.patch('/auth/profile/', data),

  // Déconnexion
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),

  // Rafraîchir le token
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
}