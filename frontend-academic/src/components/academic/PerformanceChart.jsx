import React from 'react'
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const PerformanceChart = ({
  type = 'line',
  data,
  height = 300,
  colors = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed']
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-secondary-400">
        Pas assez de données
      </div>
    )
  }

  // ============================================
  // 1. GRAPHIQUE EN LIGNES (évolution)
  // ============================================
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
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
    )
  }

  // ============================================
  // 2. GRAPHIQUE EN BARRES (comparaison)
  // ============================================
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="matiere" stroke="#64748b" />
          <YAxis domain={[0, 20]} stroke="#64748b" />
          <Tooltip />
          <Bar dataKey="moyenne" fill="#0284c7" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // ============================================
  // 3. GRAPHIQUE CIRCULAIRE (répartition)
  // ============================================
  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // ============================================
  // 4. GRAPHIQUE RADAR (performance par matière)
  // ============================================
  if (type === 'radar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
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
    )
  }

  return null
}

export default PerformanceChart