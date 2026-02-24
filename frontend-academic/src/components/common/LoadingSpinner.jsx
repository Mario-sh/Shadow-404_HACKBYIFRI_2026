import React from 'react'

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  const spinner = (
    <div className="relative">
      <div className={`animate-spin rounded-full ${sizes[size]} border-4 border-primary-200 border-t-primary-600`}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-primary-600 font-medium">Chargement...</span>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {spinner}
    </div>
  )
}

export default LoadingSpinner