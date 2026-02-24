import axios from 'axios'

// ============================================
// 1. CONFIGURATION DE L'URL DE BASE
// ============================================
// Utilise la variable d'environnement VITE_API_URL si disponible,
// sinon utilise localhost pour le développement local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_URL = `${API_BASE_URL}/api`

console.log('🌐 API Base URL:', API_BASE_URL)  // Utile pour le débogage

// ============================================
// 2. CRÉATION DE L'INSTANCE AXIOS
// ============================================
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Augmenté à 30 secondes pour Render (qui peut être lent au réveil)
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// 3. INTERCEPTEUR POUR LE TOKEN JWT
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ============================================
// 4. INTERCEPTEUR POUR LES ERREURS 401 (TOKEN EXPIRE)
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Évite les boucles infinies
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          // Pas de refresh token, rediriger vers login
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken
        })

        // Sauvegarder le nouveau token
        localStorage.setItem('access_token', response.data.access)

        // Mettre à jour le header et réessayer la requête
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`
        return api(originalRequest)

      } catch (refreshError) {
        console.error('❌ Erreur de rafraîchissement du token:', refreshError)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Gestion des erreurs serveur
    if (error.response?.status >= 500) {
      console.error('❌ Erreur serveur:', error.response.data)
      // Vous pouvez ajouter une notification ici
    }

    return Promise.reject(error)
  }
)

// ============================================
// 5. FONCTIONS UTILITAIRES OPTIONNELLES
// ============================================

// Vérifier si l'API est accessible
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health/')
    return response.status === 200
  } catch (error) {
    console.error('❌ API non accessible:', error)
    return false
  }
}

// Déconnexion propre
export const logout = () => {
  localStorage.clear()
  window.location.href = '/login'
}

export default api