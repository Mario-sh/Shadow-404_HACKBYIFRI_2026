import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuth } from '../../hooks/useAuth'
import {
  BuildingOfficeIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const GestionClassesPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [formData, setFormData] = useState({
    nom_class: '',
    niveau: '',
    description: '',
    capacite: 30
  })

  // Récupérer toutes les classes
  const { data: classesData, isLoading, refetch } = useQuery({
    queryKey: ['allClasses', searchTerm],
    queryFn: async () => {
      try {
        const params = {}
        if (searchTerm) params.search = searchTerm

        const response = await adminService.getClasses(params)
        console.log('📚 Classes reçues:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération classes:', error)
        return { results: [] }
      }
    },
    enabled: !!user?.id
  })

  // Mutations
  const createClassMutation = useMutation({
    mutationFn: (data) => adminService.createClasse(data),
    onSuccess: () => {
      toast.success('Classe créée avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la création')
    }
  })

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateClasse(id, data),
    onSuccess: () => {
      toast.success('Classe modifiée avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification')
    }
  })

  const deleteClassMutation = useMutation({
    mutationFn: (id) => adminService.deleteClasse(id),
    onSuccess: () => {
      toast.success('Classe supprimée')
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression')
    }
  })

  const resetForm = () => {
    setFormData({
      nom_class: '',
      niveau: '',
      description: '',
      capacite: 30
    })
    setEditingClass(null)
  }

  const handleEdit = (classe) => {
    setEditingClass(classe)
    setFormData({
      nom_class: classe.nom_class,
      niveau: classe.niveau,
      description: classe.description || '',
      capacite: classe.capacite || 30
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingClass) {
      updateClassMutation.mutate({ id: editingClass.id_classe, data: formData })
    } else {
      createClassMutation.mutate(formData)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette classe ? Cette action est irréversible.')) {
      deleteClassMutation.mutate(id)
    }
  }

  const handleViewDetails = (classe) => {
    setSelectedClass(classe)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  const classes = classesData?.results || classesData || []

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des classes</h1>
          <p className="text-secondary-600 mt-1">
            {classes.length} classe{classes.length > 1 ? 's' : ''} au total
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
            Nouvelle classe
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une classe par nom ou niveau..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          />
        </div>
      </div>

      {/* Liste des classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classe) => (
          <div
            key={classe.id_classe}
            className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">{classe.nom_class}</h3>
                <p className="text-sm text-secondary-500 mt-1">{classe.niveau}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleViewDetails(classe)}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                  title="Voir détails"
                >
                  <EyeIcon className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleEdit(classe)}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                  title="Modifier"
                >
                  <PencilSquareIcon className="h-4 w-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleDelete(classe.id_classe)}
                  className="p-2 hover:bg-red-100 rounded-lg"
                  title="Supprimer"
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Étudiants</span>
                <span className="font-semibold text-secondary-900">{classe.effectif || 0}/{classe.capacite || 30}</span>
              </div>
              <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${((classe.effectif || 0) / (classe.capacite || 30)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Matières</span>
                <span className="font-semibold text-secondary-900">{classe.matieres?.length || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-secondary-100">
              <Link
                to={`/classes/${classe.id_classe}/etudiants`}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <UsersIcon className="h-4 w-4" />
                Voir les étudiants
              </Link>
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
                {editingClass ? 'Modifier' : 'Ajouter'} une classe
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
                  Nom de la classe *
                </label>
                <input
                  type="text"
                  value={formData.nom_class}
                  onChange={(e) => setFormData({...formData, nom_class: e.target.value})}
                  placeholder="Ex: L1 INFO"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Niveau *
                </label>
                <select
                  value={formData.niveau}
                  onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Licence 1">Licence 1</option>
                  <option value="Licence 2">Licence 2</option>
                  <option value="Licence 3">Licence 3</option>
                  <option value="Master 1">Master 1</option>
                  <option value="Master 2">Master 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Capacité maximale
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.capacite}
                  onChange={(e) => setFormData({...formData, capacite: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
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
                  placeholder="Description de la classe..."
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
                  disabled={createClassMutation.isLoading || updateClassMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {createClassMutation.isLoading || updateClassMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    editingClass ? 'Modifier' : 'Créer'
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

export default GestionClassesPage