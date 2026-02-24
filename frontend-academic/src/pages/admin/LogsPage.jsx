import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuth } from '../../hooks/useAuth'
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const LogsPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Récupérer les logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['systemLogs', selectedType, selectedLevel, selectedDate, currentPage],
    queryFn: async () => {
      try {
        const params = {}
        if (selectedType !== 'all') params.type = selectedType
        if (selectedLevel !== 'all') params.level = selectedLevel
        if (selectedDate) params.date = selectedDate
        if (searchTerm) params.search = searchTerm
        params.page = currentPage
        params.limit = itemsPerPage

        const response = await adminService.getLogs(params)
        console.log('📋 Logs reçus:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération logs:', error)
        return { results: [], total: 0 }
      }
    },
    enabled: !!user?.id
  })

  const getLevelIcon = (level) => {
    switch(level) {
      case 'info': return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      default: return <InformationCircleIcon className="h-5 w-5 text-secondary-500" />
    }
  }

  const getLevelBadge = (level) => {
    switch(level) {
      case 'info': return 'bg-blue-100 text-blue-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'success': return 'bg-green-100 text-green-700'
      default: return 'bg-secondary-100 text-secondary-700'
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'auth': return <ShieldExclamationIcon className="h-5 w-5 text-purple-500" />
      case 'user': return <UserIcon className="h-5 w-5 text-green-500" />
      case 'system': return <ComputerDesktopIcon className="h-5 w-5 text-blue-500" />
      default: return <InformationCircleIcon className="h-5 w-5 text-secondary-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  const logs = logsData?.results || []
  const totalLogs = logsData?.total || logs.length
  const totalPages = Math.ceil(totalLogs / itemsPerPage)

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Logs système</h1>
          <p className="text-secondary-600 mt-1">
            {totalLogs} événement{totalLogs > 1 ? 's' : ''} enregistré{totalLogs > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
          </button>
          <button
            onClick={() => {
              // Fonction d'export à implémenter
              alert('Export en cours de développement')
            }}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200"
            title="Exporter"
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-secondary-600" />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="auth">Authentification</option>
            <option value="user">Utilisateurs</option>
            <option value="system">Système</option>
            <option value="data">Données</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous les niveaux</option>
            <option value="info">Info</option>
            <option value="success">Succès</option>
            <option value="warning">Avertissement</option>
            <option value="error">Erreur</option>
          </select>

          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Horodatage</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Niveau</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Message</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {logs.map((log, index) => (
                <tr key={log.id || index} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-sm text-secondary-600">
                        {log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(log.level)}`}>
                      {getLevelIcon(log.level)}
                      <span className="capitalize">{log.level}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="text-sm text-secondary-600 capitalize">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-secondary-900">{log.message}</p>
                    {log.details && (
                      <p className="text-xs text-secondary-500 mt-1">{log.details}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-secondary-600">{log.user || 'Système'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-secondary-600">{log.ip || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <InformationCircleIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucun log trouvé</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-secondary-100 flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalLogs)} sur {totalLogs} logs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
              >
                Précédent
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'border border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogsPage