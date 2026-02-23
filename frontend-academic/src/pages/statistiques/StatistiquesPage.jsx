import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  ChartBarIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter
} from 'recharts'

const StatistiquesPage = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('year')
  const [selectedView, setSelectedView] = useState('global')
  const [compareWithClass, setCompareWithClass] = useState(false)

  // Récupérer les données
  const { data: stats, isLoading } = useQuery({
    queryKey: ['detailedStats', user?.id, selectedPeriod],
    queryFn: () => academicService.getStatistiques(user?.id),
    enabled: !!user?.id
  })

  const { data: classStats } = useQuery({
    queryKey: ['classStats', user?.id],
    queryFn: () => academicService.getClasseStatistiques(user?.classe),
    enabled: !!user?.id && compareWithClass
  })

  // Données simulées pour les graphiques (à remplacer par les vraies données API)
  const evolutionData = [
    { mois: 'Sep', notes: 12, moyenne: 12.5, classMoyenne: 11.8 },
    { mois: 'Oct', notes: 15, moyenne: 13.2, classMoyenne: 12.1 },
    { mois: 'Nov', notes: 18, moyenne: 14.1, classMoyenne: 12.5 },
    { mois: 'Dec', notes: 14, moyenne: 13.8, classMoyenne: 12.3 },
    { mois: 'Jan', notes: 20, moyenne: 15.2, classMoyenne: 12.9 },
    { mois: 'Fév', notes: 22, moyenne: 16.0, classMoyenne: 13.2 },
  ]

  const matieresData = stats?.moyennes_par_matiere
    ? Object.entries(stats.moyennes_par_matiere).map(([name, value]) => ({
        subject: name,
        moyenne: value,
        classMoyenne: value - 1.2 + Math.random() * 2,
        max: 20,
        min: 0
      }))
    : []

  const distributionData = [
    { name: 'Excellent (16-20)', value: 8, color: '#059669' },
    { name: 'Bon (12-16)', value: 12, color: '#0284c7' },
    { name: 'Moyen (10-12)', value: 5, color: '#d97706' },
    { name: 'Insuffisant (0-10)', value: 3, color: '#dc2626' },
  ]

  const progressionData = [
    { semaine: 'S1', heures: 8, exercices: 12, progression: 65 },
    { semaine: 'S2', heures: 10, exercices: 15, progression: 72 },
    { semaine: 'S3', heures: 12, exercices: 18, progression: 78 },
    { semaine: 'S4', heures: 15, exercices: 22, progression: 85 },
    { semaine: 'S5', heures: 14, exercices: 20, progression: 82 },
    { semaine: 'S6', heures: 18, exercices: 25, progression: 90 },
  ]

  const COLORS = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ChartBarIcon className="h-6 w-6 text-primary-600 animate-pulse" />
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
          <h1 className="text-2xl font-bold text-secondary-900">Statistiques détaillées</h1>
          <p className="text-secondary-600 mt-1">
            Analyse approfondie de vos performances académiques
          </p>
        </div>

        {/* Période selector */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-lg border border-secondary-100">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'month' 
                ? 'bg-primary-600 text-white' 
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setSelectedPeriod('trimester')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'trimester' 
                ? 'bg-primary-600 text-white' 
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'year' 
                ? 'bg-primary-600 text-white' 
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            Année
          </button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Moyenne générale</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">{stats?.moyenne_generale || 14.2}/20</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <AcademicCapIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span className="text-sm">+0.8 vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Taux de réussite</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">85%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrophyIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <span className="text-sm">Top 15% de la classe</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Heures d'étude</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">142h</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary-600">
            <span className="text-sm">Moyenne: 4.7h/jour</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Exercices réalisés</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">156</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-purple-600">
            <FireIcon className="h-4 w-4" />
            <span className="text-sm">Série de 12 jours</span>
          </div>
        </div>
      </div>

      {/* Comparaison avec la classe */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-secondary-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={compareWithClass}
            onChange={(e) => setCompareWithClass(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
          />
          <span className="text-secondary-700">Comparer avec la moyenne de la classe</span>
        </label>
      </div>

      {/* Graphique d'évolution */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">Évolution des performances</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              <span className="text-sm text-secondary-600">Mes notes</span>
            </div>
            {compareWithClass && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary-400 rounded-full"></div>
                <span className="text-sm text-secondary-600">Moyenne classe</span>
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mois" stroke="#64748b" />
            <YAxis domain={[0, 20]} stroke="#64748b" />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border border-secondary-200">
                      <p className="font-medium text-secondary-900">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name}: {entry.value}/20
                        </p>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="moyenne"
              name="Mes notes"
              stroke="#0284c7"
              strokeWidth={3}
              dot={{ fill: '#0284c7', r: 6 }}
              activeDot={{ r: 8, fill: '#0369a1' }}
            />
            {compareWithClass && (
              <Line
                type="monotone"
                dataKey="classMoyenne"
                name="Moyenne classe"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#94a3b8', r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphiques multiples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance par matière */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">Performance par matière</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={matieresData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 20]} stroke="#64748b" />
              <YAxis type="category" dataKey="subject" stroke="#64748b" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="moyenne" name="Ma moyenne" fill="#0284c7" radius={[0, 4, 4, 0]} />
              {compareWithClass && (
                <Bar dataKey="classMoyenne" name="Moyenne classe" fill="#94a3b8" radius={[0, 4, 4, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution des notes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">Distribution des notes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique de progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progression hebdomadaire */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">Progression hebdomadaire</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semaine" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="progression"
                name="Progression %"
                stroke="#0284c7"
                fill="#0284c7"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Temps d'étude vs exercices */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6">Temps d'étude vs Exercices</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semaine" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="heures" name="Heures d'étude" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="exercices" name="Exercices" stroke="#059669" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart - Compétences */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <h2 className="text-lg font-semibold text-secondary-900 mb-6">Analyse des compétences</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart outerRadius={90} data={matieresData.slice(0, 6)}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 20]} />
            <Radar name="Mes compétences" dataKey="moyenne" stroke="#0284c7" fill="#0284c7" fillOpacity={0.6} />
            {compareWithClass && (
              <Radar name="Moyenne classe" dataKey="classMoyenne" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
            )}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Prédictions</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm opacity-90">Moyenne estimée fin semestre</p>
              <p className="text-3xl font-bold">15.8/20</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Progression estimée</p>
              <p className="text-2xl font-bold text-green-300">+12%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Points forts</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-300" />
              <span>Mathématiques (16.5/20)</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-300" />
              <span>Informatique (15.8/20)</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-300" />
              <span>Physique (14.2/20)</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Points à améliorer</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-300" />
              <span>Chimie (8.5/20)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-300" />
              <span>Anglais (9.8/20)</span>
            </div>
          </div>
          <button className="mt-4 w-full py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            Voir les exercices recommandés
          </button>
        </div>
      </div>

      {/* Tableau de progression */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
        <h2 className="text-lg font-semibold text-secondary-900 mb-6">Historique détaillé</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 text-sm font-semibold text-secondary-600">Période</th>
                <th className="text-left py-3 text-sm font-semibold text-secondary-600">Moyenne</th>
                <th className="text-left py-3 text-sm font-semibold text-secondary-600">Évolution</th>
                <th className="text-left py-3 text-sm font-semibold text-secondary-600">Exercices</th>
                <th className="text-left py-3 text-sm font-semibold text-secondary-600">Heures</th>
                <th className="text-left py-3 text-sm font-semibold text-secondary-600">Rang</th>
              </tr>
            </thead>
            <tbody>
              {progressionData.map((data, index) => (
                <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="py-3 text-secondary-900">{data.semaine}</td>
                  <td className="py-3">
                    <span className={`font-semibold ${
                      data.progression > 80 ? 'text-green-600' :
                      data.progression > 70 ? 'text-blue-600' :
                      data.progression > 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(data.progression / 5 + 10)}/20
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {data.progression > 80 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : data.progression > 70 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{data.progression}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-secondary-600">{data.exercices}</td>
                  <td className="py-3 text-secondary-600">{data.heures}h</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-secondary-100 rounded-lg text-sm">
                      #{index + 1}/45
                    </span>
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