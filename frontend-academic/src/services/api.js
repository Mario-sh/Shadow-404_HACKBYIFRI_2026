import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('🔵 Requête:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('🟢 Réponse:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.log('🔴 Erreur:', error.response?.status, error.config?.url)
    return Promise.reject(error)
  }
)

export default api