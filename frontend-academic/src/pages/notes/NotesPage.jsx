import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

// Données mockées pour les notes
const mockNotes = [
  {
    id_note: 1,
    matiere_nom: "Mathématiques",
    type_evaluation: "examen",
    valeur_note: 16.5,
    date_note: "2026-02-15",
    valide: true
  },
  {
    id_note: 2,
    matiere_nom: "Physique",
    type_evaluation: "devoir",
    valeur_note: 8.5,
    date_note: "2026-02-10",
    valide: false
  },
  {
    id_note: 3,
    matiere_nom: "Informatique",
    type_evaluation: "tp",
    valeur_note: 18.0,
    date_note: "2026-02-05",
    valide: true
  },
  {
    id_note: 4,
    matiere_nom: "Anglais",
    type_evaluation: "examen",
    valeur_note: 14.5,
    date_note: "2026-02-01",
    valide: true
  }
]

// Données mockées pour les statistiques
const mockStats = {
  moyenne_generale: 14.5,
  total_notes: 12,
  matiere_forte: "Mathématiques",
  matiere_faible: "Physique",
  moyennes_par_matiere: {
    "Mathématiques": 16.5,
    "Physique": 8.5,
    "Informatique": 18.0,
    "Anglais": 14.5
  }
}

const NotesPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')

  // Récupérer les notes avec fallback sur données mockées
  const { data: notes, isLoading: notesLoading, refetch } = useQuery({
    queryKey: ['studentNotes', user?.id],
    queryFn: () => academicService.getNotes(user?.id).catch(() => mockNotes),
    enabled: !!user?.id,
    initialData: mockNotes
  })

  // Récupérer les statistiques avec fallback sur données mockées
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', user?.id],
    queryFn: () => academicService.getStatistiques(user?.id).catch(() => mockStats),
    enabled: !!user?.id,
    initialData: mockStats
  })

  const isLoading = notesLoading || statsLoading

  const getNoteColor = (note) => {
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getNoteBgColor = (note) => {
    if (note >= 16) return 'bg-green-100'
    if (note >= 12) return 'bg-blue-100'
    if (note >= 10) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'examen': return '📝'
      case 'devoir': return '📚'
      case 'tp': return '💻'
      default: return '📋'
    }
  }

  // S'assurer que notes est un tableau
  const notesList = Array.isArray(notes) ? notes : []

  // Filtrer et trier les notes
  const filteredNotes = notesList.filter(note => {
    if (selectedPeriod !== 'all') {
      const date = new Date(note.date_note)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (selectedPeriod === 'month' && diffDays > 30) return false
      if (selectedPeriod === 'trimester' && diffDays > 90) return false
    }

    if (selectedType !== 'all' && note.type_evaluation !== selectedType) return false

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return note.matiere_nom.toLowerCase().includes(searchLower) ||
             note.type_evaluation.toLowerCase().includes(searchLower)
    }

    return true
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date_desc':
        return new Date(b.date_note) - new Date(a.date_note)
      case 'date_asc':
        return new Date(a.date_note) - new Date(b.date_note)
      case 'note_desc':
        return b.valeur_note - a.valeur_note
      case 'note_asc':
        return a.valeur_note - b.valeur_note
      case 'matiere':
        return a.matiere_nom.localeCompare(b.matiere_nom)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AcademicCapIcon className="h-6 w-6 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Moyenne générale',
      value: stats?.moyenne_generale ? `${stats.moyenne_generale}/20` : 'N/A',
      icon: ChartBarIcon,
      color: 'primary'
    },
    {
      title: 'Total notes',
      value: filteredNotes.length,
      icon: AcademicCapIcon,
      color: 'blue'
    },
    {
      title: 'Meilleure note',
      value: Math.max(...(filteredNotes.map(n => n.valeur_note) || [0])),
      icon: ChartBarIcon,
      color: 'green'
    },
    {
      title: 'Notes validées',
      value: filteredNotes.filter(n => n.valide).length,
      icon: CheckCircleIcon,
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Mes Notes</h1>
          <p className="text-secondary-600 mt-1">
            Consultez et analysez vos performances académiques
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-secondary-600">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="all">Toutes les périodes</option>
            <option value="month">Ce mois</option>
            <option value="trimester">Ce trimestre</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="all">Tous les types</option>
            <option value="examen">Examens</option>
            <option value="devoir">Devoirs</option>
            <option value="tp">TP</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="note_desc">Notes + élevées</option>
            <option value="note_asc">Notes - élevées</option>
            <option value="matiere">Matière (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Tableau des notes */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Matière</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Note</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredNotes.map((note, index) => (
                <tr key={note.id_note} className="hover:bg-secondary-50 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-8 rounded-full ${getNoteBgColor(note.valeur_note)}`}></div>
                      <span className="font-medium text-secondary-900">{note.matiere_nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                      {getTypeIcon(note.type_evaluation)} {note.type_evaluation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-semibold ${getNoteColor(note.valeur_note)}`}>
                      {note.valeur_note}/20
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(note.date_note).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    {note.valide ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircleIcon className="h-4 w-4" />
                        Validée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        En attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucune note trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesPage