import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  EyeIcon,
  PlusCircleIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const ProfesseurDashboard = () => {
  const { user } = useAuth()
  const [selectedClasse, setSelectedClasse] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('semaine')

  // ============================================
  // 1. RÉCUPÉRER LES CLASSES
  // ============================================
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const response = await academicService.getClasses()
        // S'assurer que c'est un tableau
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération classes:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. RÉCUPÉRER LES STATISTIQUES GLOBALES
  // ============================================
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['profStats', selectedPeriod],
    queryFn: async () => {
      try {
        // Récupérer les étudiants
        const etudiantsResponse = await academicService.getEtudiants()
        const etudiants = Array.isArray(etudiantsResponse.data) ? etudiantsResponse.data :
                          etudiantsResponse.data?.results ? etudiantsResponse.data.results : []

        // Récupérer les notes récentes
        const notesResponse = await academicService.getNotesRecentes(100)
        let notes = []
        if (Array.isArray(notesResponse.data)) {
          notes = notesResponse.data
        } else if (notesResponse.data?.results) {
          notes = notesResponse.data.results
        } else if (notesResponse.data) {
          notes = [notesResponse.data]
        }

        // Récupérer les étudiants en difficulté
        const difficilesResponse = await academicService.getEtudiantsEnDifficulte()
        const difficiles = Array.isArray(difficilesResponse.data) ? difficilesResponse.data :
                           difficilesResponse.data?.results ? difficilesResponse.data.results : []

        return {
          totalStudents: etudiants.length || 0,
          totalNotes: notes.length || 0,
          studentsInDifficulty: difficiles.length || 0,
          averageGrade: calculerMoyenneGlobale(notes)
        }
      } catch (error) {
        console.error('❌ Erreur récupération stats:', error)
        return {
          totalStudents: 0,
          totalNotes: 0,
          studentsInDifficulty: 0,
          averageGrade: 0
        }
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 3. RÉCUPÉRER LES ÉTUDIANTS EN DIFFICULTÉ
  // ============================================
  const { data: studentsInDifficultyData, isLoading: difficultyLoading } = useQuery({
    queryKey: ['studentsInDifficulty'],
    queryFn: async () => {
      try {
        const response = await academicService.getEtudiantsEnDifficulte()
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération étudiants difficiles:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 4. RÉCUPÉRER LES DERNIÈRES NOTES
  // ============================================
  const { data: recentNotesData, isLoading: notesLoading } = useQuery({
    queryKey: ['recentNotes'],
    queryFn: async () => {
      try {
        const response = await academicService.getNotesRecentes(10)
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results :
               response.data ? [response.data] : []
      } catch (error) {
        console.error('❌ Erreur récupération notes récentes:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 5. RÉCUPÉRER LES STATISTIQUES D'UNE CLASSE
  // ============================================
  const { data: classStats } = useQuery({
    queryKey: ['classStats', selectedClasse],
    queryFn: async () => {
      if (selectedClasse === 'all') return null
      try {
        const response = await academicService.getStatsClasse(selectedClasse)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération stats classe:', error)
        return null
      }
    },
    enabled: !!selectedClasse && selectedClasse !== 'all'
  })

  // ============================================
  // 6. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const classes = Array.isArray(classesData) ? classesData : []
  const studentsInDifficulty = Array.isArray(studentsInDifficultyData) ? studentsInDifficultyData : []
  const recentNotes = Array.isArray(recentNotesData) ? recentNotesData : []

  // ============================================
  // 7. PRÉPARATION DES DONNÉES POUR LES GRAPHIQUES
  // ============================================

  // Données d'évolution (simulées pour l'exemple)
  const evolutionData = [
    { date: 'Sem 1', moyenne: 12.5 },
    { date: 'Sem 2', moyenne: 13.2 },
    { date: 'Sem 3', moyenne: 13.8 },
    { date: 'Sem 4', moyenne: 14.1 },
    { date: 'Sem 5', moyenne: 13.9 },
    { date: 'Sem 6', moyenne: 14.5 }
  ]

  // Données de répartition des notes
  const distributionData = classStats?.distribution ? [
    { name: 'Excellent', value: classStats.distribution.excellent || 0 },
    { name: 'Bon', value: classStats.distribution.bon || 0 },
    { name: 'Moyen', value: classStats.distribution.moyen || 0 },
    { name: 'Insuffisant', value: classStats.distribution.insuffisant || 0 }
  ] : []

  const COLORS = ['#059669', '#0284c7', '#eab308', '#dc2626']

  // ============================================
  // 8. FONCTIONS UTILITAIRES
  // ============================================
  const calculerMoyenneGlobale = (notes) => {
    if (!notes || !Array.isArray(notes) || notes.length === 0) return 0
    try {
      const sum = notes.reduce((acc, note) => {
        // Gérer différents formats de note
        const valeur = note.valeur_note || note.note || 0
        return acc + (parseFloat(valeur) || 0)
      }, 0)
      return (sum / notes.length).toFixed(1)
    } catch (error) {
      console.error('❌ Erreur calcul moyenne:', error)
      return 0
    }
  }

  const getNoteColor = (note) => {
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const isLoading = classesLoading || statsLoading || difficultyLoading || notesLoading

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
      {/* En-tête avec bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Bonjour, {user?.username} 👨‍🏫
          </h1>
          <p className="text-secondary-600 mt-1">
            Gérez vos classes et suivez la progression de vos étudiants
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/notes/saisie"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Saisir des notes
          </Link>
          <Link
            to="/exercices/creation"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Créer un exercice
          </Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total étudiants"
          value={stats?.totalStudents || 0}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Moyenne générale"
          value={`${stats?.averageGrade || 0}/20`}
          icon={ChartBarIcon}
          color="green"
        />
        <StatCard
          title="Notes saisies"
          value={stats?.totalNotes || 0}
          icon={DocumentTextIcon}
          color="yellow"
        />
        <StatCard
          title="En difficulté"
          value={studentsInDifficulty.length}
          icon={ExclamationCircleIcon}
          color="red"
        />
      </div>

      {/* Sélecteur de classe et période */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-secondary-700">Filtrer par classe :</span>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="all">Toutes les classes</option>
              {classes.map(c => (
                <option key={c.id_classe} value={c.id_classe}>{c.nom_class}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 bg-secondary-100 rounded-lg p-1">
            {['semaine', 'mois', 'trimestre'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des notes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Évolution des notes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis domain={[0, 20]} stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="moyenne"
                name="Moyenne"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ fill: '#0284c7', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution des notes (si une classe est sélectionnée) */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Distribution des notes</h2>
          {selectedClasse !== 'all' && distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-400">
              {selectedClasse === 'all'
                ? "Sélectionnez une classe pour voir la distribution"
                : "Pas assez de données"}
            </div>
          )}
        </div>
      </div>

      {/* Étudiants en difficulté */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            Étudiants à suivre
          </h2>
          <Link to="/etudiants?difficulte=true" className="text-sm text-primary-600 hover:text-primary-700">
            Voir tout →
          </Link>
        </div>

        {studentsInDifficulty.length === 0 ? (
          <p className="text-secondary-500 text-center py-8">Aucun étudiant en difficulté</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentsInDifficulty.slice(0, 6).map((student) => (
              <div key={student.id_student} className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {student.prenom?.[0]}{student.nom?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{student.prenom} {student.nom}</p>
                    <p className="text-xs text-secondary-500">{student.classe_nom}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-200 text-red-700 rounded-full text-xs font-semibold">
                    {student.moyenne?.toFixed(1) || 'N/A'}/20
                  </span>
                  <Link
                    to={`/etudiants/${student.id_student}`}
                    className="p-2 bg-white rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 text-primary-600" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières notes saisies */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">Dernières notes saisies</h2>
          <Link to="/notes" className="text-sm text-primary-600 hover:text-primary-700">
            Voir toutes les notes →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Matière</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {recentNotes.map((note) => (
                <tr key={note.id_note} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {note.student_prenom?.[0]}{note.student_nom?.[0]}
                        </span>
                      </div>
                      <span className="font-medium text-secondary-900">
                        {note.student_prenom} {note.student_nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{note.matiere_nom}</td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-semibold ${getNoteColor(note.valeur_note)}`}>
                      {note.valeur_note}/20
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs capitalize">
                      {note.type_evaluation}
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
                        <ClockIcon className="h-4 w-4" />
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/notes/saisie?etudiant=${note.id_student}`}
                      className="p-2 hover:bg-primary-100 rounded-lg"
                      title="Modifier"
                    >
                      <PencilSquareIcon className="h-4 w-4 text-primary-600" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentNotes.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucune note récente</p>
          </div>
        )}
      </div>

      {/* Statistiques par classe (si une classe est sélectionnée) */}
      {selectedClasse !== 'all' && classStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Performance par matière</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classStats.matieres || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nom" stroke="#64748b" />
                <YAxis domain={[0, 20]} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="moyenne" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informations classe</h2>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Effectif</span>
                <span className="font-semibold text-secondary-900">{classStats.effectif || 0}</span>
              </div>
              <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Moyenne générale</span>
                <span className="font-semibold text-green-600">{classStats.moyenne_classe?.toFixed(1) || 'N/A'}/20</span>
              </div>
              <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Taux de réussite</span>
                <span className="font-semibold text-blue-600">{classStats.taux_reussite || 0}%</span>
              </div>
              <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Meilleure matière</span>
                <span className="font-semibold text-secondary-900">{classStats.meilleure_matiere || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Matière à améliorer</span>
                <span className="font-semibold text-secondary-900">{classStats.matiere_faible || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200">
              <Link
                to={`/classes/${selectedClasse}`}
                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Voir les détails de la classe →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions IA pour le professeur */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-yellow-300" />
          <h2 className="text-lg font-semibold">Suggestions IA</h2>
        </div>

        <p className="text-purple-100 mb-4">
          Basé sur les performances de vos étudiants, voici quelques suggestions :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <AcademicCapIcon className="h-5 w-5 text-yellow-300" />
              <span className="font-medium">{studentsInDifficulty.length} étudiants en difficulté</span>
            </div>
            <p className="text-sm text-purple-100">
              Organisez une session de rattrapage pour les aider
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-yellow-300" />
              <span className="font-medium">Moyenne: {stats?.averageGrade || 0}/20</span>
            </div>
            <p className="text-sm text-purple-100">
              {stats?.averageGrade < 12 ? "La moyenne générale est faible" : "Les performances sont bonnes"}
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="h-5 w-5 text-yellow-300" />
              <span className="font-medium">{stats?.totalNotes || 0} notes saisies</span>
            </div>
            <p className="text-sm text-purple-100">
              Continuez à suivre régulièrement vos étudiants
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfesseurDashboard