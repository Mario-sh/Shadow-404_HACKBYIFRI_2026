import React from 'react'
import { motion } from 'framer-motion'

const activityImages = {
  note: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  exercise: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  message: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  event: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1503676260728-517c890e9a3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
}

const ActivityCard = ({
  title,
  description,
  time,
  type = 'default',
  icon,
  onClick
}) => {
  const imageUrl = activityImages[type] || activityImages.default

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 cursor-pointer group h-32"
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-30"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Contenu */}
      <div className="relative z-10 h-full flex items-center p-4">
        {icon && (
          <div className="mr-4 text-2xl text-white/80">
            {icon}
          </div>
        )}

        <div className="flex-1">
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-white/60 text-sm line-clamp-1">{description}</p>
          <p className="text-white/40 text-xs mt-1">{time}</p>
        </div>

        <div className="text-white/40 group-hover:text-white/60 transition-colors">
          →
        </div>
      </div>
    </motion.div>
  )
}

export default ActivityCard