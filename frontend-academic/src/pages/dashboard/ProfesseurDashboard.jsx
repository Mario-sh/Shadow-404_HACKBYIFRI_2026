import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')

  // Récupérer les données
  const { data: utilisateurs, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => academicService.getEtudiants(), // À adapter pour tous les utilisateurs
    enabled: !!user?.id
  })

  const { data: classes } = useQuery({
    queryKey: ['allClasses'],
    queryFn: () => academicService.getClasses(),
    enabled: !!user?.id
  })

  const { data: matieres } = useQuery({
    queryKey: ['allMatieres'],
    queryFn: () => academicService.getMatieres(),
    enabled: !!user?.id
  })

  // Statistiques globales
  const globalStats = [
    { label: 'Utilisateurs', value: 245, icon: UserGroupIcon, color: 'primary' },
    { label: 'Étudiants', value: 189, icon: UserIcon, color: 'green' },
    { label: 'Professeurs', value: 32, icon: AcademicCapIcon, color: 'blue' },
    { label: 'Admins', value: 4, icon: ShieldCheckIcon, color: 'purple' },
    { label: 'Classes', value: 12, icon: BuildingOfficeIcon, color: 'yellow' },
    { label: 'Matières', value: 24, icon: BookOpenIcon, color: 'orange' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Cog6ToothIcon className="h-6 w-6 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Administration
          </h1>
          <p className="text-secondary-600 mt-1">
            Gérez l'ensemble de la plateforme Academic Twins
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
          <PlusCircleIcon className="h-5 w-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {globalStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-lg border border-secondary-100 text-center">
            <div className={`inline-flex p-2 bg-${stat.color}-100 rounded-xl mb-2`}>
              <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
            </div>
            <p className="text-xl font-bold text-secondary-900">{stat.value}</p>
            <p className="text-xs text-secondary-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'users' 
              ? 'bg-primary-600 text-white' 
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <UserGroupIcon className="h-5 w-5" />
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'classes' 
              ? 'bg-primary-600 text-white' 
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <BuildingOfficeIcon className="h-5 w-5" />
          Classes
        </button>
        <button
          onClick={() => setActiveTab('matieres')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'matieres' 
              ? 'bg-primary-600 text-white' 
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <BookOpenIcon className="h-5 w-5" />
          Matières
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'logs' 
              ? 'bg-primary-600 text-white' 
              : 'text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          <DocumentTextIcon className="h-5 w-5" />
          Logs
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          {activeTab === 'users' && (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            >
              <option value="all">Tous les rôles</option>
              <option value="etudiant">Étudiants</option>
              <option value="professeur">Professeurs</option>
              <option value="admin">Administrateurs</option>
            </select>
          )}
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Dernière connexion</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">JD</span>
                      </div>
                      <span className="font-medium text-secondary-900">Jean Dupont</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Étudiant
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">jean.dupont@email.com</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      Actif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">2026-02-22 14:30</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-secondary-200 rounded-lg">
                        <PencilSquareIcon className="h-4 w-4 text-secondary-600" />
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded-lg">
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes?.map((classe) => (
            <div key={classe.id_classe} className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">{classe.nom_class}</h3>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {classe.niveau}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-secondary-600">Effectif: 24 étudiants</p>
                <p className="text-sm text-secondary-600">Moyenne: 13.2/20</p>
                <p className="text-sm text-secondary-600">Professeur principal: M. Martin</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  Gérer
                </button>
                <button className="px-3 py-2 border border-secondary-200 text-secondary-600 rounded-lg hover:bg-secondary-50">
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'matieres' && (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Matière</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Coefficient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Professeur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {matieres?.map((matiere) => (
                <tr key={matiere.id_matiere} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 font-medium text-secondary-900">{matiere.nom_matière}</td>
                  <td className="px-6 py-4 text-secondary-600">Coefficient {matiere.coefficient}</td>
                  <td className="px-6 py-4 text-secondary-600">M. Bernard</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-secondary-200 rounded-lg">
                        <PencilSquareIcon className="h-4 w-4 text-secondary-600" />
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded-lg">
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-secondary-900">
                    Connexion administrateur - IP: 192.168.1.45
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">2026-02-22 14:30:25</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard