import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuth } from '../../hooks/useAuth'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import ExportButton from '../../components/common/ExportButton'
import { exportService } from '../../services/export'
import toast from 'react-hot-toast'

const GestionUtilisateursPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'etudiant',
    filiere: '',
    niveau: '',
    numero_etudiant: '',
    telephone: '',
    specialite: ''
  })

  // Récupérer tous les utilisateurs
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['allUsers', selectedRole, selectedStatus, searchTerm],
    queryFn: async () => {
      try {
        const params = {}
        if (selectedRole !== 'all') params.role = selectedRole
        if (selectedStatus !== 'all') params.status = selectedStatus
        if (searchTerm) params.search = searchTerm

        const response = await adminService.getUtilisateurs(params)
        console.log('📊 Utilisateurs reçus:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error)
        return { results: [] }
      }
    },
    enabled: !!user?.id
  })

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (data) => adminService.createUtilisateur(data),
    onSuccess: () => {
      toast.success('Utilisateur créé avec succès')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la création'
      toast.error(errorMsg)
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateUtilisateur(id, data),
    onSuccess: () => {
      toast.success('Utilisateur modifié')
      setShowModal(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id) => adminService.deleteUtilisateur(id),
    onSuccess: () => {
      toast.success('Utilisateur supprimé')
      refetch()
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression')
    }
  })

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      password2: '',
      role: 'etudiant',
      filiere: '',
      niveau: '',
      numero_etudiant: '',
      telephone: '',
      specialite: ''
    })
    setEditingUser(null)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email || '',
      password: '',
      password2: '',
      role: user.role,
      filiere: user.filiere || '',
      niveau: user.niveau || '',
      numero_etudiant: user.numero_etudiant || '',
      telephone: user.telephone || '',
      specialite: user.specialite || ''
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingUser) {
      const { password, password2, ...data } = formData
      updateUserMutation.mutate({ id: editingUser.id, data })
    } else {
      if (formData.password !== formData.password2) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
      const { password2, ...dataToSend } = formData
      createUserMutation.mutate(dataToSend)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      deleteUserMutation.mutate(id)
    }
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
      case 'professeur': return <AcademicCapIcon className="h-4 w-4 text-blue-600" />
      default: return <UserIcon className="h-4 w-4 text-green-600" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'professeur': return 'bg-blue-100 text-blue-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  const users = usersData?.results || usersData || []

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête avec bouton d'export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des utilisateurs</h1>
          <p className="text-secondary-600 mt-1">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} sur la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={users}
            filename="utilisateurs"
            formatFunction={exportService.formatUtilisateurs}
            title="Exporter"
          />
          <button
            onClick={() => refetch()}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200"
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
            <UserPlusIcon className="h-5 w-5" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none min-w-[150px]"
          >
            <option value="all">Tous les rôles</option>
            <option value="etudiant">Étudiants</option>
            <option value="professeur">Professeurs</option>
            <option value="admin">Administrateurs</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none min-w-[150px]"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Dernière connexion</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{user.username}</p>
                        <p className="text-xs text-secondary-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{user.email || '—'}</td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircleIcon className="h-4 w-4" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-secondary-100 rounded-lg"
                        title="Modifier"
                      >
                        <PencilSquareIcon className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-100 rounded-lg"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-secondary-900">
                {editingUser ? 'Modifier' : 'Ajouter'} un utilisateur
              </h3>
              <button onClick={() => {
                setShowModal(false)
                resetForm()
              }}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* ... (reste du formulaire inchangé) ... */}
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
                  disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {createUserMutation.isLoading || updateUserMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    editingUser ? 'Modifier' : 'Créer'
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

export default GestionUtilisateursPage