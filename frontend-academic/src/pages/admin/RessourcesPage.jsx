import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  PhotoIcon,
  MusicalNoteIcon,
  PresentationChartBarIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CloudArrowUpIcon,
  FolderIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RessourcesPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [editingRessource, setEditingRessource] = useState(null)
  const [selectedRessource, setSelectedRessource] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    Type_ressource: 'pdf',
    fichier_url: '',
    matiere_id: '',
    tags: ''
  })

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
        console.log('📚 Ressources reçues:', response.data)

        // Adapter selon le format de réponse
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération ressources:', error)
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
  // 3. MUTATIONS
  // ============================================
  const createRessourceMutation = useMutation({
    mutationFn: (data) => academicService.createRessource(data),
    onSuccess: () => {
      toast.success('Ressource ajoutée avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la création')
      console.error(error)
    }
  })

  const updateRessourceMutation = useMutation({
    mutationFn: ({ id, data }) => academicService.updateRessource(id, data),
    onSuccess: () => {
      toast.success('Ressource modifiée avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification')
      console.error(error)
    }
  })

  const deleteRessourceMutation = useMutation({
    mutationFn: (id) => academicService.deleteRessource(id),
    onSuccess: () => {
      toast.success('Ressource supprimée')
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    }
  })

  // ============================================
  // 4. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const ressources = Array.isArray(ressourcesData) ? ressourcesData : []
  const matieres = Array.isArray(matieresData) ? matieresData : []

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
  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      Type_ressource: 'pdf',
      fichier_url: '',
      matiere_id: '',
      tags: ''
    })
    setEditingRessource(null)
  }

  const handleEdit = (ressource) => {
    setEditingRessource(ressource)
    setFormData({
      titre: ressource.titre,
      description: ressource.description || '',
      Type_ressource: ressource.Type_ressource,
      fichier_url: ressource.fichier_url || '',
      matiere_id: ressource.matiere_id?.toString() || '',
      tags: ressource.tags?.split(',').map(tag => tag.trim()).join(', ') || ''
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSend = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    if (editingRessource) {
      updateRessourceMutation.mutate({ id: editingRessource.id_ressource, data: dataToSend })
    } else {
      createRessourceMutation.mutate(dataToSend)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette ressource ?')) {
      deleteRessourceMutation.mutate(id)
    }
  }

  const handlePreview = (ressource) => {
    setSelectedRessource(ressource)
    setShowPreviewModal(true)
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />
      case 'video':
        return <VideoCameraIcon className="h-6 w-6 text-blue-500" />
      case 'lien':
        return <LinkIcon className="h-6 w-6 text-green-500" />
      case 'image':
        return <PhotoIcon className="h-6 w-6 text-purple-500" />
      case 'audio':
        return <MusicalNoteIcon className="h-6 w-6 text-yellow-500" />
      case 'presentation':
        return <PresentationChartBarIcon className="h-6 w-6 text-orange-500" />
      default:
        return <DocumentTextIcon className="h-6 w-6 text-secondary-500" />
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Ressources pédagogiques</h1>
          <p className="text-secondary-600 mt-1">
            {filteredRessources.length} ressource{filteredRessources.length > 1 ? 's' : ''} disponible{filteredRessources.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Ajouter une ressource
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {['pdf', 'video', 'lien', 'image', 'audio', 'presentation'].map((type) => {
          const count = ressources.filter(r => r.Type_ressource === type).length
          return (
            <div key={type} className="bg-white rounded-xl p-4 shadow-md border border-secondary-100">
              <div className="flex items-center gap-2">
                {getTypeIcon(type)}
                <div>
                  <p className="text-lg font-bold text-secondary-900">{count}</p>
                  <p className="text-xs text-secondary-500">{getTypeLabel(type)}</p>
                </div>
              </div>
            </div>
          )
        })}
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="video">Vidéo</option>
            <option value="lien">Lien</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="presentation">Présentation</option>
          </select>

          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Toutes les matières</option>
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
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-secondary-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des ressources */}
      {filteredRessources.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <FolderIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">Aucune ressource trouvée</p>
          <p className="text-sm text-secondary-400 mt-1">
            Ajoutez votre première ressource en cliquant sur "Ajouter"
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRessources.map((ressource) => (
            <div
              key={ressource.id_ressource}
              className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* En-tête avec couleur selon le type */}
              <div className={`h-24 ${getTypeColor(ressource.Type_ressource).split(' ')[0]} p-4 relative`}>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePreview(ressource)}
                    className="p-2 bg-white rounded-lg hover:bg-secondary-100"
                    title="Aperçu"
                  >
                    <EyeIcon className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleEdit(ressource)}
                    className="p-2 bg-white rounded-lg hover:bg-secondary-100"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(ressource.id_ressource)}
                    className="p-2 bg-white rounded-lg hover:bg-red-100"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {getTypeIcon(ressource.Type_ressource)}
                  <span className={`text-sm font-medium ${getTypeColor(ressource.Type_ressource).split(' ')[1]}`}>
                    {getTypeLabel(ressource.Type_ressource)}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-1">{ressource.titre}</h3>
                <p className="text-sm text-secondary-600 mb-3 line-clamp-2">{ressource.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                    {ressource.matiere_nom}
                  </span>
                  <span className="text-xs text-secondary-500">
                    {ressource.taille || '2.5 MB'}
                  </span>
                </div>

                {ressource.tags && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {ressource.tags?.split(',').map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary-100 text-secondary-600 rounded-full text-xs">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-secondary-100 flex items-center justify-between">
                  <span className="text-xs text-secondary-500">
                    Ajouté le {new Date(ressource.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <a
                    href={ressource.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                  </a>
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
                <tr key={ressource.id_ressource} className="hover:bg-secondary-50">
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
                        onClick={() => handlePreview(ressource)}
                        className="p-2 hover:bg-secondary-100 rounded-lg"
                      >
                        <EyeIcon className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(ressource)}
                        className="p-2 hover:bg-secondary-100 rounded-lg"
                      >
                        <PencilSquareIcon className="h-4 w-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(ressource.id_ressource)}
                        className="p-2 hover:bg-red-100 rounded-lg"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-secondary-900">
                {editingRessource ? 'Modifier' : 'Ajouter'} une ressource
              </h3>
              <button onClick={() => {
                setShowModal(false)
                resetForm()
              }}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.Type_ressource}
                    onChange={(e) => setFormData({...formData, Type_ressource: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                    required
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Vidéo</option>
                    <option value="lien">Lien</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="presentation">Présentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Matière *
                  </label>
                  <select
                    value={formData.matiere_id}
                    onChange={(e) => setFormData({...formData, matiere_id: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {matieres.map(m => (
                      <option key={m.id_matiere} value={m.id_matiere}>{m.nom_matière}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  URL / Fichier
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.fichier_url}
                    onChange={(e) => setFormData({...formData, fichier_url: e.target.value})}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  />
                  <button
                    type="button"
                    className="px-4 py-2.5 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200"
                  >
                    <CloudArrowUpIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  placeholder="Description de la ressource..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="mathématiques, cours, exercices"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createRessourceMutation.isLoading || updateRessourceMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {createRessourceMutation.isLoading || updateRessourceMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    editingRessource ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aperçu */}
      {showPreviewModal && selectedRessource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedRessource.Type_ressource)}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900">{selectedRessource.titre}</h3>
                  <p className="text-sm text-secondary-500">{selectedRessource.matiere_nom}</p>
                </div>
              </div>
              <button onClick={() => setShowPreviewModal(false)}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
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
                  <p className="text-secondary-600">{selectedRessource.description}</p>
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
              <div className="mt-6">
                <h4 className="font-semibold text-secondary-900 mb-2">Description</h4>
                <p className="text-secondary-600">{selectedRessource.description}</p>
              </div>

              {/* Tags */}
              {selectedRessource.tags && (
                <div className="mt-4">
                  <h4 className="font-semibold text-secondary-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRessource.tags?.split(',').map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm">
                        #{tag.trim()}
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
                  <p className="font-medium text-secondary-900">{selectedRessource.taille || '2.5 MB'}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-lg hover:bg-secondary-50"
                >
                  Fermer
                </button>
                <a
                  href={selectedRessource.fichier_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RessourcesPage