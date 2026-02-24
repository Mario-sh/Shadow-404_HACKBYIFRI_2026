import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token')

      if (token) {
        try {
          const response = await authService.getProfile()
          console.log('✅ Profil chargé:', response.data)
          setUser(response.data)
        } catch (error) {
          console.error('❌ Erreur chargement profil:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }

      setLoading(false)
    }

    loadUser()
  }, [])

  const login = async (credentials) => {
    try {
      console.log('📤 Tentative de connexion avec:', credentials)
      const response = await authService.login(credentials)
      console.log('✅ Réponse login:', response.data)

      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)

      if (response.data.user) {
        setUser(response.data.user)
        console.log('👤 Utilisateur connecté:', response.data.user)
        navigate('/dashboard')
        return { success: true }
      } else {
        return { success: false, error: 'Format de réponse invalide' }
      }
    } catch (error) {
      console.error('❌ Erreur login:', error)
      console.error('Détails:', error.response?.data)

      let errorMessage = 'Erreur de connexion'
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).join(', ')
        } else {
          errorMessage = error.response.data
        }
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      console.log('✅ Réponse register:', response.data)

      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)

      setUser(response.data.user)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      console.error('❌ Erreur register:', error)
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de l\'inscription'
      }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        // Essayer de déconnecter, mais ne pas bloquer si ça échoue
        await authService.logout({ refresh: refreshToken }).catch(err => {
          console.warn('Erreur logout API, nettoyage local quand même', err)
        })
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error)
    } finally {
      // Toujours nettoyer le localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      navigate('/login')
      toast.success('Déconnexion réussie')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}