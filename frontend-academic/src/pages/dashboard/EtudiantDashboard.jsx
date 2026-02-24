import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { iaService } from '../../services/ia'
import { useAuth } from '../../hooks/useAuth'
import {
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  SparklesIcon,
  CalendarIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import StatCard from '../../components/common/StatCard'
import WelcomeHeader from '../../components/common/WelcomeHeader'
import DailyQuote from '../../components/common/DailyQuote'
import AchievementBadge from '../../components/achievements/AchievementBadge'
import { motion } from 'framer-motion'

const EtudiantDashboard = () => {
  const { user } = useAuth()
  const [etudiantId, setEtudiantId] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('semaine')

  // Récupérer l'étudiant
  const { data: etudiant, isLoading: etudiantLoading } = useQuery({
    queryKey: ['etudiantByUser', user?.id],
    queryFn: async () => {
      try {
        const response = await academicService.getEtudiantByUserId(user?.id)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération étudiant:', error)

        // Mapping de secours
        const mapping = {
          'mathieux.aloha': 1,
          'marie.adjovi': 2,
          'paul.kouadio': 3,
          'emilie.dossou': 4,
          'luc.ahouansou': 5,
          'nadia.sanni': 6,
        }

        const id = mapping[user?.username]
        if (id) {
          return { id_student: id, prenom: user?.username?.split('.')[0], nom: user?.username?.split('.')[1] }
        }
        return null
      }
    },
    enabled: !!user?.id && user?.role === 'etudiant'
  })

  React.useEffect(() => {
    if (etudiant?.id_student) {
      setEtudiantId(etudiant.id_student)
    }
  }, [etudiant])

  // Récupérer les notes
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['studentNotes', etudiantId],
    queryFn: async () => {
      if (!etudiantId) return []
      try {
        const response = await academicService.getNotes(etudiantId)
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération notes:', error)
        return []
      }
    },
    enabled: !!etudiantId
  })

  // Récupérer les statistiques
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', etudiantId],
    queryFn: async () => {
      if (!etudiantId) return null
      try {
        const response = await academicService.getStatistiques(etudiantId)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération statistiques:', error)
        return null
      }
    },
    enabled: !!etudiantId
  })

  // Récupérer les suggestions IA
  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['suggestions', etudiantId],
    queryFn: async () => {
      if (!etudiantId) return []
      try {
        const response = await iaService.getSuggestions(etudiantId, 3)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération suggestions:', error)
        return { suggestions: [] }
      }
    },
    enabled: !!etudiantId
  })

  // Traitement des données
  const notes = Array.isArray(notesData) ? notesData : []
  const suggestions = suggestionsData?.suggestions || []

  // Calcul du niveau
  const calculateLevel = (moyenne) => {
    if (!moyenne) return { level: 'Débutant', color: 'text-secondary-600', progress: 0 }
    if (moyenne < 10) return { level: 'Débutant', color: 'text-yellow-600', progress: (moyenne/20)*100 }
    if (moyenne < 14) return { level: 'Intermédiaire', color: 'text-blue-600', progress: (moyenne/20)*100 }
    if (moyenne < 18) return { level: 'Avancé', color: 'text-green-600', progress: (moyenne/20)*100 }
    return { level: 'Expert', color: 'text-purple-600', progress: (moyenne/20)*100 }
  }

  const level = calculateLevel(stats?.moyenne_generale)

  // Déterminer les badges débloqués
  const earnedBadges = [
    { type: 'streak7', earned: true },
    { type: 'firstNote', earned: notes.length > 0 },
    { type: 'perfectScore', earned: notes.some(n => n.valeur_note === 20) },
    { type: 'expert', earned: (stats?.moyenne_generale || 0) >= 16 },
    { type: 'streak30', earned: false },
    { type: 'helper', earned: false },
  ]

  const isLoading = etudiantLoading || notesLoading || statsLoading || suggestionsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AcademicCapIcon className="h-8 w-8 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête accueillant */}
      <WelcomeHeader />

      {/* Citation du jour */}
      <DailyQuote />

      {/* Objectifs du jour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100"
      >
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FireIcon className="h-5 w-5 text-orange-500" />
          Objectifs du jour
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Terminer 3 exercices', progress: 2, total: 3, color: 'bg-blue-500' },
            { title: 'Lire 2 chapitres', progress: 1, total: 2, color: 'bg-green-500' },
            { title: 'Réviser mathématiques', progress: 45, total: 60, color: 'bg-purple-500', isTime: true },
          ].map((goal, index) => (
            <div key={index} className="p-4 bg-secondary-50 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-secondary-900">{goal.title}</span>
                <span className="text-sm text-secondary-500">
                  {goal.isTime ? `${goal.progress}/${goal.total}min` : `${goal.progress}/${goal.total}`}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${goal.color}`}
                  style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cartes de statistiques avec animations */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            title: 'Moyenne générale',
            value: stats?.moyenne_generale ? `${stats.moyenne_generale.toFixed(1)}/20` : 'N/A',
            icon: AcademicCapIcon,
            color: 'primary',
            trend: stats?.progression === 'en_progres' ? 'up' : stats?.progression === 'en_baisse' ? 'down' : null,
            subtitle: level.level
          },
          {
            title: 'Notes',
            value: notes.length,
            icon: ChartBarIcon,
            color: 'blue',
            subtitle: `${notes.filter(n => n.valide).length} validées`
          },
          {
            title: 'Matière favorite',
            value: stats?.matiere_forte || 'N/A',
            icon: BookOpenIcon,
            color: 'green',
            subtitle: 'Meilleure moyenne'
          },
          {
            title: 'Suggestions IA',
            value: suggestions.length,
            icon: SparklesIcon,
            color: 'purple',
            subtitle: 'Recommandations'
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Section des badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100"
      >
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          Badges et réalisations
        </h2>
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {earnedBadges.map((badge, index) => (
            <AchievementBadge
              key={index}
              type={badge.type}
              earned={badge.earned}
              size="md"
            />
          ))}
        </div>
      </motion.div>

      {/* Performance par matière */}
      {stats?.moyennes_par_matiere && Object.keys(stats.moyennes_par_matiere).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900">Performance par matière</h2>
            <div className="flex gap-2">
              {['semaine', 'mois', 'année'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.moyennes_par_matiere).map(([matiere, moyenne]) => {
              const isBest = moyenne === Math.max(...Object.values(stats.moyennes_par_matiere))
              const isWorst = moyenne === Math.min(...Object.values(stats.moyennes_par_matiere))

              return (
                <motion.div
                  key={matiere}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group hover:bg-secondary-50 p-3 rounded-xl transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-secondary-900">{matiere}</span>
                      {isBest && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                          <TrophyIcon className="h-3 w-3" />
                          Meilleure
                        </span>
                      )}
                      {isWorst && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                          <FireIcon className="h-3 w-3" />
                          À améliorer
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-semibold ${
                      moyenne >= 16 ? 'text-green-600' :
                      moyenne >= 12 ? 'text-blue-600' :
                      moyenne >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {typeof moyenne === 'number' ? moyenne.toFixed(1) : moyenne}/20
                    </span>
                  </div>
                  <div className="w-full h-3 bg-secondary-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(moyenne / 20) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        moyenne >= 16 ? 'bg-green-500' :
                        moyenne >= 12 ? 'bg-blue-500' :
                        moyenne >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Dernières notes et suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières notes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100"
        >
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Dernières notes</h2>
          {notes.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">Aucune note disponible</p>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 3).map((note, index) => (
                <motion.div
                  key={note.id_note}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${
                      note.valeur_note >= 16 ? 'bg-green-500' :
                      note.valeur_note >= 12 ? 'bg-blue-500' :
                      note.valeur_note >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-secondary-900">{note.matiere_nom}</p>
                      <p className="text-xs text-secondary-500">{note.type_evaluation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-semibold ${
                      note.valeur_note >= 16 ? 'text-green-600' :
                      note.valeur_note >= 12 ? 'text-blue-600' :
                      note.valeur_note >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {typeof note.valeur_note === 'number' ? note.valeur_note.toFixed(1) : note.valeur_note}/20
                    </span>
                    <p className="text-xs text-secondary-500 mt-1">
                      {new Date(note.date_note).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Suggestions IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="h-6 w-6 text-yellow-300 animate-pulse" />
              <h2 className="text-lg font-semibold">Assistant IA</h2>
            </div>

            <p className="text-purple-100 mb-4">
              Basé sur tes performances, voici mes recommandations :
            </p>

            {suggestions.length === 0 ? (
              <p className="text-purple-200">Aucune suggestion pour le moment. Continue ton bon travail !</p>
            ) : (
              <div className="space-y-3">
                {suggestions.slice(0, 2).map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer group/item"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <StarIconSolid className="h-4 w-4 text-yellow-300 group-hover/item:animate-ping" />
                      <span className="font-medium">{suggestion.subject_nom || 'Exercice'}</span>
                    </div>
                    <p className="text-sm text-purple-100">{suggestion.raison}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {suggestions.length > 2 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                Voir toutes les suggestions ({suggestions.length})
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Prochains événements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100"
      >
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary-600" />
          Prochains événements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Examen de Mathématiques', date: '2026-03-15', type: 'examen', icon: '📝', color: 'bg-red-100 text-red-600' },
            { title: 'TP d\'Informatique', date: '2026-03-10', type: 'tp', icon: '💻', color: 'bg-blue-100 text-blue-600' },
            { title: 'Devoir de Physique', date: '2026-03-12', type: 'devoir', icon: '📚', color: 'bg-green-100 text-green-600' },
          ].map((event, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-secondary-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl ${event.color.split(' ')[1]}`}>{event.icon}</span>
                <span className="text-sm font-medium text-secondary-900">{event.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(event.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long'
                })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default EtudiantDashboard