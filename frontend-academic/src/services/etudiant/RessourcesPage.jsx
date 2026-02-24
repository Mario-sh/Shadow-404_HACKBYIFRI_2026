// src/pages/etudiant/RessourcesPage.jsx
import React, { useState, useEffect } from 'react'
import { ressourcesService } from '../../services/ressources'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const RessourcesPage = () => {
  const [ressources, setRessources] = useState([])
  const [filteredRessources, setFilteredRessources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const [matieres, setMatieres] = useState([])
  const [types, setTypes] = useState([])

  useEffect(() => {
    fetchRessources()
  }, [])

  const fetchRessources = async () => {
    setLoading(true)
    try {
      const data = await ressourcesService.getRessources()
      setRessources(data)
      setFilteredRessources(data)

      // Extraire les types uniques
      const uniqueTypes = [...new Set(data.map(r => r.type))].filter(Boolean)
      setTypes(uniqueTypes)

      // Extraire les matières uniques
      const uniqueMatieres = [...new Set(data.map(r => r.matiere?.nom))].filter(Boolean)
      setMatieres(uniqueMatieres)
    } catch (error) {
      console.error('Erreur chargement ressources:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les ressources
  useEffect(() => {
    let filtered = ressources

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType) {
      filtered = filtered.filter(r => r.type === selectedType)
    }

    if (selectedMatiere) {
      filtered = filtered.filter(r => r.matiere?.nom === selectedMatiere)
    }

    setFilteredRessources(filtered)
  }, [searchTerm, selectedType, selectedMatiere, ressources])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />
      case 'video':
        return <VideoCameraIcon className="h-6 w-6 text-blue-500" />
      case 'image':
        return <PhotoIcon className="h-6 w-6 text-green-500" />
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return 'bg-red-100 dark:bg-red-900/30'
      case 'video':
        return 'bg-blue-100 dark:bg-blue-900/30'
      case 'image':
        return 'bg-green-100 dark:bg-green-900/30'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (ressource) => {
    try {
      const blob = await ressourcesService.downloadRessource(ressource.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = ressource.fichier_nom || ressource.titre
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ressources pédagogiques
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Accédez à tous vos cours, documents et supports
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total ressources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ressources.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Matières</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{matieres.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nouvelles cette semaine</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ressources.filter(r => {
                  const date = new Date(r.date_ajout)
                  const now = new Date()
                  const diff = now - date
                  return diff < 7 * 24 * 60 * 60 * 1000
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une ressource..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            >
              <option value="">Tous types</option>
              {types.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all"
            >
              <option value="">Toutes matières</option>
              {matieres.map((matiere, index) => (
                <option key={index} value={matiere}>{matiere}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grille des ressources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRessources.length > 0 ? (
          filteredRessources.map((ressource) => (
            <div
              key={ressource.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              {/* En-tête avec type */}
              <div className={`p-4 ${getTypeColor(ressource.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(ressource.type)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {ressource.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ressource.matiere?.nom}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {ressource.titre}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {ressource.description}
                </p>

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-500">
                      {new Date(ressource.date_ajout).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {ressource.taille && (
                    <span className="text-gray-500 dark:text-gray-500">
                      {formatFileSize(ressource.taille)}
                    </span>
                  )}
                </div>

                {/* Bouton téléchargement */}
                <button
                  onClick={() => handleDownload(ressource)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Télécharger
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune ressource trouvée
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RessourcesPage