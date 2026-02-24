import React from 'react'
import { motion } from 'framer-motion'

const achievements = {
  streak3: { icon: '🔥', name: 'Série de 3 jours', color: 'from-orange-400 to-red-400' },
  streak7: { icon: '⚡', name: 'Série de 7 jours', color: 'from-yellow-400 to-orange-400' },
  streak30: { icon: '🌟', name: 'Série de 30 jours', color: 'from-purple-400 to-pink-400' },
  firstNote: { icon: '📝', name: 'Première note', color: 'from-blue-400 to-cyan-400' },
  perfectScore: { icon: '💯', name: 'Note parfaite', color: 'from-green-400 to-emerald-400' },
  helper: { icon: '🤝', name: 'Aide précieuse', color: 'from-indigo-400 to-purple-400' },
  expert: { icon: '🎓', name: 'Expert', color: 'from-amber-400 to-orange-400' },
}

const AchievementBadge = ({ type, earned = true, size = 'md' }) => {
  const achievement = achievements[type] || { icon: '🎯', name: 'Objectif', color: 'from-secondary-400 to-secondary-500' }

  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  }

  if (!earned) {
    return (
      <div className="relative group">
        <div className={`${sizes[size]} rounded-2xl bg-secondary-100 border-2 border-dashed border-secondary-300 flex items-center justify-center text-secondary-400 filter grayscale opacity-50`}>
          <span className="text-2xl">❓</span>
        </div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {achievement.name} (à débloquer)
        </div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer"
    >
      <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-white shadow-lg`}>
        <span className="text-2xl">{achievement.icon}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        {achievement.name}
      </div>

      {/* Sparkle effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
      </motion.div>
    </motion.div>
  )
}

export default AchievementBadge