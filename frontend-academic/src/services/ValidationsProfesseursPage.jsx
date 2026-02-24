import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuth } from '../../hooks/useAuth'
import {
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { CheckBadgeIcon as CheckBadgeIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const ValidationsProfesseursPage = () => {
  const { user } = useAuth()
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Récupérer les professeurs en attente
  const { data: pendingData, isLoading, refetch } = useQuery({
    queryKey: ['pendingProfessors'],
    queryFn: () => adminService.getUtilisateurs({
      role: 'professeur',
      status: 'pending'
    }),
    enabled: !!user?.id
  })

  // Mutation pour valider un professeur
  const verifyProfessorMutation = useMutation({
    mutationFn: ({ id }) => adminService.updateUtilisateur(id, { is_verified: true }),
    onSuccess: () => {
      toast.success('Professeur validé avec succès')
      refetch()
      setShowDetailsModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la validation')
    }
  })

  // Mutation pour rejeter/supprimer un professeur
  const rejectProfessorMutation = useMutation({
    mutationFn: (id) => adminService.deleteUtilisateur(id),
    onSuccess: () => {
      toast.success('Demande rejetée')
      refetch()
      setShowDetailsModal(false)
    },
    onError: () => {
      toast.error('Erreur lors du rejet')
    }
  })

  const handleVerify = (id) => {
    if (window.confirm('Valider ce professeur ? Il pourra se connecter et utiliser la plateforme.')) {
      verifyProfessorMutation.mutate({ id })
    }
  }

  const handleReject = (id) => {
    if (window.confirm('Rejeter cette demande ? Le professeur sera supprimé.')) {
      rejectProfessorMutation.mutate(id)
    }
  }

  const pendingProfessors = pendingData?.results || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Validations des professeurs</h1>
          <p className="text-secondary-600 mt-1">
            {pendingProfessors.length} professeur{pendingProfessors.length > 1 ? 's' : ''} en attente de validation
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200"
        >
          <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-8 w-8" />
            <div>
              <p className="text-3xl font-bold">{pendingProfessors.length}</p>
              <p className="text-sm opacity-90">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <CheckBadgeIcon className="h-8 w-8" />
            <div>
              <p className="text-3xl font-bold">6</p>
              <p className="text-sm opacity-90">Validés ce mois</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="h-8 w-8" />
            <div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm opacity-90">Total professeurs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des professeurs en attente */}
      {pendingProfessors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200">
          <CheckBadgeIconSolid className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-secondary-500">Aucun professeur en attente de validation</p>
          <p className="text-sm text-secondary-400 mt-1">
            Tous les professeurs ont été validés
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingProfessors.map((prof) => (
            <div
              key={prof.id}
              className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white text-lg font-semibold">
                    {prof.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{prof.username}</h3>
                    <p className="text-xs text-secondary-500">ID: {prof.id}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  En attente
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600">{prof.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BriefcaseIcon className="h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600">{prof.specialite || 'Spécialité non renseignée'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600">
                    Inscrit le {new Date(prof.date_joined).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProfessor(prof)
                    setShowDetailsModal(true)
                  }}
                  className="flex-1 py-2 bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200 text-sm flex items-center justify-center gap-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  Détails
                </button>
                <button
                  onClick={() => handleVerify(prof.id)}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-1"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Valider
                </button>
                <button
                  onClick={() => handleReject(prof.id)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détails Professeur */}
      {showDetailsModal && selectedProfessor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">Détails du professeur</h3>
              <button onClick={() => setShowDetailsModal(false)}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedProfessor.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-secondary-900">{selectedProfessor.username}</h4>
                  <p className="text-sm text-secondary-500">Professeur</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-secondary-100">
                  <span className="text-sm text-secondary-600">Email</span>
                  <span className="text-sm font-medium text-secondary-900">{selectedProfessor.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-secondary-100">
                  <span className="text-sm text-secondary-600">Spécialité</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {selectedProfessor.specialite || 'Non renseignée'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-secondary-100">
                  <span className="text-sm text-secondary-600">Téléphone</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {selectedProfessor.telephone || 'Non renseigné'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-secondary-100">
                  <span className="text-sm text-secondary-600">Date d'inscription</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {new Date(selectedProfessor.date_joined).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-secondary-600">Statut</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    En attente de validation
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-secondary-200">
                <button
                  onClick={() => {
                    handleVerify(selectedProfessor.id)
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Valider
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedProfessor.id)
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <XCircleIcon className="h-5 w-5" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValidationsProfesseursPage