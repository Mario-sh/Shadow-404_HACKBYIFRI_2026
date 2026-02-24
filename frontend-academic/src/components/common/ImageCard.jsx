import React from 'react'
import { motion } from 'framer-motion'

const ImageCard = ({
  children,
  imageUrl,
  overlay = true,
  overlayOpacity = '60',
  blur = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      {...props}
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Overlay */}
      {overlay && (
        <div className={`absolute inset-0 bg-black/${overlayOpacity} backdrop-blur-${blur ? 'sm' : 'none'}`} />
      )}

      {/* Contenu */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  )
}

export default ImageCard