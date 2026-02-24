import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { notificationsService } from '../../services/notifications'
import { useAuth } from '../../hooks/useAuth'
import {
  BellIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  // ============================================
  // 1. RÉCUPÉRER LES NOTIFICATIONS
  // ============================================
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter, selectedType],
    queryFn: async () => {
      try {
        let response
        if (filter === 'unread') {
          response = await notificationsService.getNonLues()
        } else {
          response = await notificationsService.getNotifications()
        }

        let data = response.data || []

        // Filtrer par type si nécessaire
        if (selectedType !== 'all') {
          data = data.filter(n => n.type === selectedType)
        }

        return data
      } catch (error) {
        console.error('❌ Erreur récupération notifications:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const notifications = Array.isArray(notificationsData) ? notificationsData : []

  // ============================================
  // 3. MUTATIONS
  // ============================================
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationsService.marquerLu(id),
    onSuccess: () => {
      refetch()
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.marquerToutLu(),
    onSuccess: () => {
      toast.success('Toutes les notifications ont été marquées comme lues')
      refetch()
    }
  })

  // ============================================
  // 4. FILTRES
  // ============================================
  const filteredNotifications = notifications.filter(notification => {
    if (selectedType !== 'all' && notification.type !== selectedType) return false
    if (filter === 'unread' && notification.est_lu) return false
    if (filter === 'read' && !notification.est_lu) return false
    return true
  })

  // ============================================
  // 5. FONCTIONS UTILITAIRES
  // ============================================
  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    if (window.confirm('Marquer toutes les notifications comme lues ?')) {
      markAllAsReadMutation.mutate()
    }
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'suggestion':
        return { icon: SparklesIcon, color: 'text-purple-500', bg: 'bg-purple-100' }
      case 'validation':
        return { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100' }
      case 'alerte':
        return { icon: ExclamationCircleIcon, color: 'text-red-500', bg: 'bg-red-100' }
      case 'rappel':
        return { icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-100' }
      case 'info':
        return { icon: InformationCircleIcon, color: 'text-blue-500', bg: 'bg-blue-100' }
      default:
        return { icon: BellIcon, color: 'text-secondary-500', bg: 'bg-secondary-100' }
    }
  }

  const getNotificationTypeLabel = (type) => {
    const labels = {
      suggestion: 'Suggestion IA',
      validation: 'Validation',
      alerte: 'Alerte',
      rappel: 'Rappel',
      info: 'Information'
    }
    return labels[type] || type
  }

  const unreadCount = notifications.filter(n => !n.est_lu).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
          <p className="text-secondary-600 mt-1">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <CheckIcon className="h-5 w-5" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="all">Toutes les notifications</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="all">Tous les types</option>
              <option value="suggestion">Suggestions IA</option>
              <option value="validation">Validations</option>
              <option value="alerte">Alertes</option>
              <option value="rappel">Rappels</option>
              <option value="info">Informations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Aucune notification</h3>
          <p className="text-secondary-500">
            {filter !== 'all'
              ? 'Aucune notification ne correspond à vos critères'
              : 'Vous n\'avez pas encore de notifications'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const { icon: Icon, color, bg } = getNotificationIcon(notification.type)

            return (
              <div
                key={notification.id_notification || notification.id}
                className={`bg-white rounded-2xl shadow-lg border p-6 transition-all hover:shadow-xl ${
                  notification.est_lu ? 'border-secondary-100' : 'border-primary-200 bg-primary-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {notification.titre}
                        </h3>
                        <p className="text-sm text-secondary-500">
                          {getNotificationTypeLabel(notification.type)}
                        </p>
                      </div>
                      <span className="text-xs text-secondary-400">
                        {notification.date_creation
                          ? format(new Date(notification.date_creation), 'dd MMM yyyy HH:mm', { locale: fr })
                          : 'Date inconnue'}
                      </span>
                    </div>

                    <p className="text-secondary-700 mb-4">{notification.message}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      {!notification.est_lu && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id_notification || notification.id)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <CheckIcon className="h-4 w-4" />
                          Marquer comme lu
                        </button>
                      )}

                      {notification.est_lu && notification.date_lecture && (
                        <span className="text-xs text-secondary-400">
                          Lu le {format(new Date(notification.date_lecture), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Statistiques */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Total</p>
            <p className="text-3xl font-bold">{notifications.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Lues</p>
            <p className="text-3xl font-bold">{notifications.filter(n => n.est_lu).length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Non lues</p>
            <p className="text-3xl font-bold">{unreadCount}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Suggestions</p>
            <p className="text-3xl font-bold">{notifications.filter(n => n.type === 'suggestion').length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage