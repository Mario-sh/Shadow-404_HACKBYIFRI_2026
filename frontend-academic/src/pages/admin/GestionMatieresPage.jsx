import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuth } from '../../hooks/useAuth'
import {
  BookOpenIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ChartBarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const GestionMatieresPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClasse, setSelectedClasse] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingMatiere, setEditingMatiere] = useState(null)
  const [selectedMatiere, setSelectedMatiere] = useState(null)
  const [formData, setFormData] = useState({
    nom_matière: '',
    coefficient: 1,
    classe_id: ''
  })

  // Récupérer toutes les matières
  const { data: matieresData, isLoading, refetch } = useQuery({
    queryKey: ['allMatieres', selectedClasse, searchTerm],
    queryFn: async () => {
      try {
        const params = {}
        if (selectedClasse !== 'all') params.classe_id = selectedClasse
        if (searchTerm) params.search = searchTerm

        const response = await adminService.getMatieres(params)
        console.log('📚 Matières reçues:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération matières:', error)
        return { results: [] }
      }
    },
    enabled: !!user?.id
  })

  // Récupérer les classes pour le select
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const response = await adminService.getClasses()
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération classes:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // Mutations
  const createMatiereMutation = useMutation({
    mutationFn: (data) => adminService.createMatiere(data),
    onSuccess: () => {
      toast.success('Matière créée avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la création')
    }
  })

  const updateMatiereMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateMatiere(id, data),
    onSuccess: () => {
      toast.success('Matière modifiée avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification')
    }
  })

  const deleteMatiereMutation = useMutation({
    mutationFn: (id) => adminService.deleteMatiere(id),
    onSuccess: () => {
      toast.success('Matière supprimée')
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression')
    }
  })

  const resetForm = () => {
    setFormData({ nom_matière: '', coefficient: 1, classe_id: '' })
    setEditingMatiere(null)
  }

  const handleEdit = (matiere) => {
    setEditingMatiere(matiere)
    setFormData({
      nom_matière: matiere.nom_matière,
      coefficient: matiere.coefficient,
      classe_id: matiere.classe_id?.toString() || ''
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSend = {
      ...formData,
      coefficient: parseInt(formData.coefficient)
    }

    if (editingMatiere) {
      updateMatiereMutation.mutate({ id: editingMatiere.id_matiere, data: dataToSend })
    } else {
      createMatiereMutation.mutate(dataToSend)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette matière ?')) {
      deleteMatiereMutation.mutate(id)
    }
  }

  const handleViewDetails = (matiere) => {
    setSelectedMatiere(matiere)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  const matieres = matieresData?.results || matieresData || []
  const classes = Array.isArray(classesData) ? classesData : []

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des matières</h1>
          <p className="text-secondary-600 mt-1">
            {matieres.length} matière{matieres.length > 1 ? 's' : ''} au total
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
            Nouvelle matière
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une matière..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id_classe} value={c.id_classe}>{c.nom_class}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matieres.map((matiere) => (
          <div
            key={matiere.id_matiere}
            className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">{matiere.nom_matière}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                    Coef. {matiere.coefficient}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleViewDetails(matiere)}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                  title="Voir détails"
                >
                  <EyeIcon className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleEdit(matiere)}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                  title="Modifier"
                >
                  <PencilSquareIcon className="h-4 w-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleDelete(matiere.id_matiere)}
                  className="p-2 hover:bg-red-100 rounded-lg"
                  title="Supprimer"
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Classe</span>
                <span className="font-semibold text-secondary-900">
                  {classes.find(c => c.id_classe === matiere.classe_id)?.nom_class || 'Toutes'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Notes</span>
                <span className="font-semibold text-secondary-900">{matiere.nb_notes || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Moyenne</span>
                <span className="font-semibold text-green-600">{matiere.moyenne || 'N/A'}/20</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">
                {editingMatiere ? 'Modifier' : 'Ajouter'} une matière
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
                  Nom de la matière *
                </label>
                <input
                  type="text"
                  value={formData.nom_matière}
                  onChange={(e) => setFormData({...formData, nom_matière: e.target.value})}
                  placeholder="Ex: Mathématiques"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Coefficient *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.coefficient}
                  onChange={(e) => setFormData({...formData, coefficient: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Classe
                </label>
                <select
                  value={formData.classe_id}
                  onChange={(e) => setFormData({...formData, classe_id: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(c => (
                    <option key={c.id_classe} value={c.id_classe}>{c.nom_class}</option>
                  ))}
                </select>
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
                  disabled={createMatiereMutation.isLoading || updateMatiereMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMatiereMutation.isLoading || updateMatiereMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    editingMatiere ? 'Modifier' : 'Créer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionMatieresPage