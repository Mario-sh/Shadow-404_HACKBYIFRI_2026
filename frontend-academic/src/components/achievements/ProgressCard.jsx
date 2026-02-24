// src/components/dashboard/ProgressCard.jsx
import React from 'react'
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

const ProgressCard = ({ title, value, total, percentage, color = 'blue', icon: Icon, trend }) => {
  const progressPercentage = percentage || (total ? Math.round((value / total) * 100) : 0)

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      progress: 'bg-blue-600 dark:bg-blue-500',
      light: 'bg-blue-50 dark:bg-blue-900/20'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      progress: 'bg-green-600 dark:bg-green-500',
      light: 'bg-green-50 dark:bg-green-900/20'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      progress: 'bg-purple-600 dark:bg-purple-500',
      light: 'bg-purple-50 dark:bg-purple-900/20'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      progress: 'bg-orange-600 dark:bg-orange-500',
      light: 'bg-orange-50 dark:bg-orange-900/20'
    }
  }

  const selectedColor = colorClasses[color] || colorClasses.blue

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${selectedColor.bg} rounded-xl`}>
          {Icon ? (
            <Icon className={`h-6 w-6 ${selectedColor.text}`} />
          ) : (
            <ChartBarIcon className={`h-6 w-6 ${selectedColor.text}`} />
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <ArrowTrendingUpIcon className={`h-4 w-4 ${
              trend > 0 ? 'text-green-500' : 'text-red-500'
            }`} />
            <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {total && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / {total}
          </span>
        )}
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progression</span>
          <span className={`font-medium ${selectedColor.text}`}>
            {progressPercentage}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${selectedColor.progress} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Objectif quotidien */}
      <div className={`mt-4 p-3 ${selectedColor.light} rounded-xl`}>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Objectif quotidien
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
          {Math.round(value / 30)}/jour
        </p>
      </div>
    </div>
  )
}

export default ProgressCard