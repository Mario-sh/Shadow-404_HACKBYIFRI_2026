import React from 'react'
import { motion } from 'framer-motion'

const statsImages = {
  students: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  grades: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  exercises: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  resources: 'https://images.unsplash.com/photo-1503676260728-517c890e9a3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  calendar: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  messages: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
}

const StatsWithImage = ({ title, value, subtitle, icon, imageKey, trend }) => {
  const imageUrl = statsImages[imageKey] || statsImages.students

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative overflow-hidden rounded-2xl h-48 cursor-pointer group"
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/80">{title}</span>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
          </div>

          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trend === 'up' ? '+12%' : '-5%'}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default StatsWithImage