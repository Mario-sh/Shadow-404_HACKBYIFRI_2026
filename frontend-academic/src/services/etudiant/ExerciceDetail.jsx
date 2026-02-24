// src/pages/etudiant/ExerciceDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { exercicesService } from '../../services/exercices'
import {
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ExerciceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exercice, setExercice] = useState(null)
  const [reponse, setReponse] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [resultat, setResultat] = useState(null)

  useEffect(() => {
    fetchExercice()
  }, [id])

  const fetchExercice = async () => {
    setLoading(true)
    try {
      const data = await exercicesService.getExerciceById(id)
      setExercice(data)
      // Si l'étudiant a déjà une réponse en cours
      if (data.reponse_utilisateur) {
        setReponse(data.reponse_utilisateur)
      }
    } catch (error) {
      console.error('Erreur chargement exercice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await exercicesService.submitReponse(id, { reponse })
      setResultat(result)
      // Recharger l'exercice pour voir la correction
      await fetchExercice()
    } catch (error) {
      console.error('Erreur soumission:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getDifficulteColor = (difficulte) => {
    switch (difficulte) {
      case 'facile': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'moyen': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'difficile': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!exercice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Exercice non trouvé</p>
        <button
          onClick={() => navigate('/exercices')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Retour aux exercices
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <button
        onClick={() => navigate('/exercices')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Retour aux exercices
      </button>

      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {exercice.titre}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {exercice.matiere?.nom}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficulteColor(exercice.difficulte)}`}>
                {exercice.difficulte}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500">
                <ClockIcon className="h-4 w-4" />
                {exercice.duree} minutes
              </div>
            </div>
          </div>
          {exercice.statut === 'reussi' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-6 w-6" />
              <span className="font-medium">Réussi</span>
            </div>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-300">
          {exercice.description}
        </p>
      </div>

      {/* Contenu de l'exercice */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Énoncé
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          {exercice.contenu}
        </div>
      </div>

      {/* Zone de réponse */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Votre réponse
        </h2>

        {exercice.statut === 'reussi' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Exercice réussi !
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Votre réponse était correcte. Vous pouvez voir la solution ci-dessous.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Écrivez votre réponse ici..."
              required
            />

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting || !reponse.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Envoi...' : 'Soumettre ma réponse'}
              </button>

              <button
                type="button"
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <LightBulbIcon className="h-5 w-5" />
                {showSolution ? 'Cacher la solution' : 'Voir un indice'}
              </button>
            </div>
          </form>
        )}

        {/* Résultat de la soumission */}
        {resultat && (
          <div className={`mt-4 p-4 rounded-lg ${
            resultat.correct 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={resultat.correct ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
              {resultat.message}
            </p>
            {resultat.note && (
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                Note : {resultat.note}/20
              </p>
            )}
          </div>
        )}

        {/* Solution/Indice */}
        {showSolution && exercice.solution && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <LightBulbIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">
                  Indice / Solution
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {exercice.solution}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section commentaires/questions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Questions / Commentaires
          </h2>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Cette fonctionnalité sera bientôt disponible
        </p>
      </div>
    </div>
  )
}

export default ExerciceDetail