import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { SparklesIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'

const WelcomeHeader = () => {
  const { user } = useAuth()
  const [greeting, setGreeting] = React.useState('')
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [weather, setWeather] = React.useState({ temp: 22, condition: 'Ensoleillé' })

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bonjour')
    else if (hour < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeEmoji = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return '🌙'
    if (hour < 12) return '☀️'
    if (hour < 18) return '⛅'
    return '🌆'
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-8 text-white shadow-2xl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary-100">
              <SparklesIcon className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Academic Twins</span>
            </div>

            <h1 className="text-4xl font-bold">
              {greeting}, {user?.prenom || user?.username || 'Cher utilisateur'}!
            </h1>

            <p className="text-xl text-primary-100 flex items-center gap-2">
              <span>{getTimeEmoji()}</span>
              {currentTime.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
              <span className="text-sm opacity-75">• {weather.temp}°C {weather.condition}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-primary-100">Semaine {Math.ceil(new Date().getDate() / 7)}</p>
              <p className="text-2xl font-bold">
                {currentTime.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/20 transition-all card-hover">
            <p className="text-sm text-primary-100">Progression</p>
            <p className="text-2xl font-bold">78%</p>
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/20 transition-all card-hover">
            <p className="text-sm text-primary-100">Objectif du jour</p>
            <p className="text-2xl font-bold">3/5</p>
            <p className="text-xs text-primary-100 mt-1">Exercices restants</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/20 transition-all card-hover">
            <p className="text-sm text-primary-100">Série en cours</p>
            <p className="text-2xl font-bold">7 jours 🔥</p>
            <p className="text-xs text-primary-100 mt-1">Record personnel!</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/20 transition-all card-hover">
            <p className="text-sm text-primary-100">Prochain cours</p>
            <p className="text-2xl font-bold">14:30</p>
            <p className="text-xs text-primary-100 mt-1">Mathématiques</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeHeader