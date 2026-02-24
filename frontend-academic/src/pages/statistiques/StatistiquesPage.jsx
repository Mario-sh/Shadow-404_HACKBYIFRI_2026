import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { iaService } from '../../services/ia'
import { useAuth } from '../../hooks/useAuth'
import {
  ChartBarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  CalendarIcon,
  TrophyIcon,
  FireIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'

const StatistiquesPage = () => {
  const { user } = useAuth()
  const [etudiantId, setEtudiantId] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('semaine')
  const [selectedMatiere, setSelectedMatiere] = useState('all')

  // ============================================
  // 1. RÉCUPÉRER L'ÉTUDIANT (si c'est un étudiant)
  // ============================================
  const { data: etudiant } = useQuery({
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
  // 2. RÉCUPÉRER LES STATISTIQUES DE L'ÉTUDIANT
  // ============================================
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

  // ============================================
  // 3. RÉCUPÉRER LES NOTES POUR LES GRAPHIQUES
  // ============================================
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['studentNotes', etudiantId],
    queryFn: async () => {
      if (!etudiantId) return []
      try {
        const response = await academicService.getNotes(etudiantId)
        // S'assurer que c'est un tableau
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results :
               response.data ? [response.data] : []
      } catch (error) {
        console.error('❌ Erreur récupération notes:', error)
        return []
      }
    },
    enabled: !!etudiantId
  })

  // ============================================
  // 4. RÉCUPÉRER L'ANALYSE IA
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
  // 5. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const notes = Array.isArray(notesData) ? notesData : []
  const analyse = analyseData || stats?.analyse || {}

  // ============================================
  // 6. PRÉPARATION DES DONNÉES POUR LES GRAPHIQUES
  // ============================================

  // Données pour le graphique en radar (performance par matière)
  const radarData = stats?.moyennes_par_matiere
    ? Object.entries(stats.moyennes_par_matiere).map(([matiere, moyenne]) => ({
        matiere,
        moyenne: moyenne,
        fullMark: 20
      }))
    : []

  // Données pour le graphique en barres (évolution des notes)
  const evolutionData = notes.length > 0
    ? [...notes]
        .sort((a, b) => new Date(a.date_note) - new Date(b.date_note))
        .slice(-10)
        .map(note => ({
          date: new Date(note.date_note).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          note: note.valeur_note,
          matiere: note.matiere_nom
        }))
    : []

  // Données pour le graphique circulaire (répartition des types d'évaluation)
  const typeData = notes.length > 0
    ? Object.entries(
        notes.reduce((acc, note) => {
          acc[note.type_evaluation] = (acc[note.type_evaluation] || 0) + 1
          return acc
        }, {})
      ).map(([type, count]) => ({
        name: type === 'examen' ? 'Examens' :
              type === 'devoir' ? 'Devoirs' : 'TP',
        value: count
      }))
    : []

  // Données pour le graphique en barres (moyennes par matière)
  const matieresData = stats?.moyennes_par_matiere
    ? Object.entries(stats.moyennes_par_matiere).map(([matiere, moyenne]) => ({
        matiere,
        moyenne
      }))
    : []

  // ============================================
  // 7. COULEURS POUR LES GRAPHIQUES
  // ============================================
  const COLORS = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']

  // ============================================
  // 8. FONCTIONS UTILITAIRES
  // ============================================
  const calculateLevel = (moyenne) => {
    if (!moyenne) return { level: 'Débutant', color: 'text-secondary-600', progress: 0 }
    if (moyenne < 10) return { level: 'Débutant', color: 'text-yellow-600', progress: (moyenne/20)*100 }
    if (moyenne < 14) return { level: 'Intermédiaire', color: 'text-blue-600', progress: (moyenne/20)*100 }
    if (moyenne < 18) return { level: 'Avancé', color: 'text-green-600', progress: (moyenne/20)*100 }
    return { level: 'Expert', color: 'text-purple-600', progress: (moyenne/20)*100 }
  }

  const level = calculateLevel(stats?.moyenne_generale)

  // Calculer la meilleure note
  const meilleureNote = notes.length > 0
    ? Math.max(...notes.map(n => n.valeur_note)).toFixed(1)
    : 'N/A'

  const noteMeilleure = notes.length > 0
    ? notes.find(n => n.valeur_note === Math.max(...notes.map(n => n.valeur_note)))
    : null

  const isLoading = statsLoading || notesLoading

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
          <h1 className="text-2xl font-bold text-secondary-900">Statistiques détaillées</h1>
          <p className="text-secondary-600 mt-1">
            Analyse complète de vos performances académiques
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-secondary-200">
          {['semaine', 'mois', 'trimestre'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-secondary-100 text-secondary-600'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Moyenne générale</p>
          <p className="text-3xl font-bold mt-2">{stats?.moyenne_generale?.toFixed(1) || 'N/A'}/20</p>
          <p className="text-xs opacity-75 mt-1">Niveau {level.level}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total notes</p>
          <p className="text-3xl font-bold mt-2">{notes.length}</p>
          <p className="text-xs opacity-75 mt-1">Cette année</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Meilleure note</p>
          <p className="text-3xl font-bold mt-2">{meilleureNote}/20</p>
          <p className="text-xs opacity-75 mt-1">
            {noteMeilleure?.matiere_nom || ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Progression</p>
          <p className="text-3xl font-bold mt-2">
            {analyse?.progression === 'en_progres' ? '📈' :
             analyse?.progression === 'en_baisse' ? '📉' : '⚖️'}
          </p>
          <p className="text-xs opacity-75 mt-1 capitalize">
            {analyse?.progression === 'en_progres' ? 'En progrès' :
             analyse?.progression === 'en_baisse' ? 'En baisse' : 'Stable'}
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique radar - Performance par matière */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Performance par matière</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="matiere" />
                <PolarRadiusAxis domain={[0, 20]} />
                <Radar
                  name="Moyenne"
                  dataKey="moyenne"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-400">
              Pas assez de données
            </div>
          )}
        </div>

        {/* Graphique en barres - Évolution des notes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Évolution des notes</h2>
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis domain={[0, 20]} stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="note"
                  name="Note"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ fill: '#0284c7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-400">
              Pas assez de données
            </div>
          )}
        </div>

        {/* Graphique en barres - Moyennes par matière */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Moyennes par matière</h2>
          {matieresData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matieresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="matiere" stroke="#64748b" />
                <YAxis domain={[0, 20]} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="moyenne" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {matieresData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-400">
              Pas assez de données
            </div>
          )}
        </div>

        {/* Graphique circulaire - Répartition des types d'évaluation */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Types d'évaluation</h2>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-400">
              Pas assez de données
            </div>
          )}
        </div>
      </div>

      {/* Matières à risque (suggestions IA) */}
      {analyse?.matieres_risque?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-red-500" />
            Matières à travailler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyse.matieres_risque.map((matiere, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-secondary-900">{matiere.nom}</span>
                  <span className="px-2 py-1 bg-red-200 text-red-700 rounded-full text-xs">
                    Priorité {matiere.priorite}%
                  </span>
                </div>
                <p className="text-sm text-secondary-600">Moyenne: {matiere.moyenne?.toFixed(1)}/20</p>
                <div className="mt-2 w-full h-2 bg-red-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(matiere.moyenne / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau récapitulatif */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Détail des notes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-600">Matière</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-600">Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-600">Note</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-600">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {notes.slice(0, 10).map((note) => (
                <tr key={note.id_note}>
                  <td className="px-4 py-2">{note.matiere_nom}</td>
                  <td className="px-4 py-2 capitalize">{note.type_evaluation}</td>
                  <td className="px-4 py-2">
                    <span className={`font-semibold ${
                      note.valeur_note >= 16 ? 'text-green-600' :
                      note.valeur_note >= 12 ? 'text-blue-600' :
                      note.valeur_note >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {note.valeur_note}/20
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(note.date_note).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2">
                    {note.valide ? (
                      <span className="text-green-600">Validée</span>
                    ) : (
                      <span className="text-yellow-600">En attente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StatistiquesPage