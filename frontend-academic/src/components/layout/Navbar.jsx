// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { notificationsService } from '../../services/notifications'
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  Bars3Icon // Ajout pour le menu mobile
} from '@heroicons/react/24/outline'
import NotificationsDropdown from '../notifications/NotificationsDropdown'

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return savedTheme ? savedTheme === 'dark' : prefersDark
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const notificationsRef = useRef(null)
  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)
  const mobileSearchInputRef = useRef(null)

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowSearch(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Gestion du thème
  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Chargement des notifications non lues
  const fetchUnreadCount = useCallback(async () => {
    if (user) {
      try {
        const response = await notificationsService.getNonLues()
        setUnreadCount(response.data.length)
      } catch (error) {
        console.error('Erreur chargement notifications:', error)
      }
    }
  }, [user])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Raccourci clavier pour la recherche (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isMobile) {
          setShowSearch(true)
          setTimeout(() => mobileSearchInputRef.current?.focus(), 100)
        } else {
          searchInputRef.current?.focus()
        }
      }
      // Échap pour fermer la recherche mobile
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, isMobile])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  const getInitials = () => {
    if (!user?.username) return 'U'
    return user.username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-center h-16">
          {/* Logo et menu burger pour mobile */}
          <div className="flex items-center gap-2 flex-1">
            {/* Bouton menu burger pour mobile */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
              aria-label="Accueil Academic Twins"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white hidden xs:block">
                Academic Twins
              </span>
            </Link>

            {/* Barre de recherche desktop - centrée */}
            <div className="hidden md:flex flex-1 max-w-xl md:ml-[600px] lg:max-w-2xl mx-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Rechercher des cours, exercices, étudiants..."
                    className="w-full pl-10 pr-20 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Rechercher"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ⌘K
                  </div>
                </div>
              </form>
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    Rechercher "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions - alignées à droite */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Bouton recherche mobile */}
            <button
              onClick={() => {
                setShowSearch(true)
                setTimeout(() => mobileSearchInputRef.current?.focus(), 100)
              }}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Rechercher"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Bouton thème */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
              aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Chat - caché sur très petit écran */}
            <Link
              to="/chat"
              className="hidden xs:flex p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative"
              aria-label="Messages"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
            </Link>

            {/* Menu utilisateur */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                aria-label="Menu utilisateur"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
                  {getInitials()}
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.username}
                </span>
                <ChevronDownIcon className={`hidden lg:block h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-down">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role === 'etudiant' ? 'Étudiant' : user?.role}
                    </p>
                  </div>

                  <Link
                    to="/profil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Mon profil
                  </Link>

                  <Link
                    to="/parametres"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Paramètres
                  </Link>

                  <hr className="my-2 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        {showSearch && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-800 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des cours, exercices, étudiants..."
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all text-gray-900 dark:text-white"
                aria-label="Rechercher"
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Fermer la recherche"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar