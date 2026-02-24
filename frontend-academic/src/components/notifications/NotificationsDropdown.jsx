import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '../../services/notifications'
import { useAuth } from '../../hooks/useAuth'
import {
  BellIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const NotificationsDropdown = ({ onClose }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  // ============================================
  // 1. RÉCUPÉRER LES NOTIFICATIONS
  // ============================================
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      try {
        const response = await notificationsService.getNonLues()
        return response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération notifications:', error)
        return []
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  })

  useEffect(() => {
    if (data) {
      setNotifications(data.slice(0, 5)) // Seulement les 5 plus récentes
    }
  }, [data])

  // ============================================
  // 2. FONCTIONS UTILITAIRES
  // ============================================
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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.marquerLu(id)
      refetch()
    } catch (error) {
      console.error('Erreur marquage notification:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-secondary-200 py-4 z-50">
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-secondary-200 overflow-hidden z-50 animate-slide-down">
      {/* En-tête */}
      <div className="p-4 border-b border-secondary-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100">
        <h3 className="font-semibold text-secondary-900">Notifications</h3>
        <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Liste des notifications */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <BellIcon className="h-8 w-8 text-secondary-300 mx-auto mb-2" />
            <p className="text-sm text-secondary-500">Aucune nouvelle notification</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const { icon: Icon, color, bg } = getNotificationIcon(notification.type)

            return (
              <div
                key={notification.id_notification || notification.id}
                className="p-4 border-b border-secondary-100 hover:bg-secondary-50 transition-colors cursor-pointer relative group"
                onClick={() => handleMarkAsRead(notification.id_notification || notification.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Icône */}
                  <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                      {notification.titre}
                    </p>
                    <p className="text-xs text-secondary-600 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">
                      {notification.date_creation
                        ? format(new Date(notification.date_creation), 'HH:mm', { locale: fr })
                        : ''}
                    </p>
                  </div>

                  {/* Indicateur non lu */}
                  {!notification.est_lu && (
                    <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pied de page */}
      <div className="p-3 border-t border-secondary-200 bg-secondary-50">
        <Link
          to="/notifications"
          className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          onClick={onClose}
        >
          Voir toutes les notifications
        </Link>
      </div>
    </div>
  )
}

export default NotificationsDropdown