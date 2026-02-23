import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { iaService } from '../../services/ia'
import { useAuth } from '../../hooks/useAuth'
import {
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  TrophyIcon,
  FireIcon,
  UserGroupIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import StatCard from '../../components/common/StatCard'

// Données mockées en attendant que l'API soit prête
const mockStats = {
  moyenne_generale: 14.5,
  total_notes: 12,
  matiere_forte: "Mathématiques",
  matiere_faible: "Physique",
  progression: "en_progres",
  moyennes_par_matiere: {
    "Mathématiques": 16.5,
    "Physique": 10.2,
    "Informatique": 15.0,
    "Anglais": 12.3,
    "Français": 13.8
  }
}

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
  }
]

const mockSuggestions = {
  nb_suggestions: 2,
  suggestions: [
    {
      subject_nom: "Mathématiques",
      raison: "⚠️ Ta moyenne est de 8.5/20. Commence par des exercices faciles."
    },
    {
      subject_nom: "Physique",
      raison: "📚 À travailler : tu as 9.2/20 en Physique."
    }
  ]
}

const EtudiantDashboard = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('semaine')

  // Récupérer les statistiques - CORRIGÉ
  const { data: stats, isLoading } = useQuery({
    queryKey: ['studentStats', user?.id],
    queryFn: () => academicService.getStatistiques(user?.id).catch(() => mockStats),
    enabled: !!user?.id,
    initialData: mockStats // Données mockées par défaut
  })

  // Récupérer les notes - CORRIGÉ (plus d'objet, juste l'ID)
  const { data: notes } = useQuery({
    queryKey: ['studentNotes', user?.id],
    queryFn: () => academicService.getNotes(user?.id).catch(() => mockNotes),
    enabled: !!user?.id,
    initialData: mockNotes
  })

  // Récupérer les suggestions IA - CORRIGÉ
  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', user?.id],
    queryFn: () => iaService.getSuggestions(user?.id, 3).catch(() => mockSuggestions),
    enabled: !!user?.id,
    initialData: mockSuggestions
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-primary-600 font-medium">Chargement...</span>
          </div>
        </div>
      </div>
    )
  }

  // Calcul du niveau et progression
  const calculateLevel = (moyenne) => {
    if (!moyenne) return { level: 'Débutant', color: 'text-secondary-600', progress: 0 }
    if (moyenne < 10) return { level: 'Débutant', color: 'text-yellow-600', progress: (moyenne/20)*100 }
    if (moyenne < 14) return { level: 'Intermédiaire', color: 'text-blue-600', progress: (moyenne/20)*100 }
    if (moyenne < 18) return { level: 'Avancé', color: 'text-green-600', progress: (moyenne/20)*100 }
    return { level: 'Expert', color: 'text-purple-600', progress: (moyenne/20)*100 }
  }

  const level = calculateLevel(stats?.moyenne_generale)

  // Activités récentes simulées
  const recentActivities = [
    { id: 1, type: 'note', title: 'Nouvelle note en Mathématiques', value: '16/20', date: 'Il y a 2 heures', icon: AcademicCapIcon, color: 'text-green-600' },
    { id: 2, type: 'suggestion', title: 'Exercice recommandé', value: 'Dérivées', date: 'Il y a 5 heures', icon: SparklesIcon, color: 'text-yellow-600' },
    { id: 3, type: 'ressource', title: 'Nouveau PDF disponible', value: 'Cours Physique', date: 'Hier', icon: DocumentTextIcon, color: 'text-blue-600' },
    { id: 4, type: 'video', title: 'Vidéo ajoutée', value: 'Algorithmes', date: 'Hier', icon: VideoCameraIcon, color: 'text-purple-600' },
  ]

  // Ressources récentes
  const recentResources = [
    { id: 1, title: 'Cours Mathématiques - Dérivées', type: 'PDF', icon: DocumentTextIcon, color: 'bg-red-100 text-red-600' },
    { id: 2, title: 'Vidéo - Introduction à React', type: 'Vidéo', icon: VideoCameraIcon, color: 'bg-blue-100 text-blue-600' },
    { id: 3, title: 'Liens utiles - Documentation', type: 'Lien', icon: LinkIcon, color: 'bg-green-100 text-green-600' },
    { id: 4, title: 'Exercices - Algorithmes', type: 'Exercice', icon: BookOpenIcon, color: 'bg-yellow-100 text-yellow-600' },
  ]

  // Objectifs
  const goals = [
    { id: 1, title: 'Moyenne > 14', progress: 75, current: 12.5, target: 14, color: 'bg-green-500' },
    { id: 2, title: 'Exercices complétés', progress: 60, current: 30, target: 50, color: 'bg-blue-500' },
    { id: 3, title: 'Heures d\'étude', progress: 45, current: 18, target: 40, color: 'bg-yellow-500' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête avec bienvenue et stats rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de bienvenue */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour, {user?.prenom || user?.username} 👋
              </h1>
              <p className="text-primary-100 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <FireIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <p className="text-sm text-primary-200">Jours d'étude</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <p className="text-sm text-primary-200">Exercices</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <p className="text-sm text-primary-200">Objectifs</p>
              <p className="text-2xl font-bold">8/12</p>
            </div>
          </div>
        </div>

        {/* Carte de niveau */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Niveau global</h3>
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-900 mb-2">{stats?.moyenne_generale || 'N/A'}/20</div>
            <p className={`text-lg font-medium ${level.color}`}>{level.level}</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-secondary-600">Progression</span>
              <span className="font-medium text-secondary-900">{Math.round(level.progress)}%</span>
            </div>
            <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                style={{ width: `${level.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIconSolid key={star} className={`h-4 w-4 ${star <= Math.floor(level.progress/20) ? 'text-yellow-400' : 'text-secondary-200'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Moyenne générale"
          value={stats?.moyenne_generale ? `${stats.moyenne_generale}/20` : 'N/A'}
          icon={AcademicCapIcon}
          color="primary"
          trend={stats?.progression === 'en_progres' ? 'up' : stats?.progression === 'en_baisse' ? 'down' : null}
          subtitle="Dernier semestre"
        />

        <StatCard
          title="Notes enregistrées"
          value={stats?.total_notes || 0}
          icon={ChartBarIcon}
          color="blue"
          subtitle="Cette année"
        />

        <StatCard
          title="Matière favorite"
          value={stats?.matiere_forte || 'N/A'}
          icon={BookOpenIcon}
          color="green"
          subtitle="Meilleure moyenne"
        />

        <StatCard
          title="Suggestions IA"
          value={suggestions?.nb_suggestions || 0}
          icon={SparklesIcon}
          color="purple"
          subtitle="Nouvelles recommandations"
        />
      </div>

      {/* Section principale avec graphiques et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des performances (carte large) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
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

          {stats?.moyennes_par_matiere && Object.keys(stats.moyennes_par_matiere).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.moyennes_par_matiere).map(([matiere, moyenne]) => (
                <div key={matiere} className="group hover:bg-secondary-50 p-3 rounded-xl transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-secondary-900">{matiere}</span>
                      {moyenne === Math.max(...Object.values(stats.moyennes_par_matiere)) && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Meilleure
                        </span>
                      )}
                      {moyenne === Math.min(...Object.values(stats.moyennes_par_matiere)) && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          À améliorer
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-semibold ${
                      moyenne >= 16 ? 'text-green-600' :
                      moyenne >= 12 ? 'text-blue-600' :
                      moyenne >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {moyenne}/20
                    </span>
                  </div>
                  <div className="w-full h-3 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        moyenne >= 16 ? 'bg-green-500' :
                        moyenne >= 12 ? 'bg-blue-500' :
                        moyenne >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(moyenne / 20) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-secondary-500">
                      {Math.round((moyenne / 20) * 100)}% de progression
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-secondary-400">
              Pas assez de données pour afficher le graphique
            </div>
          )}
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Activités récentes</h2>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">En direct</span>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`p-2 rounded-lg ${activity.color.replace('text', 'bg').replace('600', '100')}`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-secondary-900">{activity.value}</span>
                    <span className="text-xs text-secondary-500">• {activity.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-secondary-100">
            <button className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Voir toutes les activités →
            </button>
          </div>
        </div>
      </div>

      {/* Section objectifs et suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectifs */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Objectifs d'apprentissage</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700">+ Ajouter</button>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="group hover:bg-secondary-50 p-3 rounded-xl transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-secondary-900">{goal.title}</span>
                  <span className="text-sm text-secondary-600">{goal.current}/{goal.target}</span>
                </div>
                <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${goal.color}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-secondary-500">{goal.progress}% accompli</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions IA */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-yellow-300" />
            <h2 className="text-lg font-semibold">Assistant IA</h2>
          </div>

          <p className="text-purple-100 mb-4">
            Basé sur tes performances, voici mes recommandations :
          </p>

          {suggestions?.suggestions?.map((suggestion, index) => (
            <div key={index} className="mb-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <StarIcon className="h-4 w-4 text-yellow-300" />
                <span className="font-medium">{suggestion.subject_nom}</span>
              </div>
              <p className="text-sm text-purple-100">{suggestion.raison}</p>
            </div>
          ))}

          <button className="mt-4 w-full py-2 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
            Voir toutes les suggestions
          </button>
        </div>
      </div>

      {/* Ressources récentes */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">Ressources récentes</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg">Tout</button>
            <button className="px-3 py-1 text-sm text-secondary-600 hover:bg-secondary-100 rounded-lg">PDF</button>
            <button className="px-3 py-1 text-sm text-secondary-600 hover:bg-secondary-100 rounded-lg">Vidéos</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentResources.map((resource, index) => (
            <div key={resource.id} className="group p-4 bg-secondary-50 rounded-xl hover:shadow-md transition-all cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`w-10 h-10 ${resource.color} rounded-lg flex items-center justify-center mb-3`}>
                <resource.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors">
                {resource.title}
              </h3>
              <p className="text-xs text-secondary-500">{resource.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calendrier et événements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini calendrier */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Prochains événements</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-secondary-50 rounded-xl">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">25</div>
                <div className="text-xs text-secondary-500">Fév</div>
              </div>
              <div>
                <p className="font-medium text-secondary-900">Examen de Mathématiques</p>
                <p className="text-sm text-secondary-600">Salle 101 • 14:00 - 16:00</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary-50 rounded-xl">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">28</div>
                <div className="text-xs text-secondary-500">Fév</div>
              </div>
              <div>
                <p className="font-medium text-secondary-900">Rendu projet Physique</p>
                <p className="text-sm text-secondary-600">À rendre sur Moodle</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary-50 rounded-xl">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">02</div>
                <div className="text-xs text-secondary-500">Mars</div>
              </div>
              <div>
                <p className="font-medium text-secondary-900">TP Informatique</p>
                <p className="text-sm text-secondary-600">Labo 203 • 09:00 - 12:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges et accomplissements */}
        <div className="bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrophyIcon className="h-6 w-6 text-yellow-400" />
            <h2 className="text-lg font-semibold">Accomplissements</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">Régularité</span>
              </div>
              <p className="text-2xl font-bold">15</p>
              <p className="text-xs text-secondary-300">jours consécutifs</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="h-4 w-4 text-orange-400" />
                <span className="font-medium">Exercices</span>
              </div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-secondary-300">complétés</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <AcademicCapIcon className="h-4 w-4 text-green-400" />
                <span className="font-medium">Moyenne</span>
              </div>
              <p className="text-2xl font-bold">14.5</p>
              <p className="text-xs text-secondary-300">/20</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="h-4 w-4 text-blue-400" />
                <span className="font-medium">Classement</span>
              </div>
              <p className="text-2xl font-bold">#8</p>
              <p className="text-xs text-secondary-300">sur 45</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EtudiantDashboard