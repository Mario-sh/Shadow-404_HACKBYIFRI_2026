import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuth } from '../../hooks/useAuth'
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [period, setPeriod] = useState('week')

  // Récupérer les statistiques du dashboard
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats', period],
    queryFn: async () => {
      try {
        const response = await adminService.getDashboardStats(period)
        console.log('📊 Stats dashboard reçues:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération stats:', error)
        return {
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          pendingTeachers: 0,
          totalClasses: 0,
          totalSubjects: 0,
          todayLogins: 0,
          activeUsers: 0,
          totalNotes: 0,
          averageGrade: 0
        }
      }
    },
    enabled: !!user?.id
  })

  // Récupérer les activités récentes
  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      try {
        const response = await adminService.getRecentActivities()
        console.log('📋 Activités récentes:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération activités:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // Récupérer les professeurs en attente
  const { data: pendingData, refetch: refetchPending } = useQuery({
    queryKey: ['pendingCount'],
    queryFn: async () => {
      try {
        const response = await adminService.getProfesseursEnAttente()
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération professeurs en attente:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  const handleRefresh = () => {
    refetchStats()
    refetchActivities()
    refetchPending()
  }

  const isLoading = statsLoading || activitiesLoading
  const pendingCount = pendingData?.length || 0

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'primary',
      link: '/utilisateurs'
    },
    {
      title: 'Étudiants',
      value: stats?.totalStudents || 0,
      icon: AcademicCapIcon,
      color: 'green',
      link: '/utilisateurs?role=etudiant'
    },
    {
      title: 'Professeurs',
      value: stats?.totalTeachers || 0,
      icon: ShieldCheckIcon,
      color: 'blue',
      link: '/utilisateurs?role=professeur'
    },
    {
      title: 'Classes',
      value: stats?.totalClasses || 0,
      icon: BuildingOfficeIcon,
      color: 'yellow',
      link: '/classes'
    },
    {
      title: 'Matières',
      value: stats?.totalSubjects || 0,
      icon: BookOpenIcon,
      color: 'purple',
      link: '/matieres'
    },
    {
      title: 'Connexions',
      value: stats?.todayLogins || 0,
      icon: ClockIcon,
      color: 'orange',
      link: '/logs'
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-primary-600 font-medium">Chargement...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Administration
          </h1>
          <p className="text-secondary-600 mt-1">
            Bienvenue, {user?.username}. Gérez la plateforme.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Sélecteur de période */}
          <div className="bg-white rounded-xl p-1 shadow-sm border border-secondary-200">
            {['day', 'week', 'month'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  period === p 
                    ? 'bg-primary-600 text-white' 
                    : 'hover:bg-secondary-100 text-secondary-600'
                }`}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          {/* Bouton rafraîchir */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100 hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-secondary-600">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Section Professeurs en attente */}
      {pendingCount > 0 && (
        <Link
          to="/admin/validations"
          className="block bg-yellow-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-200 rounded-xl">
              <ClockIcon className="h-8 w-8 text-yellow-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-yellow-800">
                {pendingCount} professeur{pendingCount > 1 ? 's' : ''} en attente
              </h2>
              <p className="text-yellow-600 mt-1">
                Cliquez pour valider les inscriptions des professeurs
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Graphique et activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique d'activité */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Activité des utilisateurs</h2>
          <div className="h-64 flex items-end gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
              const height = Math.floor(Math.random() * 80) + 20
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary-500 rounded-t-lg hover:bg-primary-600 transition-all"
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-xs text-secondary-500">{days[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {activitiesData?.length > 0 ? (
              activitiesData.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  {activity.type === 'user' && (
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserGroupIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  {activity.type === 'note' && (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DocumentTextIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'error' && (
                    <div className="p-2 bg-red-100 rounded-lg">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                  {activity.type === 'pending' && (
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ClockIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-secondary-900">{activity.message}</p>
                    <p className="text-xs text-secondary-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary-500 text-center py-4">Aucune activité récente</p>
            )}
          </div>
          <Link
            to="/logs"
            className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir tous les logs →
          </Link>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Statistiques rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-90">Notes totales</p>
              <p className="text-3xl font-bold">{stats?.totalNotes || 0}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Moyenne générale</p>
              <p className="text-3xl font-bold">{stats?.averageGrade?.toFixed(1) || 0}/20</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Utilisateurs actifs</p>
              <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Taux de connexion</p>
              <p className="text-3xl font-bold">
                {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/utilisateurs?action=create"
              className="p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 text-center transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <span className="text-xs font-medium text-secondary-700">Nouvel utilisateur</span>
            </Link>
            <Link
              to="/classes?action=create"
              className="p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 text-center transition-colors"
            >
              <BuildingOfficeIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <span className="text-xs font-medium text-secondary-700">Nouvelle classe</span>
            </Link>
            <Link
              to="/matieres?action=create"
              className="p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 text-center transition-colors"
            >
              <BookOpenIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <span className="text-xs font-medium text-secondary-700">Nouvelle matière</span>
            </Link>
            <Link
              to="/admin/validations"
              className="p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 text-center transition-colors"
            >
              <ClockIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <span className="text-xs font-medium text-secondary-700">Validations</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard