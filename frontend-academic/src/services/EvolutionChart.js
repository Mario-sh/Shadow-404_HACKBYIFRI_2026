import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const EvolutionChart = ({ notes }) => {
  // Trier par date et formater
  const chartData = notes
    ?.sort((a, b) => new Date(a.date_note) - new Date(b.date_note))
    .map(note => ({
      date: new Date(note.date_note).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short'
      }),
      note: note.valeur_note,
      matiere: note.matiere_nom
    })) || []

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          domain={[0, 20]}
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200">
                  <p className="font-medium">{payload[0].payload.matiere}</p>
                  <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
                  <p className="text-primary-600 font-semibold mt-1">{payload[0].value}/20</p>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="note"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', r: 4 }}
          activeDot={{ r: 6, fill: '#1e40af' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default EvolutionChart