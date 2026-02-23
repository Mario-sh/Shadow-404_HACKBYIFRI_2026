import React from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
  const colors = {
    primary: {
      gradient: 'from-primary-50 to-primary-100',
      icon: 'bg-gradient-to-br from-primary-500 to-primary-600',
      text: 'text-primary-700',
      border: 'border-primary-200'
    },
    blue: {
      gradient: 'from-blue-50 to-blue-100',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    green: {
      gradient: 'from-green-50 to-green-100',
      icon: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    yellow: {
      gradient: 'from-yellow-50 to-yellow-100',
      icon: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    purple: {
      gradient: 'from-purple-50 to-purple-100',
      icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    red: {
      gradient: 'from-red-50 to-red-100',
      icon: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-700',
      border: 'border-red-200'
    },
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color].gradient} rounded-2xl shadow-lg p-6 border ${colors[color].border} hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-secondary-500 mt-1">{subtitle}</p>
          )}

          {trend && (
            <div className="mt-3 flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : trend === 'down' ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-secondary-600'
              }`}>
                {trend === 'up' ? '+2.5' : trend === 'down' ? '-1.2' : '0'}%
              </span>
              <span className="text-xs text-secondary-500 ml-1">vs mois dernier</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`${colors[color].icon} p-3 rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard