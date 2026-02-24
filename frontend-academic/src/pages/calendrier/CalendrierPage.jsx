import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { calendarService } from '../../services/calendar'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  AcademicCapIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const CalendrierPage = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month')
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(null)

  // ============================================
  // 1. RÉCUPÉRER LES ÉVÉNEMENTS
  // ============================================
  const { data: eventsData, isLoading, refetch } = useQuery({
    queryKey: ['events', user?.id, currentDate],
    queryFn: async () => {
      try {
        const response = await calendarService.getEvents({
          user_id: user?.id,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        })
        return response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération événements:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. FORMULAIRE
  // ============================================
  const [formData, setFormData] = useState({
    title: '',
    type: 'cours',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    professor: '',
    description: ''
  })

  // ============================================
  // 3. MUTATIONS
  // ============================================
  const createEventMutation = useMutation({
    mutationFn: (data) => calendarService.createEvent(data),
    onSuccess: () => {
      toast.success('Événement créé avec succès')
      setShowEventModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la création')
      console.error(error)
    }
  })

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => calendarService.updateEvent(id, data),
    onSuccess: () => {
      toast.success('Événement modifié avec succès')
      setShowEventModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification')
      console.error(error)
    }
  })

  const deleteEventMutation = useMutation({
    mutationFn: (id) => calendarService.deleteEvent(id),
    onSuccess: () => {
      toast.success('Événement supprimé')
      setShowEventDetails(null)
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    }
  })

  // ============================================
  // 4. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const events = Array.isArray(eventsData) ? eventsData : []

  // ============================================
  // 5. CONFIGURATION
  // ============================================
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const eventTypes = {
    cours: { label: 'Cours', color: 'bg-blue-500', icon: AcademicCapIcon },
    examen: { label: 'Examen', color: 'bg-red-500', icon: CalendarIcon },
    tp: { label: 'TP', color: 'bg-green-500', icon: AcademicCapIcon },
    reunion: { label: 'Réunion', color: 'bg-purple-500', icon: UserGroupIcon },
    devoir: { label: 'Devoir', color: 'bg-yellow-500', icon: ClockIcon }
  }

  // ============================================
  // 6. FONCTIONS UTILITAIRES
  // ============================================
  const getEventsForDay = (day) => {
    return events.filter(event => isSameDay(new Date(event.date), day))
  }

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleEventClick = (event) => {
    setShowEventDetails(event)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'cours',
      date: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      endDate: format(addDays(selectedDate, 1), "yyyy-MM-dd'T'HH:mm"),
      location: '',
      professor: '',
      description: ''
    })
    setEditingEvent(null)
  }

  const handleAddEvent = () => {
    resetForm()
    setShowEventModal(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      type: event.type,
      date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
      location: event.location || '',
      professor: event.professor || '',
      description: event.description || ''
    })
    setShowEventModal(true)
    setShowEventDetails(null)
  }

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      deleteEventMutation.mutate(eventId)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const eventData = {
      ...formData,
      user_id: user?.id,
      date: new Date(formData.date).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    }

    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: eventData })
    } else {
      createEventMutation.mutate(eventData)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Calendrier</h1>
          <p className="text-secondary-600 mt-1">Gérez vos cours, examens et événements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              viewMode === 'month' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              viewMode === 'week' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              viewMode === 'day' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            Jour
          </button>
          <button
            onClick={handleAddEvent}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors ml-4"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        {/* Navigation */}
        <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-secondary-600" />
            </button>
            <h2 className="text-xl font-semibold text-secondary-900">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-secondary-600" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Grille du calendrier */}
        <div>
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 bg-secondary-50 border-b border-secondary-200">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-secondary-600">
                {day}
              </div>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
            {monthDays.map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const isSelected = isSameDay(day, selectedDate)

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`border-b border-r border-secondary-100 p-2 min-h-[100px] cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'bg-secondary-50' : 'hover:bg-secondary-50'
                  } ${isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isToday 
                        ? 'bg-primary-600 text-white w-6 h-6 flex items-center justify-center rounded-full' 
                        : isCurrentMonth ? 'text-secondary-900' : 'text-secondary-400'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Événements du jour */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className={`${event.color || eventTypes[event.type]?.color || 'bg-primary-500'} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 transition-opacity`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-secondary-500 pl-1">
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Détails de l'événement */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">Détails de l'événement</h3>
              <button onClick={() => setShowEventDetails(null)}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <div className="p-6">
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm mb-4 ${showEventDetails.color || eventTypes[showEventDetails.type]?.color || 'bg-primary-500'}`}>
                {eventTypes[showEventDetails.type]?.label || showEventDetails.type}
              </div>

              <h2 className="text-2xl font-bold text-secondary-900 mb-4">{showEventDetails.title}</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-secondary-600">
                  <ClockIcon className="h-5 w-5" />
                  <span>
                    {format(new Date(showEventDetails.date), 'dd MMM yyyy HH:mm', { locale: fr })} -
                    {format(new Date(showEventDetails.endDate), 'HH:mm')}
                  </span>
                </div>

                {showEventDetails.location && (
                  <div className="flex items-center gap-3 text-secondary-600">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{showEventDetails.location}</span>
                  </div>
                )}

                {showEventDetails.professor && (
                  <div className="flex items-center gap-3 text-secondary-600">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>{showEventDetails.professor}</span>
                  </div>
                )}

                {showEventDetails.description && (
                  <div className="mt-4 p-4 bg-secondary-50 rounded-xl">
                    <p className="text-secondary-700">{showEventDetails.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-secondary-200">
                <button
                  onClick={() => handleDeleteEvent(showEventDetails.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Supprimer
                </button>
                <button
                  onClick={() => handleEditEvent(showEventDetails)}
                  className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-lg hover:bg-secondary-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout/modification événement */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">
                {editingEvent ? 'Modifier' : 'Ajouter'} un événement
              </h3>
              <button onClick={() => setShowEventModal(false)}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                >
                  <option value="cours">Cours</option>
                  <option value="examen">Examen</option>
                  <option value="tp">TP</option>
                  <option value="reunion">Réunion</option>
                  <option value="devoir">Devoir</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Début *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Professeur / Responsable
                </label>
                <input
                  type="text"
                  name="professor"
                  value={formData.professor}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createEventMutation.isLoading || updateEventMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {createEventMutation.isLoading || updateEventMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    editingEvent ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendrierPage