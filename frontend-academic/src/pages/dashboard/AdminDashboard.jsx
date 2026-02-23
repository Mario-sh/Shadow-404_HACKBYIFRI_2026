import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Utilisateurs', value: 245, icon: UserGroupIcon, color: 'primary' },
    { label: 'Étudiants', value: 189, icon: AcademicCapIcon, color: 'green' },
    { label: 'Professeurs', value: 32, icon: AcademicCapIcon, color: 'blue' },
    { label: 'Classes', value: 12, icon: BuildingOfficeIcon, color: 'yellow' },
    { label: 'Matières', value: 24, icon: BookOpenIcon, color: 'purple' },
    { label: 'Logs', value: 156, icon: Cog6ToothIcon, color: 'orange' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-secondary-900">
        Administration
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-lg border border-secondary-100 text-center">
            <div className={`inline-flex p-2 bg-${stat.color}-100 rounded-xl mb-2`}>
              <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
            </div>
            <p className="text-xl font-bold text-secondary-900">{stat.value}</p>
            <p className="text-xs text-secondary-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Bienvenue dans l'espace administration</h2>
        <p className="text-secondary-600">
          Gérez l'ensemble de la plateforme Academic Twins depuis ce tableau de bord.
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard