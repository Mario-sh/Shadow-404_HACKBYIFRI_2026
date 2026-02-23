import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

const PerformanceChart = ({ data }) => {
  // Transformer les données pour le graphique radar
  const chartData = Object.entries(data || {}).map(([matiere, note]) => ({
    matiere: matiere.length > 10 ? matiere.substring(0, 10) + '...' : matiere,
    note: parseFloat(note),
    fullName: matiere
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="matiere" />
        <PolarRadiusAxis angle={30} domain={[0, 20]} />
        <Radar
          name="Notes"
          dataKey="note"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200">
                  <p className="font-medium">{payload[0].payload.fullName}</p>
                  <p className="text-primary-600 font-semibold">{payload[0].value}/20</p>
                </div>
              )
            }
            return null
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default PerformanceChart