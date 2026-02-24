import React, { useState } from 'react'
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
  LinkIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const ExercicesPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedExercice, setSelectedExercice] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // ============================================
  // 1. RÉCUPÉRER LES EXERCICES
  // ============================================
  const { data: exercicesData, isLoading, refetch } = useQuery({
    queryKey: ['exercices', selectedMatiere, selectedDifficulty, selectedType],
    queryFn: async () => {
      try {
        const params = {}
        if (selectedMatiere !== 'all') params.subject = selectedMatiere
        if (selectedDifficulty !== 'all') params.niveau_difficulte = selectedDifficulty

        const response = await academicService.getExercices(params)
        console.log('📚 Exercices reçus:', response.data)

        // Adapter selon le format de réponse
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération exercices:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. RÉCUPÉRER LES MATIÈRES
  // ============================================
  const { data: matieresData } = useQuery({
    queryKey: ['matieres'],
    queryFn: async () => {
      try {
        const response = await academicService.getMatieres()
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération matières:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 3. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const exercices = Array.isArray(exercicesData) ? exercicesData : []
  const matieres = Array.isArray(matieresData) ? matieresData : []

  // ============================================
  // 4. CONFIGURATION
  // ============================================
  const difficultyConfig = {
    1: { label: 'Facile', color: 'bg-green-100 text-green-700', icon: '🌱', border: 'border-green-200' },
    2: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700', icon: '📚', border: 'border-yellow-200' },
    3: { label: 'Difficile', color: 'bg-red-100 text-red-700', icon: '⚡', border: 'border-red-200' },
  }

  const typeIcons = {
    pdf: { icon: DocumentTextIcon, color: 'text-red-500', bg: 'bg-red-100' },
    video: { icon: VideoCameraIcon, color: 'text-blue-500', bg: 'bg-blue-100' },
    lien: { icon: LinkIcon, color: 'text-green-500', bg: 'bg-green-100' },
    document: { icon: DocumentTextIcon, color: 'text-purple-500', bg: 'bg-purple-100' },
  }

  // ============================================
  // 5. FILTRES
  // ============================================
  const filteredExercices = exercices.filter(ex => {
    if (selectedMatiere !== 'all' && ex.subject_id !== parseInt(selectedMatiere)) return false
    if (selectedDifficulty !== 'all' && ex.niveau_difficulte !== parseInt(selectedDifficulty)) return false
    if (selectedType !== 'all' && ex.Type_ressource !== selectedType) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return ex.titre?.toLowerCase().includes(searchLower) ||
             ex.subject_nom?.toLowerCase().includes(searchLower) ||
             ex.description?.toLowerCase().includes(searchLower)
    }
    return true
  })

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
          <h1 className="text-2xl font-bold text-secondary-900">Bibliothèque d'exercices</h1>
          <p className="text-secondary-600 mt-1">
            {filteredExercices.length} exercice{filteredExercices.length > 1 ? 's' : ''} disponible{filteredExercices.length > 1 ? 's' : ''}
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
          {(user?.role === 'professeur' || user?.role === 'admin') && (
            <button
              onClick={() => window.location.href = '/exercices/creation'}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <SparklesIcon className="h-5 w-5" />
              Créer un exercice
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un exercice par titre ou matière..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Toutes les matières</option>
            {matieres.map(m => (
              <option key={m.id_matiere} value={m.id_matiere}>{m.nom_matière}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous niveaux</option>
            <option value="1">Facile 🌱</option>
            <option value="2">Moyen 📚</option>
            <option value="3">Difficile ⚡</option>
          </select>
        </div>

        {/* Vue toggle et filtres supplémentaires */}
        <div className="mt-4 flex items-center justify-between">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous types</option>
            <option value="pdf">PDF</option>
            <option value="video">Vidéo</option>
            <option value="lien">Lien</option>
            <option value="document">Document</option>
          </select>

          <div className="bg-secondary-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Liste des exercices */}
      {filteredExercices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <BookOpenIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">Aucun exercice trouvé</p>
          <p className="text-sm text-secondary-400 mt-1">
            Essayez de modifier vos filtres ou revenez plus tard
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercices.map((exercice) => {
            const difficulty = difficultyConfig[exercice.niveau_difficulte] || difficultyConfig[1]
            const TypeIcon = typeIcons[exercice.Type_ressource]?.icon || DocumentTextIcon
            const typeColor = typeIcons[exercice.Type_ressource]?.color || 'text-secondary-500'
            const typeBg = typeIcons[exercice.Type_ressource]?.bg || 'bg-secondary-100'

            return (
              <div
                key={exercice.id_exercice}
                className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => {
                  setSelectedExercice(exercice)
                  setShowModal(true)
                }}
              >
                {/* En-tête avec couleur selon difficulté */}
                <div className={`h-32 ${difficulty.color.split(' ')[0]} p-4 relative`}>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                      {difficulty.icon} {difficulty.label}
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-secondary-900 line-clamp-1">
                      {exercice.titre}
                    </h3>
                    <p className="text-sm text-secondary-600 mt-1">{exercice.subject_nom}</p>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${typeBg}`}>
                        <TypeIcon className={`h-4 w-4 ${typeColor}`} />
                      </div>
                      <span className="text-sm text-secondary-600 capitalize">
                        {exercice.Type_ressource || 'Document'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((star) => (
                        star <= exercice.niveau_difficulte ? (
                          <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <StarIcon key={star} className="h-4 w-4 text-secondary-200" />
                        )
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-secondary-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>30 min</span>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                      <PlayIcon className="h-4 w-4" />
                      <span className="text-sm">Commencer</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Titre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Matière</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Difficulté</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredExercices.map((exercice) => {
                const difficulty = difficultyConfig[exercice.niveau_difficulte] || difficultyConfig[1]
                const TypeIcon = typeIcons[exercice.Type_ressource]?.icon || DocumentTextIcon
                const typeColor = typeIcons[exercice.Type_ressource]?.color || 'text-secondary-500'

                return (
                  <tr key={exercice.id_exercice} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-secondary-900">{exercice.titre}</span>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{exercice.subject_nom}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                        {difficulty.icon} {difficulty.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-4 w-4 ${typeColor}`} />
                        <span className="text-sm text-secondary-600 capitalize">
                          {exercice.Type_ressource || 'Document'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedExercice(exercice)
                          setShowModal(true)
                        }}
                        className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de détail */}
      {showModal && selectedExercice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900">{selectedExercice.titre}</h3>
                <p className="text-sm text-secondary-500 mt-1">{selectedExercice.subject_nom}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-secondary-600">Difficulté</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {difficultyConfig[selectedExercice.niveau_difficulte]?.label}
                  </p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-secondary-600">Type</p>
                  <p className="text-lg font-semibold text-secondary-900 capitalize">
                    {selectedExercice.Type_ressource || 'Document'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedExercice.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-900 mb-2">Description</h4>
                  <p className="text-secondary-600 bg-secondary-50 p-4 rounded-xl">
                    {selectedExercice.description}
                  </p>
                </div>
              )}

              {/* Fichier */}
              {selectedExercice.fichier_url && (
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-900 mb-2">Ressource</h4>
                  <a
                    href={selectedExercice.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">Télécharger le fichier</p>
                      <p className="text-sm text-secondary-500">Cliquez pour ouvrir</p>
                    </div>
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-lg hover:bg-secondary-50"
                >
                  Fermer
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Commencer l'exercice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExercicesPage