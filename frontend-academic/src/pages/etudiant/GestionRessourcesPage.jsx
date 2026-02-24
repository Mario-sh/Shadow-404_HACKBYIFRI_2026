// src/pages/professeur/GestionRessourcesPage.jsx
import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TagIcon,
  ClockIcon,
  BookOpenIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const GestionRessourcesPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [editingRessource, setEditingRessource] = useState(null)
  const [selectedRessource, setSelectedRessource] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    Type_ressource: 'pdf',
    fichier_url: '',
    matiere_id: '',
    tags: '',
    est_public: true
  })

  // ============================================
  // 1. RÉCUPÉRER LES RESSOURCES
  // ============================================
  const { data: ressourcesData, isLoading, refetch } = useQuery({
    queryKey: ['ressources', 'gestion', selectedType, selectedMatiere, searchTerm],
    queryFn: async () => {
      try {
        const params = {
          all: true // Pour avoir toutes les ressources (y compris celles des autres profs si admin)
        }
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
  // 3. MUTATIONS
  // ============================================
  const createRessourceMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedFile) {
        // Upload de fichier
        const formData = new FormData()
        Object.keys(data).forEach(key => {
          if (key === 'tags' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]))
          } else {
            formData.append(key, data[key])
          }
        })
        formData.append('fichier', selectedFile)

        return academicService.uploadRessource(formData, (progress) => {
          setUploadProgress(progress)
        })
      } else {
        // Lien simple
        return academicService.createRessource(data)
      }
    },
    onSuccess: () => {
      toast.success('Ressource ajoutée avec succès')
      queryClient.invalidateQueries(['ressources'])
      setShowModal(false)
      resetForm()
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
      queryClient.invalidateQueries(['ressources'])
      setShowModal(false)
      resetForm()
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
      queryClient.invalidateQueries(['ressources'])
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
  // 5. STATISTIQUES
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
    mesRessources: ressources.filter(r => r.created_by === user?.id).length,
    publiques: ressources.filter(r => r.est_public).length
  }

  // ============================================
  // 6. FILTRES
  // ============================================
  const filteredRessources = ressources.filter(res => {
    if (selectedType !== 'all' && res.Type_ressource !== selectedType) return false
    if (selectedMatiere !== 'all' && res.matiere_id !== parseInt(selectedMatiere)) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return res.titre?.toLowerCase().includes(searchLower) ||
             res.description?.toLowerCase().includes(searchLower) ||
             res.tags?.toLowerCase().includes(searchLower) ||
             res.created_by_username?.toLowerCase().includes(searchLower)
    }
    return true
  })

  // ============================================
  // 7. FONCTIONS UTILITAIRES
  // ============================================
  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      Type_ressource: 'pdf',
      fichier_url: '',
      matiere_id: '',
      tags: '',
      est_public: true
    })
    setEditingRessource(null)
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const handleEdit = (ressource) => {
    setEditingRessource(ressource)
    setFormData({
      titre: ressource.titre,
      description: ressource.description || '',
      Type_ressource: ressource.Type_ressource,
      fichier_url: ressource.fichier_url || '',
      matiere_id: ressource.matiere_id?.toString() || '',
      tags: ressource.tags?.split(',').map(tag => tag.trim()).join(', ') || '',
      est_public: ressource.est_public
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)

    const dataToSend = {
      ...formData,
      tags: tagsArray
    }

    if (editingRessource) {
      updateRessourceMutation.mutate({
        id: editingRessource.id_ressource,
        data: dataToSend
      })
    } else {
      createRessourceMutation.mutate(dataToSend)
    }
  }

  const handleDelete = (id, titre) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la ressource "${titre}" ?`)) {
      deleteRessourceMutation.mutate(id)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)

      // Déterminer automatiquement le type
      const extension = file.name.split('.').pop().toLowerCase()
      if (['pdf'].includes(extension)) {
        setFormData(prev => ({ ...prev, Type_ressource: 'pdf' }))
      } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
        setFormData(prev => ({ ...prev, Type_ressource: 'video' }))
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        setFormData(prev => ({ ...prev, Type_ressource: 'image' }))
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        setFormData(prev => ({ ...prev, Type_ressource: 'audio' }))
      } else if (['ppt', 'pptx'].includes(extension)) {
        setFormData(prev => ({ ...prev, Type_ressource: 'presentation' }))
      }
    }
  }

  const handlePreview = (ressource) => {
    setSelectedRessource(ressource)
    setShowPreviewModal(true)
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
            Gestion des ressources
          </h1>
          <p className="text-secondary-600 mt-1">
            Gérez toutes les ressources pédagogiques
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
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
            <UsersIcon className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.mesRessources}</p>
              <p className="text-xs text-secondary-500">Mes ress.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xl font-bold text-secondary-900">{stats.publiques}</p>
              <p className="text-xs text-secondary-500">Publiques</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-orange-500" />
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
              placeholder="Rechercher par titre, description, tags ou auteur..."
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
            {searchTerm || selectedType !== 'all' || selectedMatiere !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par ajouter votre première ressource'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRessources.map((ressource) => (
            <div
              key={ressource.id_ressource}
              className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* En-tête avec couleur selon le type */}
              <div className={`h-20 ${getTypeColor(ressource.Type_ressource).split(' ')[0]} p-3 relative`}>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePreview(ressource)}
                    className="p-1.5 bg-white rounded-lg hover:bg-secondary-100"
                    title="Aperçu"
                  >
                    <EyeIcon className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleEdit(ressource)}
                    className="p-1.5 bg-white rounded-lg hover:bg-secondary-100"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(ressource.id_ressource, ressource.titre)}
                    className="p-1.5 bg-white rounded-lg hover:bg-red-100"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeIcon(ressource.Type_ressource)}
                  <span className={`text-sm font-medium ${getTypeColor(ressource.Type_ressource).split(' ')[1]}`}>
                    {getTypeLabel(ressource.Type_ressource)}
                  </span>
                </div>
                {ressource.est_public ? (
                  <CheckCircleIconSolid className="absolute bottom-2 right-2 h-4 w-4 text-green-500" title="Publique" />
                ) : (
                  <ExclamationCircleIcon className="absolute bottom-2 right-2 h-4 w-4 text-yellow-500" title="Privée" />
                )}
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
                  <div className="flex items-center gap-1 text-xs text-secondary-500">
                    <UsersIcon className="h-3 w-3" />
                    {ressource.created_by_username || 'Anonyme'}
                  </div>
                  <span className="text-xs font-medium text-primary-600">
                    {ressource.matiere_nom}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-secondary-400">
                  <span>{new Date(ressource.created_at).toLocaleDateString('fr-FR')}</span>
                  <span>{formatFileSize(ressource.taille)}</span>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Auteur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Statut</th>
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
                  <td className="px-6 py-4">
                    <span className="text-secondary-600">{ressource.created_by_username || 'Anonyme'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {ressource.est_public ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircleIcon className="h-4 w-4" />
                        Publique
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-xs">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        Privée
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(ressource.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(ressource)}
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Aperçu"
                      >
                        <EyeIcon className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(ressource)}
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilSquareIcon className="h-4 w-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(ressource.id_ressource, ressource.titre)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
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
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="hover:bg-secondary-100 p-1 rounded-lg"
              >
                <XMarkIcon className="h-6 w-6 text-secondary-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fichier (optionnel si URL fournie)
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.mp3,.jpg,.jpeg,.png,.gif"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2.5 border-2 border-dashed border-secondary-200 rounded-xl hover:border-primary-500 transition-colors flex items-center justify-center gap-2 text-secondary-600"
                  >
                    <CloudArrowUpIcon className="h-5 w-5" />
                    {selectedFile ? selectedFile.name : 'Choisir un fichier'}
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">{uploadProgress}% uploadé</p>
                  </div>
                )}
              </div>

              {/* OU Lien */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Ou URL du lien
                </label>
                <input
                  type="url"
                  value={formData.fichier_url}
                  onChange={(e) => setFormData({...formData, fichier_url: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  disabled={!!selectedFile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                    required
                  >
                    <option value="pdf">📄 PDF</option>
                    <option value="video">🎥 Vidéo</option>
                    <option value="lien">🔗 Lien</option>
                    <option value="image">🖼️ Image</option>
                    <option value="audio">🎵 Audio</option>
                    <option value="presentation">📊 Présentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Matière *
                  </label>
                  <select
                    value={formData.matiere_id}
                    onChange={(e) => setFormData({...formData, matiere_id: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="est_public"
                  checked={formData.est_public}
                  onChange={(e) => setFormData({...formData, est_public: e.target.checked})}
                  className="h-4 w-4 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                />
                <label htmlFor="est_public" className="text-sm text-secondary-700">
                  Rendre publique (accessible à tous les étudiants)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createRessourceMutation.isLoading || updateRessourceMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {createRessourceMutation.isLoading || updateRessourceMutation.isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      {editingRessource ? 'Modification...' : 'Ajout...'}
                    </>
                  ) : (
                    editingRessource ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aperçu (identique à la version étudiant) */}
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
                <XMarkIcon className="h-6 w-6 text-secondary-400" />
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
                  <span className="text-secondary-500">Auteur</span>
                  <p className="font-medium text-secondary-900">{selectedRessource.created_by_username || 'Anonyme'}</p>
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
                <div>
                  <span className="text-secondary-500">Statut</span>
                  <p className="font-medium text-secondary-900">
                    {selectedRessource.est_public ? 'Publique' : 'Privée'}
                  </p>
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
                  onClick={() => handleEdit(selectedRessource)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Modifier
                </button>
                <a
                  href={selectedRessource.fichier_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
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

export default GestionRessourcesPage