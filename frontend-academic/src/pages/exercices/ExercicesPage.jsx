import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

// Données mockées pour les exercices
const mockExercices = [
  {
    id_exercice: 1,
    titre: "Exercices sur les dérivées",
    description: "Série d'exercices sur les dérivées partielles",
    subject_nom: "Mathématiques",
    niveau_difficulte: 2,
    Type_ressource: "pdf"
  },
  {
    id_exercice: 2,
    titre: "Lois de Newton",
    description: "Vidéo explicative sur les lois de Newton",
    subject_nom: "Physique",
    niveau_difficulte: 1,
    Type_ressource: "video"
  },
  {
    id_exercice: 3,
    titre: "Algorithmes de tri",
    description: "Exercices pratiques sur les algorithmes de tri",
    subject_nom: "Informatique",
    niveau_difficulte: 3,
    Type_ressource: "document"
  }
]

// Données mockées pour les matières
const mockMatieres = [
  { id_matiere: 1, nom_matière: "Mathématiques" },
  { id_matiere: 2, nom_matière: "Physique" },
  { id_matiere: 3, nom_matière: "Informatique" },
  { id_matiere: 4, nom_matière: "Chimie" }
]

const ExercicesPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Récupérer les exercices
  const { data: exercicesData, isLoading: exercicesLoading, refetch } = useQuery({
    queryKey: ['exercices', user?.id],
    queryFn: () => academicService.getExercices().catch(() => mockExercices),
    enabled: !!user?.id,
    initialData: mockExercices
  })

  // Récupérer les matières
  const { data: matieresData, isLoading: matieresLoading } = useQuery({
    queryKey: ['matieres'],
    queryFn: () => academicService.getMatieres().catch(() => mockMatieres),
    enabled: !!user?.id,
    initialData: mockMatieres
  })

  // S'assurer que les données sont des tableaux
  const exercices = Array.isArray(exercicesData) ? exercicesData : []
  const matieres = Array.isArray(matieresData) ? matieresData : []

  const isLoading = exercicesLoading || matieresLoading

  const difficultyColors = {
    1: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Facile',
      icon: '🌱'
    },
    2: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'Moyen',
      icon: '📚'
    },
    3: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Difficile',
      icon: '⚡'
    },
  }

  // Fonction pour obtenir l'icône selon le type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <DocumentTextIcon className="h-4 w-4 text-red-600" />
      case 'video':
        return <VideoCameraIcon className="h-4 w-4 text-blue-600" />
      case 'lien':
        return <LinkIcon className="h-4 w-4 text-green-600" />
      default:
        return <DocumentTextIcon className="h-4 w-4 text-secondary-600" />
    }
  }

  // Fonction pour obtenir la couleur de fond selon le type
  const getTypeBgColor = (type) => {
    switch(type) {
      case 'pdf':
        return 'bg-red-100'
      case 'video':
        return 'bg-blue-100'
      case 'lien':
        return 'bg-green-100'
      default:
        return 'bg-secondary-100'
    }
  }

  // Filtrer les exercices
  const filteredExercices = exercices.filter(ex => {
    if (selectedMatiere !== 'all' && ex.subject_nom !== selectedMatiere) return false
    if (selectedDifficulty !== 'all' && ex.niveau_difficulte !== parseInt(selectedDifficulty)) return false
    if (selectedType !== 'all' && ex.Type_ressource !== selectedType) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return ex.titre?.toLowerCase().includes(searchLower) ||
             ex.description?.toLowerCase().includes(searchLower)
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpenIcon className="h-6 w-6 text-primary-600 animate-pulse" />
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
          <h1 className="text-2xl font-bold text-secondary-900">Exercices</h1>
          <p className="text-secondary-600 mt-1">
            Pratiquez avec des exercices adaptés à votre niveau
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Total exercices</p>
          <p className="text-3xl font-bold mt-2">{exercices.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Complétés</p>
          <p className="text-3xl font-bold mt-2">24</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">En cours</p>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Taux réussite</p>
          <p className="text-3xl font-bold mt-2">78%</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Rechercher un exercice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="all">Toutes les matières</option>
            {matieres.map(m => (
              <option key={m.id_matiere} value={m.nom_matière}>{m.nom_matière}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="all">Tous niveaux</option>
            <option value="1">Facile</option>
            <option value="2">Moyen</option>
            <option value="3">Difficile</option>
          </select>
        </div>

        {/* Filtres supplémentaires */}
        <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-secondary-100">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedType('pdf')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedType === 'pdf'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => setSelectedType('video')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedType === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              <VideoCameraIcon className="h-4 w-4" />
              Vidéos
            </button>
            <button
              onClick={() => setSelectedType('lien')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedType === 'lien'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              Liens
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Message si aucun exercice */}
      {filteredExercices.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <BookOpenIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">Aucun exercice trouvé</p>
          <p className="text-sm text-secondary-400 mt-1">
            Essayez de modifier vos filtres
          </p>
        </div>
      )}

      {/* Vue Grid */}
      {viewMode === 'grid' && filteredExercices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercices.map((exercice, index) => (
            <div
              key={exercice.id_exercice || index}
              className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* En-tête */}
              <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-600 relative">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 border-white/30 ${difficultyColors[exercice.niveau_difficulte]?.bg} ${difficultyColors[exercice.niveau_difficulte]?.text}`}>
                    {difficultyColors[exercice.niveau_difficulte]?.icon} {difficultyColors[exercice.niveau_difficulte]?.label}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-secondary-700">
                    {exercice.subject_nom}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {exercice.titre}
                </h3>

                <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                  {exercice.description || "Aucune description disponible"}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeBgColor(exercice.Type_ressource)}`}>
                      {getTypeIcon(exercice.Type_ressource)}
                    </div>
                    <span className="text-sm text-secondary-500">
                      {exercice.Type_ressource || 'document'}
                    </span>
                  </div>

                  <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm">
                    Commencer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && filteredExercices.length > 0 && (
        <div className="space-y-4">
          {filteredExercices.map((exercice, index) => (
            <div
              key={exercice.id_exercice || index}
              className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${difficultyColors[exercice.niveau_difficulte]?.bg}`}>
                  <span className="text-2xl">{difficultyColors[exercice.niveau_difficulte]?.icon}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">{exercice.titre}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-secondary-500">{exercice.subject_nom}</span>
                        <span className="text-secondary-300">•</span>
                        <span className={`text-sm font-medium ${difficultyColors[exercice.niveau_difficulte]?.text}`}>
                          {difficultyColors[exercice.niveau_difficulte]?.label}
                        </span>
                        <span className="text-secondary-300">•</span>
                        <div className={`px-2 py-0.5 rounded-lg ${getTypeBgColor(exercice.Type_ressource)}`}>
                          <span className="text-xs">{exercice.Type_ressource || 'document'}</span>
                        </div>
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                      Commencer
                    </button>
                  </div>

                  <p className="text-secondary-600 text-sm mt-3">
                    {exercice.description || "Aucune description disponible"}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-xs text-secondary-500">30 min estimé</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-xs text-secondary-500">4.5/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AcademicCapIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-xs text-secondary-500">156 complétés</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExercicesPage