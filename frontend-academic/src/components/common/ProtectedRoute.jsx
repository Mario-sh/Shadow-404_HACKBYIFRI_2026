import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'professeur') return <Navigate to="/professeur" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute