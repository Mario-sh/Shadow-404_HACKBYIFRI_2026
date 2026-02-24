// src/pages/etudiant/ExercicesPage.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { exercicesService } from '../../services/exercices'
import { useAuth } from '../../hooks/useAuth'
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ExercicesPage = () => {
  const { user } = useAuth()
  const [exercices, setExercices] = useState([])
  const [filteredExercices, setFilteredExercices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const [selectedDifficulte, setSelectedDifficulte] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')
  const [matieres, setMatieres] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    aFaire: 0,
    reussis: 0,
    enCours: 0
  })

  useEffect(() => {
    fetchExercices()
  }, [])

  const fetchExercices = async () => {
    setLoading(true)
    try {
      const data = await exercicesService.getExercicesAEfaire()
      setExercices(data)
      setFilteredExercices(data)

      // Calculer les stats
      const stats = {
        total: data.length,
        aFaire: data.filter(e => e.statut === 'a_faire').length,
        reussis: data.filter(e => e.statut === 'reussi').length,
        enCours: data.filter(e => e.statut === 'en_cours').length
      }
      setStats(stats)

      // Extraire les matières uniques
      const uniqueMatieres = [...new Set(data.map(e => e.matiere?.nom))].filter(Boolean)
      setMatieres(uniqueMatieres)
    } catch (error) {
      console.error('Erreur chargement exercices:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les exercices
  useEffect(() => {
    let filtered = exercices

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedMatiere) {
      filtered = filtered.filter(e => e.matiere?.nom === selectedMatiere)
    }

    if (selectedDifficulte) {
      filtered = filtered.filter(e => e.difficulte === selectedDifficulte)
    }

    if (selectedStatut) {
      filtered = filtered.filter(e => e.statut === selectedStatut)
    }

    setFilteredExercices(filtered)
  }, [searchTerm, selectedMatiere, selectedDifficulte, selectedStatut, exercices])

  const getDifficulteColor = (difficulte) => {
    switch (difficulte) {
      case 'facile': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'moyen': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'difficile': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'reussi':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'en_cours':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'echec':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <AcademicCapIcon className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mes exercices
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Entraînez-vous et suivez votre progression
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">À faire</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aFaire}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Réussis</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reussis}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En cours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enCours}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un exercice..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            >
              <option value="">Toutes matières</option>
              {matieres.map((matiere, index) => (
                <option key={index} value={matiere}>{matiere}</option>
              ))}
            </select>

            <select
              value={selectedDifficulte}
              onChange={(e) => setSelectedDifficulte(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            >
              <option value="">Toutes difficultés</option>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>

            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            >
              <option value="">Tous statuts</option>
              <option value="a_faire">À faire</option>
              <option value="en_cours">En cours</option>
              <option value="reussi">Réussi</option>
              <option value="echec">Échec</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedMatiere('')
                setSelectedDifficulte('')
                setSelectedStatut('')
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des exercices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercices.length > 0 ? (
          filteredExercices.map((exercice) => (
            <Link
              key={exercice.id}
              to={`/exercices/${exercice.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getDifficulteColor(exercice.difficulte)}`}>
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                {getStatutIcon(exercice.statut)}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {exercice.titre}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {exercice.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-500">
                  {exercice.matiere?.nom}
                </span>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-500">
                    {exercice.duree} min
                  </span>
                </div>
              </div>

              {/* Barre de progression si l'exercice est en cours */}
              {exercice.statut === 'en_cours' && exercice.progression && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progression</span>
                    <span className="text-blue-600 dark:text-blue-400">{exercice.progression}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${exercice.progression}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun exercice trouvé
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExercicesPage