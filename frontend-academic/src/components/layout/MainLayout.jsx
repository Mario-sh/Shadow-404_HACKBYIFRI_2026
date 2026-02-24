// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

const MainLayout = () => {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Ferme le sidebar automatiquement quand on passe en mode desktop
      if (!mobile) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Gestion de la touche Échap pour fermer le sidebar sur mobile
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobile && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobile, isSidebarOpen])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Overlay pour mobile quand le sidebar est ouvert */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Contenu principal avec ajustement de la marge sur desktop */}
        <main
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${!isMobile ? 'ml-0' : ''}
            p-4 sm:p-6 lg:p-8
            overflow-x-auto
            min-h-[calc(100vh-4rem)]
          `}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Message de bienvenue pour les nouveaux utilisateurs (optionnel) */}
      {user && !user.profileCompleted && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-sm">
              Bienvenue ! Complétez votre profil pour commencer.
            </span>
            <button
              onClick={() => navigate('/profil/completion')}
              className="text-xs bg-white text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Compléter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainLayout