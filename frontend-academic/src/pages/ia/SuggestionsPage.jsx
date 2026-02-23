import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { iaService } from '../../services/ia'
import { useAuth } from '../../hooks/useAuth'
import {
  LightBulbIcon,
  AcademicCapIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
  CpuChipIcon,
  BeakerIcon,
  CalculatorIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  TrophyIcon,
  ChartPieIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

// Données mockées améliorées
const mockSuggestions = {
  success: true,
  etudiant_id: 1,
  nb_suggestions: 5,
  suggestions: [
    {
      id_exercice: 1,
      titre: "Exercices sur les dérivées partielles",
      subject_nom: "Mathématiques",
      subject_icon: CalculatorIcon,
      subject_color: "from-blue-500 to-blue-600",
      niveau_difficulte: 1,
      raison: "⚠️ Ta moyenne est de 8.5/20. Commence par des exercices faciles pour consolider les bases.",
      note_actuelle: 8.5,
      priorite: 85,
      temps_estime: "25 min",
      difficulte: "Facile",
      points: 120,
      completions: 345,
      taux_reussite: 92
    },
    {
      id_exercice: 2,
      titre: "Lois de Newton - Applications",
      subject_nom: "Physique",
      subject_icon: BeakerIcon,
      subject_color: "from-purple-500 to-purple-600",
      niveau_difficulte: 2,
      raison: "📚 À travailler : tu as 9.2/20 en Physique. Des exercices progressifs t'aideront.",
      note_actuelle: 9.2,
      priorite: 72,
      temps_estime: "35 min",
      difficulte: "Moyen",
      points: 180,
      completions: 234,
      taux_reussite: 78
    },
    {
      id_exercice: 3,
      titre: "Algorithmes de tri avancés",
      subject_nom: "Informatique",
      subject_icon: CpuChipIcon,
      subject_color: "from-green-500 to-green-600",
      niveau_difficulte: 3,
      raison: "🚀 Challenge : tu excelles en Informatique (16/20). Voici des exercices avancés.",
      note_actuelle: 16.0,
      priorite: 45,
      temps_estime: "45 min",
      difficulte: "Difficile",
      points: 250,
      completions: 89,
      taux_reussite: 65
    },
    {
      id_exercice: 4,
      titre: "Équations différentielles",
      subject_nom: "Mathématiques",
      subject_icon: CalculatorIcon,
      subject_color: "from-blue-500 to-blue-600",
      niveau_difficulte: 2,
      raison: "📊 Pour approfondir : les équations différentielles sont essentielles pour la suite.",
      note_actuelle: 12.5,
      priorite: 60,
      temps_estime: "40 min",
      difficulte: "Moyen",
      points: 200,
      completions: 167,
      taux_reussite: 71
    },
    {
      id_exercice: 5,
      titre: "Mécanique quantique - Introduction",
      subject_nom: "Physique",
      subject_icon: BeakerIcon,
      subject_color: "from-purple-500 to-purple-600",
      niveau_difficulte: 3,
      raison: "🔬 Pour les plus motivés : découvre les bases de la mécanique quantique.",
      note_actuelle: 14.8,
      priorite: 35,
      temps_estime: "50 min",
      difficulte: "Difficile",
      points: 300,
      completions: 56,
      taux_reussite: 58
    }
  ],
  analyse: {
    moyenne_generale: 12.2,
    niveau_global: "Intermédiaire",
    progression: "en_progres",
    points_totaux: 1450,
    rang: 12,
    total_etudiants: 45,
    heures_etude: 24,
    jours_consecutifs: 7,
    objectif_semaine: 75,
    objectif_atteint: 82,
    matieres_risque: [
      { nom: "Mathématiques", moyenne: 8.5, priorite: 85, progression: "+2.5%" },
      { nom: "Physique", moyenne: 9.2, priorite: 72, progression: "+1.8%" }
    ],
    matieres_fortes: [
      { nom: "Informatique", moyenne: 16.0, progression: "+5.2%" },
      { nom: "Anglais", moyenne: 14.5, progression: "+3.1%" }
    ],
    recommandations: [
      "Concentre-toi sur les dérivées cette semaine",
      "Révise les lois de Newton avant l'examen",
      "Pratique les algorithmes de tri"
    ],
    prochains_objectifs: [
      { nom: "Atteindre 12/20 en Maths", progress: 75 },
      { nom: "30 exercices cette semaine", progress: 60 },
      { nom: "Moyenne générale > 14", progress: 45 }
    ]
  }
}

const SuggestionsPage = () => {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [showFeedback, setShowFeedback] = useState({})
  const [animateCards, setAnimateCards] = useState(true)

  const { data: suggestionsData, isLoading, refetch } = useQuery({
    queryKey: ['suggestions', user?.id, filter, selectedDifficulty],
    queryFn: () => iaService.getSuggestions(user?.id, 20).catch(() => mockSuggestions),
    enabled: !!user?.id,
    initialData: mockSuggestions
  })

  const difficultyColors = {
    1: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      badge: 'bg-green-500',
      label: 'Facile',
      icon: '🌱',
      gradient: 'from-green-400 to-green-600'
    },
    2: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'bg-yellow-500',
      label: 'Moyen',
      icon: '📚',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    3: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'bg-red-500',
      label: 'Difficile',
      icon: '⚡',
      gradient: 'from-red-400 to-red-600'
    },
  }

  const getPriorityColor = (priority) => {
    if (priority > 80) return 'from-red-500 to-red-600'
    if (priority > 60) return 'from-orange-500 to-orange-600'
    if (priority > 40) return 'from-yellow-500 to-yellow-600'
    return 'from-green-500 to-green-600'
  }

  const getPriorityLabel = (priority) => {
    if (priority > 80) return 'Urgent'
    if (priority > 60) return 'Élevée'
    if (priority > 40) return 'Moyenne'
    return 'Normale'
  }

  const getNoteColor = (note) => {
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleFeedback = (suggestionId, isUseful) => {
    setShowFeedback({ ...showFeedback, [suggestionId]: isUseful })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LightBulbIcon className="h-8 w-8 text-primary-600 animate-pulse" />
          </div>
          <p className="text-center text-secondary-500 mt-4">Analyse en cours...</p>
        </div>
      </div>
    )
  }

  const filteredSuggestions = suggestionsData?.suggestions?.filter(s => {
    if (selectedDifficulty !== 'all' && s.niveau_difficulte !== parseInt(selectedDifficulty)) return false
    if (selectedMatiere !== 'all' && s.subject_nom !== selectedMatiere) return false
    return true
  }) || []

  const matieresUniques = [...new Set(suggestionsData?.suggestions?.map(s => s.subject_nom))] || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête avec animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <LightBulbIcon className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold">Assistant IA</h1>
            </div>
            <p className="text-xl text-primary-100 max-w-2xl">
              Des recommandations personnalisées basées sur tes performances pour maximiser ta progression
            </p>
          </div>
          <button
            onClick={() => {
              refetch()
              setAnimateCards(!animateCards)
            }}
            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm"
          >
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
          </button>
        </div>
      </div>

      {/* Analyse complète en cartes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <PresentationChartLineIcon className="h-6 w-6" />
            </div>
            <p className="text-sm opacity-90">Moyenne générale</p>
          </div>
          <p className="text-4xl font-bold">{suggestionsData.analyse.moyenne_generale}/20</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            <span>Dernière mise à jour</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <p className="text-sm opacity-90">Niveau global</p>
          </div>
          <p className="text-4xl font-bold">{suggestionsData.analyse.niveau_global}</p>
          <div className="mt-2 flex items-center gap-1">
            <StarIconSolid className="h-4 w-4 text-yellow-300" />
            <span className="text-sm">Progression active</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FireIcon className="h-6 w-6" />
            </div>
            <p className="text-sm opacity-90">Progression</p>
          </div>
          <p className="text-4xl font-bold">
            {suggestionsData.analyse.progression === 'en_progres' && '📈 En progrès'}
            {suggestionsData.analyse.progression === 'en_baisse' && '📉 En baisse'}
            {suggestionsData.analyse.progression === 'stable' && '⚖️ Stable'}
          </p>
          <div className="mt-2">
            <span className="text-sm">{suggestionsData.analyse.progression}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrophyIcon className="h-6 w-6" />
            </div>
            <p className="text-sm opacity-90">Points</p>
          </div>
          <p className="text-4xl font-bold">{suggestionsData.analyse.points_totaux}</p>
          <div className="mt-2">
            <span className="text-sm">Rang {suggestionsData.analyse.rang}/{suggestionsData.analyse.total_etudiants}</span>
          </div>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-secondary-100">
          <p className="text-sm text-secondary-600">Heures d'étude</p>
          <p className="text-2xl font-bold text-secondary-900">{suggestionsData.analyse.heures_etude}h</p>
          <p className="text-xs text-green-600 mt-1">+12% vs semaine dernière</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-secondary-100">
          <p className="text-sm text-secondary-600">Jours consécutifs</p>
          <p className="text-2xl font-bold text-secondary-900">{suggestionsData.analyse.jours_consecutifs}</p>
          <p className="text-xs text-primary-600 mt-1">🔥 Série en cours</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-secondary-100">
          <p className="text-sm text-secondary-600">Objectif semaine</p>
          <p className="text-2xl font-bold text-secondary-900">{suggestionsData.analyse.objectif_atteint}%</p>
          <div className="w-full h-1.5 bg-secondary-200 rounded-full mt-2">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${suggestionsData.analyse.objectif_atteint}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-secondary-100">
          <p className="text-sm text-secondary-600">Exercices</p>
          <p className="text-2xl font-bold text-secondary-900">24/30</p>
          <p className="text-xs text-secondary-500 mt-1">Cette semaine</p>
        </div>
      </div>

      {/* Matières à risque et points forts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matières à risque */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <FireIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-red-800">Matières à prioriser</h2>
          </div>
          <div className="space-y-4">
            {suggestionsData.analyse.matieres_risque.map((matiere, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-secondary-900">{matiere.nom}</span>
                  <span className={`font-bold ${getNoteColor(matiere.moyenne)}`}>{matiere.moyenne}/20</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${matiere.priorite}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-red-600">Priorité {matiere.priorite}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Progression {matiere.progression}</span>
                  <button className="text-primary-600 hover:text-primary-700">
                    Voir les exercices →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Points forts */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrophyIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-lg font-semibold text-green-800">Points forts</h2>
          </div>
          <div className="space-y-4">
            {suggestionsData.analyse.matieres_fortes.map((matiere, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-secondary-900">{matiere.nom}</span>
                  <span className="font-bold text-green-600">{matiere.moyenne}/20</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(matiere.moyenne/20)*100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-600">{matiere.progression}</span>
                </div>
                <div className="mt-2 text-sm text-secondary-600">
                  Continue comme ça ! 🚀
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Objectifs personnalisés */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Objectifs personnalisés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestionsData.analyse.prochains_objectifs.map((objectif, index) => (
            <div key={index} className="bg-secondary-50 rounded-xl p-4">
              <p className="font-medium text-secondary-900 mb-2">{objectif.nom}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${objectif.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary-600">{objectif.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres améliorés */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Filtrer par difficulté
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff.toString() ? 'all' : diff.toString())}
                  className={`flex-1 py-2 px-4 rounded-xl transition-all ${
                    selectedDifficulty === diff.toString()
                      ? difficultyColors[diff].bg + ' ' + difficultyColors[diff].text + ' border-2 border-' + difficultyColors[diff].border
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  {difficultyColors[diff].icon} {difficultyColors[diff].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Matière
            </label>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            >
              <option value="all">Toutes les matières</option>
              {matieresUniques.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Trier par
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            >
              <option value="all">Tous</option>
              <option value="priority">Priorité</option>
              <option value="difficulty">Difficulté</option>
              <option value="recent">Plus récents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des suggestions améliorée */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-secondary-900">Exercices recommandés</h2>

        {filteredSuggestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
            <LightBulbIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucune suggestion pour le moment</p>
            <p className="text-sm text-secondary-400 mt-1">
              Reviens plus tard ou ajoute des notes pour obtenir des recommandations
            </p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion, index) => {
            const IconComponent = suggestion.subject_icon || AcademicCapIcon
            return (
              <div
                key={suggestion.id_exercice || index}
                className={`bg-white rounded-2xl border border-secondary-200 overflow-hidden hover:shadow-xl transition-all duration-500 animate-slide-up ${animateCards ? 'opacity-100' : ''}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Barre de progression visuelle */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${getPriorityColor(suggestion.priorite)}`}></div>

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icône de matière améliorée */}
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${suggestion.subject_color} shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-secondary-900">{suggestion.titre}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-secondary-500">{suggestion.subject_nom}</span>
                            <span className="text-secondary-300">•</span>
                            <span className={`text-sm font-medium ${difficultyColors[suggestion.niveau_difficulte].text}`}>
                              {difficultyColors[suggestion.niveau_difficulte].icon} {difficultyColors[suggestion.niveau_difficulte].label}
                            </span>
                          </div>
                        </div>

                        {/* Badge de priorité amélioré */}
                        <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getPriorityColor(suggestion.priorite)} text-white`}>
                          <span className="font-semibold">Priorité {getPriorityLabel(suggestion.priorite)}</span>
                        </div>
                      </div>

                      {/* Raison avec plus de style */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl">
                        <p className="text-secondary-700">{suggestion.raison}</p>
                      </div>

                      {/* Stats détaillées */}
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-3 bg-secondary-50 rounded-xl">
                          <ClockIcon className="h-5 w-5 text-secondary-400 mx-auto mb-1" />
                          <p className="text-xs text-secondary-500">Temps</p>
                          <p className="text-sm font-semibold text-secondary-900">{suggestion.temps_estime}</p>
                        </div>
                        <div className="text-center p-3 bg-secondary-50 rounded-xl">
                          <TrophyIcon className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-secondary-500">Points</p>
                          <p className="text-sm font-semibold text-secondary-900">{suggestion.points}</p>
                        </div>
                        <div className="text-center p-3 bg-secondary-50 rounded-xl">
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mx-auto mb-1" />
                          <p className="text-xs text-secondary-500">Réussite</p>
                          <p className="text-sm font-semibold text-green-600">{suggestion.taux_reussite}%</p>
                        </div>
                        <div className="text-center p-3 bg-secondary-50 rounded-xl">
                          <BookOpenIcon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                          <p className="text-xs text-secondary-500">Complétions</p>
                          <p className="text-sm font-semibold text-secondary-900">{suggestion.completions}</p>
                        </div>
                      </div>

                      {/* Note actuelle et progression */}
                      {suggestion.note_actuelle && (
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-500">Note actuelle:</span>
                            <span className={`text-lg font-bold ${getNoteColor(suggestion.note_actuelle)}`}>
                              {suggestion.note_actuelle}/20
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${(suggestion.note_actuelle/20)*100}%` }}
                                />
                              </div>
                              <span className="text-sm text-secondary-500">
                                {Math.round((suggestion.note_actuelle/20)*100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Boutons d'action améliorés */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-100">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleFeedback(suggestion.id_exercice, star >= 4)}
                              className="focus:outline-none"
                            >
                              {star <= (showFeedback[suggestion.id_exercice] ? 4 : 3) ? (
                                <StarIconSolid className="h-5 w-5 text-yellow-400 hover:scale-110 transition-transform" />
                              ) : (
                                <StarIcon className="h-5 w-5 text-secondary-300 hover:text-yellow-400 hover:scale-110 transition-all" />
                              )}
                            </button>
                          ))}
                          <span className="text-sm text-secondary-500 ml-2">
                            {showFeedback[suggestion.id_exercice] ? 'Merci !' : 'Note cette suggestion'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-md">
                            Commencer
                          </button>
                          <button className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-all">
                            Plus tard
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Section recommandations */}
      <div className="bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <RocketLaunchIcon className="h-6 w-6 text-yellow-400" />
          <h2 className="text-lg font-semibold">Recommandations personnalisées</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestionsData.analyse.recommandations.map((rec, index) => (
            <div key={index} className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuggestionsPage