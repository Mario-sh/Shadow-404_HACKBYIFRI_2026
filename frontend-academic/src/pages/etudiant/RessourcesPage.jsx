// src/pages/etudiant/RessourcesPage.jsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  PhotoIcon,
  MusicalNoteIcon,
  PresentationChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  FolderIcon,
  DocumentArrowDownIcon,
  BookOpenIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RessourcesPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedRessource, setSelectedRessource] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  // ============================================
  // 1. RÉCUPÉRER LES RESSOURCES
  // ============================================
  const { data: ressourcesData, isLoading, refetch } = useQuery({
    queryKey: ['ressources', selectedType, selectedMatiere, searchTerm],
    queryFn: async () => {
      try {
        const params = {}
        if (selectedType !== 'all') params.type = selectedType
        if (selectedMatiere !== 'all') params.matiere = selectedMatiere
        if (searchTerm) params.search = searchTerm

        const response = await academicService.getRessources(params)
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération ressources:', error)
        toast.error('Erreur lors du chargement des ressources')
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. RÉCUPÉRER LES MATIÈRES
  // ============================================
  const { data: matieresData } = useQuery({
    queryKey: ['matieres'],
    queryFn: async () => {
      try {
        const response = await academicService.getMatieres()
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération matières:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 3. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const ressources = Array.isArray(ressourcesData) ? ressourcesData : []
  const matieres = Array.isArray(matieresData) ? matieresData : []

  // ============================================
  // 4. STATISTIQUES
  // ============================================
  const stats = {
    total: ressources.length,
    parType: {
      pdf: ressources.filter(r => r.Type_ressource === 'pdf').length,
      video: ressources.filter(r => r.Type_ressource === 'video').length,
      lien: ressources.filter(r => r.Type_ressource === 'lien').length,
      image: ressources.filter(r => r.Type_ressource === 'image').length,
      audio: ressources.filter(r => r.Type_ressource === 'audio').length,
      presentation: ressources.filter(r => r.Type_ressource === 'presentation').length,
    },
    recents: ressources.filter(r => {
      const date = new Date(r.created_at)
      const now = new Date()
      const diff = now - date
      return diff < 7 * 24 * 60 * 60 * 1000 // 7 jours
    }).length
  }

  // ============================================
  // 5. FILTRES
  // ============================================
  const filteredRessources = ressources.filter(res => {
    if (selectedType !== 'all' && res.Type_ressource !== selectedType) return false
    if (selectedMatiere !== 'all' && res.matiere_id !== parseInt(selectedMatiere)) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return res.titre?.toLowerCase().includes(searchLower) ||
             res.description?.toLowerCase().includes(searchLower) ||
             res.tags?.toLowerCase().includes(searchLower)
    }
    return true
  })

  // ============================================
  // 6. FONCTIONS UTILITAIRES
  // ============================================
  const handlePreview = (ressource) => {
    setSelectedRessource(ressource)
    setShowPreviewModal(true)
  }

  const handleDownload = async (ressource) => {
    try {
      if (ressource.Type_ressource === 'lien') {
        window.open(ressource.fichier_url, '_blank')
      } else {
        // Télécharger le fichier
        const link = document.createElement('a')
        link.href = ressource.fichier_url
        link.setAttribute('download', '')
        document.body.appendChild(link)
        link.click()
        link.remove()
        toast.success('Téléchargement démarré')
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-red-500" />
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-blue-500" />
      case 'lien':
        return <LinkIcon className="h-5 w-5 text-green-500" />
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-purple-500" />
      case 'audio':
        return <MusicalNoteIcon className="h-5 w-5 text-yellow-500" />
      case 'presentation':
        return <PresentationChartBarIcon className="h-5 w-5 text-orange-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-secondary-500" />
    }
  }

  const getTypeColor = (type) => {
    switch(type) {
      case 'pdf': return 'bg-red-100 text-red-700 border-red-200'
      case 'video': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'lien': return 'bg-green-100 text-green-700 border-green-200'
      case 'image': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'audio': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'presentation': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-secondary-100 text-secondary-700 border-secondary-200'
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      pdf: 'PDF',
      video: 'Vidéo',
      lien: 'Lien',
      image: 'Image',
      audio: 'Audio',
      presentation: 'Présentation'
    }
    return labels[type] || type
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '2.5 MB'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
            Ressources pédagogiques
          </h1>
          <p className="text-secondary-600 mt-1">
            Accédez à tous vos cours, exercices et documents
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
          title="Rafraîchir"
        >
          <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.total}</p>
              <p className="text-xs text-secondary-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.parType.pdf}</p>
              <p className="text-xs text-secondary-500">PDF</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.parType.video}</p>
              <p className="text-xs text-secondary-500">Vidéos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.parType.lien}</p>
              <p className="text-xs text-secondary-500">Liens</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.parType.image}</p>
              <p className="text-xs text-secondary-500">Images</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.recents}</p>
              <p className="text-xs text-secondary-500">Nouveautés</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{matieres.length}</p>
              <p className="text-xs text-secondary-500">Matières</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, description ou tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="all">Tous les types</option>
            <option value="pdf">📄 PDF</option>
            <option value="video">🎥 Vidéo</option>
            <option value="lien">🔗 Lien</option>
            <option value="image">🖼️ Image</option>
            <option value="audio">🎵 Audio</option>
            <option value="presentation">📊 Présentation</option>
          </select>

          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
          >
            <option value="all">📚 Toutes les matières</option>
            {matieres.map(m => (
              <option key={m.id_matiere} value={m.id_matiere}>{m.nom_matière}</option>
            ))}
          </select>
        </div>

        {/* Vue toggle */}
        <div className="flex justify-end mt-4">
          <div className="bg-secondary-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Liste des ressources */}
      {filteredRessources.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <FolderIcon className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-600 text-lg">Aucune ressource trouvée</p>
          <p className="text-secondary-400 mt-2">
            Essayez de modifier vos filtres ou revenez plus tard
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRessources.map((ressource) => (
            <div
              key={ressource.id_ressource}
              className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => handlePreview(ressource)}
            >
              {/* En-tête avec couleur selon le type */}
              <div className={`h-20 ${getTypeColor(ressource.Type_ressource).split(' ')[0]} p-3 flex items-center gap-3`}>
                {getTypeIcon(ressource.Type_ressource)}
                <span className={`text-sm font-medium ${getTypeColor(ressource.Type_ressource).split(' ')[1]}`}>
                  {getTypeLabel(ressource.Type_ressource)}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-1">
                  {ressource.titre}
                </h3>

                <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                  {ressource.description || 'Aucune description'}
                </p>

                {/* Tags */}
                {ressource.tags && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {ressource.tags?.split(',').slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary-100 text-secondary-600 rounded-full text-xs flex items-center gap-1">
                        <TagIcon className="h-3 w-3" />
                        {tag.trim()}
                      </span>
                    ))}
                    {ressource.tags?.split(',').length > 3 && (
                      <span className="px-2 py-0.5 bg-secondary-100 text-secondary-600 rounded-full text-xs">
                        +{ressource.tags.split(',').length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm pt-3 border-t border-secondary-100">
                  <span className="text-xs text-secondary-500">
                    {new Date(ressource.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-xs font-medium text-primary-600">
                    {ressource.matiere_nom}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Ressource</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Matière</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredRessources.map((ressource) => (
                <tr key={ressource.id_ressource} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(ressource.Type_ressource)}
                      <div>
                        <p className="font-medium text-secondary-900">{ressource.titre}</p>
                        <p className="text-xs text-secondary-500 line-clamp-1">{ressource.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(ressource.Type_ressource)}`}>
                      {getTypeLabel(ressource.Type_ressource)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary-600">{ressource.matiere_nom}</span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(ressource.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreview(ressource)
                        }}
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Aperçu"
                      >
                        <EyeIcon className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(ressource)
                        }}
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 text-green-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Aperçu */}
      {showPreviewModal && selectedRessource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedRessource.Type_ressource)}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900">{selectedRessource.titre}</h3>
                  <p className="text-sm text-secondary-500">{selectedRessource.matiere_nom}</p>
                </div>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="hover:bg-secondary-100 p-1 rounded-lg">
                <svg className="h-6 w-6 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Aperçu selon le type */}
              {selectedRessource.Type_ressource === 'video' && (
                <div className="aspect-video bg-secondary-900 rounded-xl flex items-center justify-center">
                  <VideoCameraIcon className="h-16 w-16 text-secondary-600" />
                  <p className="text-white ml-4">Aperçu vidéo</p>
                </div>
              )}

              {selectedRessource.Type_ressource === 'image' && (
                <div className="aspect-video bg-secondary-100 rounded-xl flex items-center justify-center">
                  <PhotoIcon className="h-16 w-16 text-secondary-400" />
                  <p className="text-secondary-500 ml-4">Aperçu image</p>
                </div>
              )}

              {selectedRessource.Type_ressource === 'pdf' && (
                <div className="h-96 bg-secondary-50 rounded-xl p-4 overflow-y-auto">
                  <DocumentTextIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600 whitespace-pre-line">{selectedRessource.description}</p>
                </div>
              )}

              {selectedRessource.Type_ressource === 'lien' && (
                <div className="bg-secondary-50 rounded-xl p-6">
                  <LinkIcon className="h-8 w-8 text-primary-600 mb-4" />
                  <a
                    href={selectedRessource.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 break-all"
                  >
                    {selectedRessource.fichier_url}
                  </a>
                </div>
              )}

              {/* Description */}
              {selectedRessource.description && (
                <div className="mt-6">
                  <h4 className="font-semibold text-secondary-900 mb-2">Description</h4>
                  <p className="text-secondary-600 bg-secondary-50 p-4 rounded-xl">
                    {selectedRessource.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedRessource.tags && (
                <div className="mt-4">
                  <h4 className="font-semibold text-secondary-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRessource.tags?.split(',').map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm flex items-center gap-1">
                        <TagIcon className="h-3 w-3" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Métadonnées */}
              <div className="mt-6 pt-4 border-t border-secondary-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-500">Type</span>
                  <p className="font-medium text-secondary-900">{getTypeLabel(selectedRessource.Type_ressource)}</p>
                </div>
                <div>
                  <span className="text-secondary-500">Matière</span>
                  <p className="font-medium text-secondary-900">{selectedRessource.matiere_nom}</p>
                </div>
                <div>
                  <span className="text-secondary-500">Ajouté le</span>
                  <p className="font-medium text-secondary-900">
                    {new Date(selectedRessource.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <span className="text-secondary-500">Taille</span>
                  <p className="font-medium text-secondary-900">{formatFileSize(selectedRessource.taille)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleDownload(selectedRessource)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RessourcesPage