import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.js'

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
          setUser(response.data)
        } catch (error) {
          console.error('Failed to load user', error)
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
      const response = await authService.login(credentials)

      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)

      setUser(response.data.user)
      navigate('/')

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erreur de connexion'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)

      // Auto-login après inscription
      const loginResponse = await authService.login({
        username: userData.username,
        password: userData.password
      })

      localStorage.setItem('access_token', loginResponse.data.access)
      localStorage.setItem('refresh_token', loginResponse.data.refresh)

      setUser(loginResponse.data.user)
      navigate('/')

      return { success: true }
    } catch (error) {
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
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      navigate('/login')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}