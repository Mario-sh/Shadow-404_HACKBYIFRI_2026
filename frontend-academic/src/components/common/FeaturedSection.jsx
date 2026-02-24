import React from 'react'
import { motion } from 'framer-motion'

const featuredImages = {
  learning: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  success: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  collaboration: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  future: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
}

const FeaturedSection = ({
  title,
  description,
  imageKey = 'learning',
  actionText = 'En savoir plus',
  onAction,
  reversed = false
}) => {
  const imageUrl = featuredImages[imageKey]

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-sm border border-white/10 ${
      reversed ? 'flex-row-reverse' : ''
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
        {/* Partie image */}
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />
        </div>

        {/* Partie contenu */}
        <div className="relative flex items-center p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-3xl font-bold text-white">{title}</h3>
            <p className="text-white/70 text-lg leading-relaxed">{description}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md border border-white/30 transition-all inline-flex items-center gap-2"
            >
              <span>{actionText}</span>
              <span>→</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedSection