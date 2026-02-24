import React, { useState, useEffect } from 'react'
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const quotes = [
  {
    text: "L'éducation est l'arme la plus puissante pour changer le monde.",
    author: "Nelson Mandela",
    category: "inspiration"
  },
  {
    text: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.",
    author: "Herman Cain",
    category: "motivation"
  },
  {
    text: "Apprendre, c'est découvrir que quelque chose est possible.",
    author: "Fritz Perls",
    category: "apprentissage"
  },
  {
    text: "Le savoir est le seul bien qui s'accroît quand on le partage.",
    author: "Socrate",
    category: "sagesse"
  },
  {
    text: "N'ayez pas peur de progresser lentement, ayez peur de stagner.",
    author: "Proverbe chinois",
    category: "persévérance"
  },
  {
    text: "Le secret pour avancer est de commencer.",
    author: "Mark Twain",
    category: "action"
  },
  {
    text: "L'échec est le fondement de la réussite.",
    author: "Lao Tseu",
    category: "résilience"
  },
  {
    text: "Plus on apprend, plus on se rend compte de tout ce qu'on ignore.",
    author: "Socrate",
    category: "humilité"
  }
]

const DailyQuote = () => {
  const [quote, setQuote] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }

  useEffect(() => {
    // Changer la citation chaque jour (basé sur la date)
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    setQuote(quotes[dayOfYear % quotes.length])
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    getRandomQuote()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (!quote) return null

  const getCategoryColor = (category) => {
    const colors = {
      inspiration: 'from-purple-400 to-pink-400',
      motivation: 'from-orange-400 to-red-400',
      apprentissage: 'from-blue-400 to-cyan-400',
      sagesse: 'from-green-400 to-emerald-400',
      persévérance: 'from-yellow-400 to-amber-400',
      action: 'from-indigo-400 to-purple-400',
      résilience: 'from-red-400 to-pink-400',
      humilité: 'from-secondary-400 to-secondary-500',
    }
    return colors[quote.category] || 'from-primary-400 to-secondary-400'
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getCategoryColor(quote.category)} p-6 text-white shadow-xl`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium opacity-90">Citation du jour</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-xl italic font-light mb-3">"{quote.text}"</p>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium opacity-90">— {quote.author}</p>
          <span className="text-xs px-2 py-1 bg-white/20 rounded-full capitalize">
            {quote.category}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DailyQuote