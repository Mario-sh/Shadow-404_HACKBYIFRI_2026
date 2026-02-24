import React, { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import { searchService } from '../../services/search'
import { AcademicCapIcon, UserIcon, BookOpenIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    etudiants: [],
    exercices: [],
    notes: [],
    ressources: []
  })
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fermer la recherche au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ouvrir la recherche avec Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Effectuer la recherche
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults({ etudiants: [], exercices: [], notes: [], ressources: [] })
        return
      }

      setLoading(true)
      try {
        const data = await searchService.globalSearch(debouncedQuery)
        setResults(data)
      } catch (error) {
        console.error('Erreur recherche:', error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const getIcon = (type) => {
    switch(type) {
      case 'etudiants': return <UserIcon className="h-4 w-4 text-blue-500" />
      case 'exercices': return <BookOpenIcon className="h-4 w-4 text-green-500" />
      case 'notes': return <DocumentTextIcon className="h-4 w-4 text-yellow-500" />
      case 'ressources': return <AcademicCapIcon className="h-4 w-4 text-purple-500" />
      default: return null
    }
  }

  const getResultCount = () => {
    return Object.values(results).reduce((acc, curr) => acc + curr.length, 0)
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Bouton de recherche */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors text-secondary-600"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
        <span className="hidden md:inline">Rechercher...</span>
        <span className="text-xs bg-secondary-200 px-2 py-1 rounded-md hidden lg:inline">Ctrl+K</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
      )}

      {/* Panneau de recherche */}
      {isOpen && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-secondary-200 z-50 animate-slide-down">
          {/* Input */}
          <div className="flex items-center border-b border-secondary-200 p-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher des étudiants, exercices, notes..."
              className="flex-1 outline-none text-secondary-900 placeholder-secondary-400"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-secondary-400 hover:text-secondary-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-3 px-3 py-1 bg-secondary-100 rounded-lg text-sm text-secondary-600 hover:bg-secondary-200"
            >
              Échap
            </button>
          </div>

          {/* Résultats */}
          <div className="max-h-96 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-600 border-t-transparent"></div>
              </div>
            ) : debouncedQuery.length < 2 ? (
              <div className="text-center py-8 text-secondary-500">
                Tapez au moins 2 caractères pour commencer la recherche
              </div>
            ) : getResultCount() === 0 ? (
              <div className="text-center py-8 text-secondary-500">
                Aucun résultat trouvé pour "{debouncedQuery}"
              </div>
            ) : (
              <div className="space-y-4">
                {/* Étudiants */}
                {results.etudiants?.length > 0 && (
                  <Section title="Étudiants" icon={getIcon('etudiants')}>
                    {results.etudiants.map((item) => (
                      <ResultItem
                        key={`etudiant-${item.id}`}
                        to={`/etudiants/${item.id}`}
                        icon={getIcon('etudiants')}
                        title={`${item.prenom} ${item.nom}`}
                        subtitle={`${item.classe} • ${item.matricule}`}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </Section>
                )}

                {/* Exercices */}
                {results.exercices?.length > 0 && (
                  <Section title="Exercices" icon={getIcon('exercices')}>
                    {results.exercices.map((item) => (
                      <ResultItem
                        key={`exercice-${item.id}`}
                        to={`/exercices/${item.id}`}
                        icon={getIcon('exercices')}
                        title={item.titre}
                        subtitle={`${item.matiere} • ${item.difficulte}`}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </Section>
                )}

                {/* Notes */}
                {results.notes?.length > 0 && (
                  <Section title="Notes" icon={getIcon('notes')}>
                    {results.notes.map((item) => (
                      <ResultItem
                        key={`note-${item.id}`}
                        to={`/notes/${item.id}`}
                        icon={getIcon('notes')}
                        title={`${item.matiere} - ${item.valeur}/20`}
                        subtitle={`${item.etudiant} • ${new Date(item.date).toLocaleDateString('fr-FR')}`}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </Section>
                )}

                {/* Ressources */}
                {results.ressources?.length > 0 && (
                  <Section title="Ressources" icon={getIcon('ressources')}>
                    {results.ressources.map((item) => (
                      <ResultItem
                        key={`ressource-${item.id}`}
                        to={`/ressources/${item.id}`}
                        icon={getIcon('ressources')}
                        title={item.titre}
                        subtitle={`${item.matiere} • ${item.type}`}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </Section>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-secondary-200 p-4 bg-secondary-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-secondary-500">
              <div className="flex items-center gap-4">
                <span><kbd className="bg-white px-2 py-1 rounded border border-secondary-300">↑</kbd> <kbd className="bg-white px-2 py-1 rounded border border-secondary-300">↓</kbd> pour naviguer</span>
                <span><kbd className="bg-white px-2 py-1 rounded border border-secondary-300">↵</kbd> pour sélectionner</span>
              </div>
              <span>{getResultCount()} résultats</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sous-composant Section
const Section = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
)

// Sous-composant ResultItem
const ResultItem = ({ to, icon, title, subtitle, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 p-2 hover:bg-secondary-50 rounded-lg transition-colors"
  >
    <div className="flex-shrink-0 w-6">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-secondary-900 truncate">{title}</p>
      <p className="text-xs text-secondary-500 truncate">{subtitle}</p>
    </div>
  </Link>
)

export default SearchBar