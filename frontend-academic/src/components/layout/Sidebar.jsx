// src/components/layout/Sidebar.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminService } from '../../services/admin'
import {
  HomeIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  LightBulbIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  UsersIcon,
  FolderIcon,
  ArchiveBoxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  PresentationChartLineIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  LightBulbIcon as LightBulbIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  BellIcon as BellIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ClockIcon as ClockIconSolid,
  UsersIcon as UsersIconSolid,
  FolderIcon as FolderIconSolid,
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  PencilSquareIcon as PencilSquareIconSolid,
  DocumentDuplicateIcon as DocumentDuplicateIconSolid,
  PresentationChartLineIcon as PresentationChartLineIconSolid
} from '@heroicons/react/24/solid'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [pendingCount, setPendingCount] = useState(0)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Détection mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sauvegarde de l'état du collapse (seulement sur desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, isMobile])

  // Chargement du nombre de professeurs en attente
  const fetchPendingCount = useCallback(async () => {
    if (user?.role === 'admin') {
      try {
        const response = await adminService.getProfesseursEnAttente()
        const count = response.data?.length || 0
        setPendingCount(count)
      } catch (error) {
        console.error('Erreur chargement nombre en attente:', error)
      }
    }
  }, [user])

  useEffect(() => {
    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [fetchPendingCount])

  // Raccourci clavier pour collapse (Ctrl+B) - seulement sur desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !isMobile) {
        e.preventDefault()
        setIsCollapsed(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile])

  // Fermeture du sidebar sur mobile quand on clique sur un lien
  const handleLinkClick = () => {
    if (isMobile) {
      onClose()
    }
  }

  // src/components/layout/Sidebar.jsx

// Navigation pour admin
const adminNavigation = useMemo(() => [
  {
    category: 'Principal',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: Squares2X2Icon, iconSolid: Squares2X2IconSolid },
      { name: 'Mon profil', to: '/profil', icon: UserIcon, iconSolid: UserIconSolid },
      { name: 'Paramètres', to: '/parametres', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
      { name: 'Notifications', to: '/notifications', icon: BellIcon, iconSolid: BellIconSolid },
      { name: 'Calendrier', to: '/calendrier', icon: CalendarIcon, iconSolid: CalendarIconSolid },
      { name: 'Chat', to: '/chat', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
    ]
  },
  {
    category: 'Gestion des utilisateurs',
    items: [
      { name: 'Tous les utilisateurs', to: '/utilisateurs', icon: UsersIcon, iconSolid: UsersIconSolid },
      { name: 'Étudiants', to: '/utilisateurs?role=etudiant', icon: AcademicCapIcon, iconSolid: AcademicCapIconSolid },
      { name: 'Professeurs', to: '/utilisateurs?role=professeur', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
      { name: 'Administrateurs', to: '/utilisateurs?role=admin', icon: ShieldCheckIcon, iconSolid: ShieldCheckIconSolid },
    ]
  },
  {
    category: 'Validations',
    items: [
      {
        name: 'Professeurs à valider',
        to: '/admin/validations',
        icon: ClockIcon,
        iconSolid: ClockIconSolid,
        badge: pendingCount
      },
    ]
  },
  {
    category: 'Gestion académique',
    items: [
      { name: 'Classes', to: '/classes', icon: BuildingOfficeIcon, iconSolid: BuildingOfficeIconSolid },
      { name: 'Matières', to: '/matieres', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
      { name: 'Notes', to: '/notes', icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
      { name: 'Exercices', to: '/exercices', icon: FolderIcon, iconSolid: FolderIconSolid },
      { name: 'Ressources', to: '/admin/ressources', icon: ArchiveBoxIcon, iconSolid: ArchiveBoxIconSolid }, // ← MODIFIÉ
    ]
  },
  {
    category: 'Statistiques',
    items: [
      { name: 'Statistiques globales', to: '/statistiques', icon: PresentationChartLineIcon, iconSolid: PresentationChartLineIconSolid },
      { name: 'Suggestions IA', to: '/suggestions', icon: LightBulbIcon, iconSolid: LightBulbIconSolid },
      { name: 'Logs système', to: '/logs', icon: ClockIcon, iconSolid: ClockIconSolid },
    ]
  }
], [pendingCount])

// Navigation pour professeur
const professorNavigation = useMemo(() => [
  {
    category: 'Principal',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: Squares2X2Icon, iconSolid: Squares2X2IconSolid },
      { name: 'Mon profil', to: '/profil', icon: UserIcon, iconSolid: UserIconSolid },
      { name: 'Paramètres', to: '/parametres', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
      { name: 'Notifications', to: '/notifications', icon: BellIcon, iconSolid: BellIconSolid },
      { name: 'Calendrier', to: '/calendrier', icon: CalendarIcon, iconSolid: CalendarIconSolid },
      { name: 'Chat', to: '/chat', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
    ]
  },
  {
    category: 'Gestion',
    items: [
      { name: 'Étudiants', to: '/etudiants', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
      { name: 'Notes', to: '/notes', icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
      { name: 'Saisie des notes', to: '/notes/saisie', icon: PencilSquareIcon, iconSolid: PencilSquareIconSolid },
      { name: 'Exercices', to: '/exercices', icon: FolderIcon, iconSolid: FolderIconSolid },
      { name: 'Ressources', to: '/professeur/ressources', icon: ArchiveBoxIcon, iconSolid: ArchiveBoxIconSolid }, // ← MODIFIÉ
      { name: 'Créer un exercice', to: '/exercices/creation', icon: DocumentDuplicateIcon, iconSolid: DocumentDuplicateIconSolid },
    ]
  },
  {
    category: 'Statistiques',
    items: [
      { name: 'Statistiques', to: '/statistiques', icon: PresentationChartLineIcon, iconSolid: PresentationChartLineIconSolid },
      { name: 'Suggestions IA', to: '/suggestions', icon: LightBulbIcon, iconSolid: LightBulbIconSolid },
    ]
  }
], [])

// Navigation pour étudiant
const studentNavigation = useMemo(() => [
  {
    category: 'Principal',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: Squares2X2Icon, iconSolid: Squares2X2IconSolid },
      { name: 'Mon profil', to: '/profil', icon: UserIcon, iconSolid: UserIconSolid },
      { name: 'Paramètres', to: '/parametres', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
      { name: 'Notifications', to: '/notifications', icon: BellIcon, iconSolid: BellIconSolid },
      { name: 'Calendrier', to: '/calendrier', icon: CalendarIcon, iconSolid: CalendarIconSolid },
      { name: 'Chat', to: '/chat', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
    ]
  },
  {
    category: 'Académique',
    items: [
      { name: 'Mes notes', to: '/notes', icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
      { name: 'Exercices', to: '/exercices', icon: FolderIcon, iconSolid: FolderIconSolid },
      { name: 'Ressources', to: '/etudiant/ressources', icon: ArchiveBoxIcon, iconSolid: ArchiveBoxIconSolid }, // ← MODIFIÉ
      { name: 'Suggestions IA', to: '/suggestions', icon: LightBulbIcon, iconSolid: LightBulbIconSolid },
      { name: 'Statistiques', to: '/statistiques', icon: PresentationChartLineIcon, iconSolid: PresentationChartLineIconSolid },
    ]
  }
], [])

  const navigationSections = useMemo(() => {
    if (user?.role === 'admin') return adminNavigation
    if (user?.role === 'professeur') return professorNavigation
    return studentNavigation
  }, [user, adminNavigation, professorNavigation, studentNavigation])

  // Fonction pour vérifier si un lien est actif
  const isLinkActive = useCallback((path) => {
    if (path.includes('?')) {
      const [basePath, queryString] = path.split('?')
      const params = new URLSearchParams(queryString)
      const currentParams = new URLSearchParams(location.search)

      return location.pathname === basePath &&
        Array.from(params.entries()).every(([key, value]) => currentParams.get(key) === value)
    }
    return false
  }, [location])

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <ShieldCheckIcon className="h-3 w-3 text-purple-500" />
      case 'professeur':
        return <AcademicCapIcon className="h-3 w-3 text-blue-500" />
      case 'etudiant':
        return <UserIcon className="h-3 w-3 text-green-500" />
      default:
        return null
    }
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'from-purple-500 to-indigo-600'
      case 'professeur': return 'from-blue-500 to-indigo-600'
      case 'etudiant': return 'from-green-500 to-teal-600'
      default: return 'from-blue-500 to-indigo-600'
    }
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrateur'
      case 'professeur': return 'Professeur'
      case 'etudiant': return 'Étudiant'
      default: return user?.role
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

  // Classes pour la sidebar - CORRECTION DU Z-INDEX
  const sidebarClasses = `
  fixed md:relative z-40
  h-screen md:h-auto
  bg-white dark:bg-gray-900
  border-r border-gray-200 dark:border-gray-800
  transition-all duration-300 ease-in-out
  overflow-y-auto overflow-x-hidden
  scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
  ${isCollapsed ? 'w-20' : 'w-72'}
  ${isMobile ? (isOpen ? 'left-0' : '-left-72') : 'left-0'}
  ${isMobile ? 'shadow-xl' : ''}
  `

  return (
    <>
      {/* Overlay pour mobile - z-30 pour être sous la navbar */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Bouton de fermeture pour mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all z-50"
            aria-label="Fermer le menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        {/* Bouton de collapse (caché sur mobile) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 shadow-md z-10 transition-all hover:scale-110"
            title={isCollapsed ? 'Développer (Ctrl+B)' : 'Réduire (Ctrl+B)'}
          >
            {isCollapsed ? <ChevronRightIcon className="h-3 w-3" /> : <ChevronLeftIcon className="h-3 w-3" />}
          </button>
        )}

        <div className="h-full py-6">
          {/* Profil utilisateur */}
          <div className={`px-4 mb-8 ${isCollapsed ? 'text-center' : ''}`}>
            <div className={`flex ${isCollapsed ? 'flex-col' : 'items-center gap-4'} p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-gray-700 transition-all hover:shadow-md`}>
              <div className="relative group">
                <div className={`w-12 h-12 bg-gradient-to-br ${getRoleColor()} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <span className="text-white font-bold text-lg">
                    {getInitials()}
                  </span>
                </div>
                {pendingCount > 0 && user?.role === 'admin' && (
                  <span className={`absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800 animate-pulse ${
                    isCollapsed ? 'block' : 'hidden'
                  }`}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1 mt-1">
                    {getRoleIcon()}
                    <span className="truncate">{getRoleLabel()}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-6 px-3">
            {navigationSections.map((section, idx) => (
              <div key={idx}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {section.category}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.to.split('?')[0] || isLinkActive(item.to)

                    return (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        onClick={handleLinkClick}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={({ isActive: navIsActive }) => {
                          const active = navIsActive || isActive
                          return `flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            active
                              ? `bg-gradient-to-r ${getRoleColor()} text-white shadow-lg shadow-blue-200 dark:shadow-indigo-900/30`
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                          } ${isCollapsed ? 'relative group' : ''}`
                        }}
                        title={isCollapsed ? item.name : ''}
                      >
                        <div className="flex items-center">
                          {isActive || hoveredItem === item.name ? (
                            <item.iconSolid className={`h-5 w-5 ${!isCollapsed && 'mr-3'} transition-colors`} />
                          ) : (
                            <item.icon className={`h-5 w-5 ${!isCollapsed && 'mr-3'} transition-colors`} />
                          )}
                          {!isCollapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                        {!isCollapsed && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center animate-pulse">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                        {isCollapsed && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Version info - caché sur mobile quand collapsed */}
          {!isCollapsed && (
            <div className="mt-8 px-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AcademicCapIcon className="h-4 w-4 text-blue-500" />
                  Academic Twins v2.0
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Système opérationnel
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar