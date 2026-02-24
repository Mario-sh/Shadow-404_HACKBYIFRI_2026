import React from 'react'
import { Link } from 'react-router-dom'
import {
  LightBulbIcon,
  AcademicCapIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

const SuggestionCard = ({ suggestion, compact = false }) => {
  // ============================================
  // 1. CONFIGURATION
  // ============================================
  const difficultyColors = {
    1: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Facile',
      icon: '🌱'
    },
    2: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'Moyen',
      icon: '📚'
    },
    3: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Difficile',
      icon: '⚡'
    },
  }

  const difficulty = difficultyColors[suggestion.niveau_difficulte] || difficultyColors[1]

  // ============================================
  // 2. RENDU COMPACT (pour dashboard)
  // ============================================
  if (compact) {
    return (
      <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm hover:bg-white/20 transition-colors">
        <div className="flex items-start gap-2">
          <div className={`p-1.5 rounded-lg ${difficulty.bg} bg-opacity-30`}>
            <span className="text-sm">{difficulty.icon}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white line-clamp-1">{suggestion.titre}</p>
            <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{suggestion.raison}</p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // 3. RENDU NORMAL
  // ============================================
  return (
    <div className="bg-white rounded-2xl border border-secondary-200 p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start gap-4">
        {/* Icône de difficulté */}
        <div className={`p-3 rounded-xl ${difficulty.bg} ${difficulty.border} border-2 flex-shrink-0`}>
          <span className="text-2xl">{difficulty.icon}</span>
        </div>

        <div className="flex-1">
          {/* En-tête */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                {suggestion.titre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-secondary-500">{suggestion.subject_nom}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficulty.bg} ${difficulty.text}`}>
                  {difficulty.icon} {difficulty.label}
                </span>
              </div>
            </div>

            {/* Score de priorité */}
            {suggestion.priorite && (
              <div className="text-right flex-shrink-0">
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke={suggestion.priorite > 80 ? '#ef4444' : suggestion.priorite > 60 ? '#f97316' : '#eab308'}
                      strokeWidth="3"
                      strokeDasharray={`${(suggestion.priorite || 50) * 1.26} 126`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-secondary-900">{suggestion.priorite}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Raison */}
          <p className="text-sm text-secondary-600 mb-3 line-clamp-2">{suggestion.raison}</p>

          {/* Note actuelle */}
          {suggestion.note_actuelle && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-secondary-500">Note actuelle:</span>
              <span className={`text-sm font-semibold ${
                suggestion.note_actuelle >= 16 ? 'text-green-600' :
                suggestion.note_actuelle >= 12 ? 'text-blue-600' :
                suggestion.note_actuelle >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {suggestion.note_actuelle.toFixed(1)}/20
              </span>
            </div>
          )}

          {/* Bouton d'action */}
          <Link
            to={`/exercices/${suggestion.id_exercice}`}
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir l'exercice
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SuggestionCard