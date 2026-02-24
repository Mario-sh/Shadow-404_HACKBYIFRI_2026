import React from 'react'
import { motion } from 'framer-motion'

const progressImages = {
  math: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  language: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
}

const ProgressCard = ({ subject, progress, color = 'blue', imageKey }) => {
  const imageUrl = progressImages[imageKey] || progressImages.default

  const colors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-pink-600',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 p-5 group"
    >
      {/* Image de fond subtile */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-20"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-medium">{subject}</h4>
          <span className="text-white/60 text-sm">{progress}%</span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
          />
        </div>

        <div className="mt-3 flex justify-end">
          <span className="text-xs text-white/40">
            {progress >= 80 ? 'Excellent' : progress >= 60 ? 'Bon' : 'En progression'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default ProgressCard