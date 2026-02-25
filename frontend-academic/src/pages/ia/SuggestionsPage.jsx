import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { iaService } from '../../services/ia'
import { academicService } from '../../services/academic'
import { exercicesService } from '../../services/exercices' // ← Ajoute cet import
import { useAuth } from '../../hooks/useAuth'
import {
  LightBulbIcon,
  AcademicCapIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  StarIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentArrowDownIcon, // ← Nouvelle icône
  PlayCircleIcon,        // ← Nouvelle icône
  InformationCircleIcon  // ← Nouvelle icône
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const SuggestionsPage = () => {
  const { user } = useAuth()
  const [etudiantId, setEtudiantId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [downloadingId, setDownloadingId] = useState(null) // ← État pour le téléchargement

  // ============================================
  // 1. RÉCUPÉRER L'ÉTUDIANT CONNECTÉ
  // ============================================
  const { data: etudiant, isLoading: etudiantLoading } = useQuery({
    queryKey: ['etudiantByUser', user?.id],
    queryFn: async () => {
      if (user?.role !== 'etudiant') return null
      try {
        const response = await academicService.getEtudiantByUserId(user?.id)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération étudiant:', error)
        return null
      }
    },
    enabled: !!user?.id && user?.role === 'etudiant'
  })

  useEffect(() => {
    if (etudiant?.id_student) {
      setEtudiantId(etudiant.id_student)
    }
  }, [etudiant])

  // ============================================
  // 2. RÉCUPÉRER LES SUGGESTIONS
  // ============================================
  const { data: suggestionsData, isLoading: suggestionsLoading, refetch } = useQuery({
    queryKey: ['suggestions', etudiantId, filter, selectedDifficulty],
    queryFn: async () => {
      if (!etudiantId) return { suggestions: [], analyse: null }
      try {
        const response = await iaService.getSuggestions(etudiantId, 20)
        console.log('💡 Suggestions reçues:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération suggestions:', error)
        return { suggestions: [], analyse: null }
      }
    },
    enabled: !!etudiantId
  })

  // ============================================
  // 3. RÉCUPÉRER L'ANALYSE COMPLÈTE
  // ============================================
  const { data: analyseData } = useQuery({
    queryKey: ['analyse', etudiantId],
    queryFn: async () => {
      if (!etudiantId) return null
      try {
        const response = await iaService.getAnalyseComplete(etudiantId)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération analyse:', error)
        return null
      }
    },
    enabled: !!etudiantId
  })

  // ============================================
  // 4. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const suggestions = suggestionsData?.suggestions || []
  const analyse = analyseData || suggestionsData?.analyse || {}

  // ============================================
  // 5. FILTRES
  // ============================================
  const filteredSuggestions = suggestions.filter(s => {
    if (selectedDifficulty !== 'all' && s.niveau_difficulte !== parseInt(selectedDifficulty)) return false
    if (filter === 'high' && s.priorite < 60) return false
    if (filter === 'medium' && (s.priorite < 30 || s.priorite >= 60)) return false
    if (filter === 'low' && s.priorite >= 30) return false
    return true
  })

  // ============================================
  // 6. FONCTION DE TÉLÉCHARGEMENT
  // ============================================
  const handleDownloadExercice = async (suggestion) => {
    try {
      setDownloadingId(suggestion.id_exercice)

      // Vérifier si l'exercice a un fichier ou un lien
      if (suggestion.Type_ressource === 'lien' && suggestion.contenu) {
        // C'est un lien externe
        window.open(suggestion.contenu, '_blank', 'noopener noreferrer')
        toast.success('🔗 Lien ouvert dans un nouvel onglet')
      }
      else if (suggestion.fichier_url) {
        // C'est un fichier uploadé
        if (suggestion.Type_ressource === 'pdf' || suggestion.Type_ressource === 'document') {
          // Ouvrir le PDF dans un nouvel onglet (ou télécharger selon l'URL)
          window.open(suggestion.fichier_url, '_blank')
          toast.success('📄 Fichier ouvert dans un nouvel onglet')
        } else {
          // Télécharger le fichier
          const link = document.createElement('a')
          link.href = suggestion.fichier_url
          link.setAttribute('download', '') // Force le téléchargement
          document.body.appendChild(link)
          link.click()
          link.remove()
          toast.success('⬇️ Téléchargement démarré')
        }
      }
      else {
        // Pas de fichier, rediriger vers la page de l'exercice
        window.location.href = `/exercices/${suggestion.id_exercice}`
      }

      // Envoyer un feedback implicite (l'étudiant a commencé l'exercice suggéré)
      try {
        await iaService.sendFeedback(suggestion.id_suggestion, true)
        setFeedbackGiven({ ...feedbackGiven, [suggestion.id_suggestion]: true })
      } catch (error) {
        console.error('Erreur feedback implicite:', error)
      }

    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setDownloadingId(null)
    }
  }

  // ============================================
  // 7. CONFIGURATION
  // ============================================
  const difficultyColors = {
    1: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Facile',
      icon: '🌱',
      gradient: 'from-green-500 to-green-600'
    },
    2: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'Moyen',
      icon: '📚',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    3: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Difficile',
      icon: '⚡',
      gradient: 'from-red-500 to-red-600'
    },
  }

  const getPriorityColor = (priority) => {
    if (priority > 80) return { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent', color: 'red' }
    if (priority > 60) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Élevée', color: 'orange' }
    if (priority > 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moyenne', color: 'yellow' }
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Normale', color: 'green' }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <DocumentArrowDownIcon className="h-4 w-4 text-red-500" />
      case 'video':
        return <PlayCircleIcon className="h-4 w-4 text-blue-500" />
      case 'lien':
        return <InformationCircleIcon className="h-4 w-4 text-green-500" />
      default:
        return <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      pdf: 'PDF',
      video: 'Vidéo',
      lien: 'Lien',
      document: 'Document'
    }
    return labels[type] || 'Exercice'
  }

  const handleFeedback = async (suggestionId, estUtile) => {
    try {
      await iaService.sendFeedback(suggestionId, estUtile)
      setFeedbackGiven({ ...feedbackGiven, [suggestionId]: estUtile })
      toast.success('Merci pour votre retour !')
    } catch (error) {
      console.error('Erreur feedback', error)
      toast.error('Erreur lors de l\'envoi du feedback')
    }
  }

  const isLoading = etudiantLoading || suggestionsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LightBulbIcon className="h-8 w-8 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête avec animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <SparklesIcon className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Assistant IA</h1>
              <p className="text-primary-100">Suggestions personnalisées basées sur vos performances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse globale */}
      {analyse && Object.keys(analyse).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="h-5 w-5" />
              <span className="text-sm opacity-90">Moyenne générale</span>
            </div>
            <p className="text-3xl font-bold">{analyse.moyenne_generale?.toFixed(1) || 'N/A'}/20</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrophyIcon className="h-5 w-5" />
              <span className="text-sm opacity-90">Niveau global</span>
            </div>
            <p className="text-3xl font-bold capitalize">{analyse.niveau_global || 'Débutant'}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FireIcon className="h-5 w-5" />
              <span className="text-sm opacity-90">Progression</span>
            </div>
            <p className="text-3xl font-bold">
              {analyse.progression === 'en_progres' && '📈 En progrès'}
              {analyse.progression === 'en_baisse' && '📉 En baisse'}
              {analyse.progression === 'stable' && '⚖️ Stable'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <LightBulbIcon className="h-5 w-5" />
              <span className="text-sm opacity-90">Suggestions</span>
            </div>
            <p className="text-3xl font-bold">{suggestions.length}</p>
          </div>
        </div>
      )}

      {/* Matières à risque */}
      {analyse?.matieres_risque?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-red-500" />
            Matières à travailler en priorité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyse.matieres_risque.map((matiere, index) => {
              const priorityColor = getPriorityColor(matiere.priorite || 50)
              return (
                <div key={index} className={`p-4 ${priorityColor.bg} rounded-xl border ${priorityColor.color === 'red' ? 'border-red-200' : 'border-orange-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-secondary-900">{matiere.nom}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor.bg} ${priorityColor.text}`}>
                      {priorityColor.label}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600">Moyenne: {matiere.moyenne?.toFixed(1)}/20</p>
                  <div className="mt-2 w-full h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-${priorityColor.color}-500`}
                      style={{ width: `${matiere.priorite || 50}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-secondary-700 mb-2">Filtrer par priorité</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="all">Toutes les priorités</option>
              <option value="high">Priorité haute</option>
              <option value="medium">Priorité moyenne</option>
              <option value="low">Priorité normale</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-secondary-700 mb-2">Niveau de difficulté</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="all">Tous niveaux</option>
              <option value="1">Facile 🌱</option>
              <option value="2">Moyen 📚</option>
              <option value="3">Difficile ⚡</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des suggestions */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Aucune suggestion pour le moment</h3>
          <p className="text-secondary-500">Continuez à travailler, de nouvelles suggestions apparaîtront bientôt !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion, index) => {
            const difficulty = difficultyColors[suggestion.niveau_difficulte] || difficultyColors[1]
            const priority = getPriorityColor(suggestion.priorite || 50)

            return (
              <div
                key={suggestion.id_exercice || index}
                className="bg-white rounded-2xl border border-secondary-200 p-6 hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icône de difficulté */}
                  <div className={`p-4 rounded-xl ${difficulty.bg} ${difficulty.border} border-2`}>
                    <span className="text-3xl">{difficulty.icon}</span>
                  </div>

                  <div className="flex-1">
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-secondary-900">{suggestion.titre}</h3>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="text-sm text-secondary-500">{suggestion.subject_nom}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.bg} ${difficulty.text}`}>
                            {difficulty.icon} {difficulty.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}>
                            Priorité {priority.label}
                          </span>

                          {/* Badge de type */}
                          {suggestion.Type_ressource && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600 flex items-center gap-1">
                              {getTypeIcon(suggestion.Type_ressource)}
                              {getTypeLabel(suggestion.Type_ressource)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score de priorité */}
                      {suggestion.priorite && (
                        <div className="text-right">
                          <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="4"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke={priority.color === 'red' ? '#ef4444' : priority.color === 'orange' ? '#f97316' : '#eab308'}
                                strokeWidth="4"
                                strokeDasharray={`${(suggestion.priorite || 50) * 1.76} 176`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-secondary-900">{suggestion.priorite || 50}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Raison de la suggestion */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                      <p className="text-secondary-700">{suggestion.raison}</p>
                    </div>

                    {/* Note actuelle si disponible */}
                    {suggestion.note_actuelle && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-secondary-500">Note actuelle:</span>
                        <span className={`text-lg font-semibold ${
                          suggestion.note_actuelle >= 16 ? 'text-green-600' :
                          suggestion.note_actuelle >= 12 ? 'text-blue-600' :
                          suggestion.note_actuelle >= 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {suggestion.note_actuelle.toFixed(1)}/20
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownloadExercice(suggestion)}
                        disabled={downloadingId === suggestion.id_exercice}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === suggestion.id_exercice ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Téléchargement...
                          </>
                        ) : (
                          <>
                            {suggestion.Type_ressource === 'lien' ? (
                              <>
                                <InformationCircleIcon className="h-5 w-5" />
                                Voir le lien
                              </>
                            ) : suggestion.fichier_url ? (
                              <>
                                <DocumentArrowDownIcon className="h-5 w-5" />
                                Télécharger
                              </>
                            ) : (
                              <>
                                <AcademicCapIcon className="h-5 w-5" />
                                Commencer
                              </>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SuggestionsPage