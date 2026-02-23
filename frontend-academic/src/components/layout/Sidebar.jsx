import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { user } = useAuth()

  // Navigation pour étudiant
  const studentNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { name: 'Mes notes', to: '/notes', icon: AcademicCapIcon },
    { name: 'Exercices', to: '/exercices', icon: BookOpenIcon },
    { name: 'Suggestions IA', to: '/suggestions', icon: LightBulbIcon },
    { name: 'Statistiques', to: '/statistiques', icon: ChartBarIcon },
    { name: 'Mon profil', to: '/profil', icon: UserIcon },
    { name: 'Paramètres', to: '/parametres', icon: Cog6ToothIcon }
  ]

  // Navigation pour professeur
  const professorNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { name: 'Étudiants', to: '/etudiants', icon: UserGroupIcon },
    { name: 'Notes', to: '/notes', icon: ClipboardDocumentListIcon },
    { name: 'Saisie notes', to: '/notes/saisie', icon: AcademicCapIcon },
    { name: 'Exercices', to: '/exercices', icon: BookOpenIcon },
    { name: 'Créer exercice', to: '/exercices/creation', icon: DocumentTextIcon },
    { name: 'Statistiques', to: '/statistiques', icon: ChartBarIcon },
    { name: 'Mon profil', to: '/profil', icon: UserIcon },
  ]

  // Navigation pour admin
  const adminNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { name: 'Utilisateurs', to: '/utilisateurs', icon: UserGroupIcon },
    { name: 'Classes', to: '/classes', icon: BuildingOfficeIcon },
    { name: 'Matières', to: '/matieres', icon: BookOpenIcon },
    { name: 'Notes', to: '/notes', icon: ClipboardDocumentListIcon },
    { name: 'Exercices', to: '/exercices', icon: DocumentTextIcon },
    { name: 'Statistiques', to: '/statistiques', icon: ChartBarIcon },
    { name: 'Logs', to: '/logs', icon: Cog6ToothIcon },
    { name: 'Paramètres', to: '/parametres', icon: Cog6ToothIcon },
    { name: 'Mon profil', to: '/profil', icon: UserIcon },
  ]

  const navigation =
    user?.role === 'admin' ? adminNavigation :
    user?.role === 'professeur' ? professorNavigation :
    studentNavigation

  return (
    <aside className="w-64 bg-white border-r border-secondary-200 min-h-[calc(100vh-4rem)] sticky top-0 overflow-y-auto">
      <div className="p-4">
        {/* Profil utilisateur */}
        <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">{user?.username}</p>
              <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'text-secondary-700 hover:bg-secondary-100'
                }`
              }
            >
              <item.icon className={`h-5 w-5 mr-3 ${user?.role === 'admin' ? 'text-current' : ''}`} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Version info */}
        <div className="mt-8 pt-6 border-t border-secondary-200">
          <p className="text-xs text-secondary-400 text-center">
            Academic Twins v2.0
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar