import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { authService } from '../../services/auth'
import { academicService } from '../../services/academic'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ClockIcon,
  CameraIcon,
  KeyIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ProfilPage = () => {
  const { user, logout } = useAuth()
  const [etudiantId, setEtudiantId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    telephone: user?.telephone || '',
    filiere: user?.filiere || '',
    niveau: user?.niveau || '',
    numero_etudiant: user?.numero_etudiant || ''
  })
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // ============================================
  // 1. RÉCUPÉRER L'ÉTUDIANT (si c'est un étudiant)
  // ============================================
  const { data: etudiant, isLoading: etudiantLoading } = useQuery({
    queryKey: ['etudiantByUser', user?.id],
    queryFn: async () => {
      if (user?.role !== 'etudiant') return null
      try {
        const response = await academicService.getEtudiantByUserId(user?.id)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération étudiant:', error)
        return null
      }
    },
    enabled: !!user?.id && user?.role === 'etudiant'
  })

  useEffect(() => {
    if (etudiant?.id_student) {
      setEtudiantId(etudiant.id_student)
    }
  }, [etudiant])

  // ============================================
  // 2. RÉCUPÉRER LES STATISTIQUES (pour étudiants)
  // ============================================
  const { data: stats } = useQuery({
    queryKey: ['userStats', etudiantId],
    queryFn: async () => {
      if (!etudiantId) return null
      try {
        const response = await academicService.getStatistiques(etudiantId)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération statistiques:', error)
        return null
      }
    },
    enabled: !!etudiantId
  })

  // ============================================
  // 3. MUTATIONS
  // ============================================
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès')
      setIsEditing(false)
      window.location.reload()
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour')
      console.error(error)
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès')
      setShowPasswordModal(false)
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.old_password?.[0] || 'Erreur lors du changement de mot de passe')
    }
  })

  // ============================================
  // 4. GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    changePasswordMutation.mutate(passwordData)
  }

  // ============================================
  // 5. FONCTIONS UTILITAIRES
  // ============================================
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    if (etudiant?.prenom && etudiant?.nom) {
      return `${etudiant.prenom[0]}${etudiant.nom[0]}`
    }
    return user?.username?.charAt(0).toUpperCase() || 'U'
  }

  const getRoleBadge = () => {
    switch(user?.role) {
      case 'admin':
        return { color: 'bg-purple-100 text-purple-700', icon: ShieldCheckIcon, label: 'Administrateur' }
      case 'professeur':
        return { color: 'bg-blue-100 text-blue-700', icon: AcademicCapIcon, label: 'Professeur' }
      default:
        return { color: 'bg-green-100 text-green-700', icon: UserIcon, label: 'Étudiant' }
    }
  }

  const roleBadge = getRoleBadge()
  const isLoading = etudiantLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Mon Profil</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors"
              >
                <KeyIcon className="h-5 w-5" />
                Changer mot de passe
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
                Modifier
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={updateProfileMutation.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckIcon className="h-5 w-5" />
                )}
                Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Avatar et infos rapides */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6 sticky top-24">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-5xl font-bold text-white">{getInitials()}</span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-secondary-200 hover:bg-secondary-50 transition-colors">
                  <CameraIcon className="h-5 w-5 text-primary-600" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-secondary-900">
                {etudiant?.prenom ? `${etudiant.prenom} ${etudiant.nom}` : user?.username}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                  <roleBadge.icon className="h-4 w-4 inline mr-1" />
                  {roleBadge.label}
                </span>
              </div>
            </div>

            {/* Informations rapides */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                <CalendarIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-secondary-500">Membre depuis</p>
                  <p className="text-sm font-medium text-secondary-900">
                    {new Date(user?.date_joined).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {user?.last_login && (
                <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                  <ClockIcon className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs text-secondary-500">Dernière connexion</p>
                    <p className="text-sm font-medium text-secondary-900">
                      {new Date(user?.last_login).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {stats && (
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white">
                  <p className="text-sm opacity-90 mb-1">Moyenne générale</p>
                  <p className="text-3xl font-bold">{stats.moyenne_generale?.toFixed(1) || 'N/A'}/20</p>
                </div>
              )}
            </div>

            {/* Bouton déconnexion */}
            <button
              onClick={logout}
              className="mt-6 w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Colonne droite - Informations détaillées */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-6">Informations personnelles</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom d'utilisateur (non modifiable) */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      value={user?.username}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        isEditing 
                          ? 'border-primary-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100' 
                          : 'border-secondary-200 bg-secondary-50 text-secondary-500'
                      } outline-none transition-all`}
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        isEditing 
                          ? 'border-primary-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100' 
                          : 'border-secondary-200 bg-secondary-50 text-secondary-500'
                      } outline-none transition-all`}
                      placeholder="61234567"
                    />
                  </div>
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Rôle
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      value={user?.role}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500 capitalize"
                    />
                  </div>
                </div>

                {/* Champs spécifiques étudiant */}
                {user?.role === 'etudiant' && (
                  <>
                    {/* Filière */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Filière
                      </label>
                      <div className="relative">
                        <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                        {isEditing ? (
                          <select
                            name="filiere"
                            value={formData.filiere}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                          >
                            <option value="">Sélectionnez</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Mathématiques">Mathématiques</option>
                            <option value="Physique">Physique</option>
                            <option value="Gestion">Gestion</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.filiere || 'Non renseigné'}
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* Niveau */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Niveau
                      </label>
                      <div className="relative">
                        <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                        {isEditing ? (
                          <select
                            name="niveau"
                            value={formData.niveau}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                          >
                            <option value="">Sélectionnez</option>
                            <option value="L1">Licence 1</option>
                            <option value="L2">Licence 2</option>
                            <option value="L3">Licence 3</option>
                            <option value="M1">Master 1</option>
                            <option value="M2">Master 2</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.niveau || 'Non renseigné'}
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* Numéro étudiant */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Numéro étudiant
                      </label>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                        {isEditing ? (
                          <input
                            name="numero_etudiant"
                            type="text"
                            value={formData.numero_etudiant}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                            placeholder="2024001"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData.numero_etudiant || 'Non renseigné'}
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* Classe (lecture seule) */}
                    {etudiant && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Classe
                        </label>
                        <div className="relative">
                          <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                          <input
                            type="text"
                            value={etudiant.classe_nom || 'Non assigné'}
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </form>

            {/* Statistiques supplémentaires pour étudiants */}
            {user?.role === 'etudiant' && stats && (
              <div className="mt-8 pt-6 border-t border-secondary-200">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Statistiques d'apprentissage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary-600">{stats.total_notes || 0}</p>
                    <p className="text-sm text-secondary-600">Notes</p>
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.matiere_forte || 'N/A'}</p>
                    <p className="text-sm text-secondary-600">Matière forte</p>
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {Object.keys(stats.moyennes_par_matiere || {}).length}
                    </p>
                    <p className="text-sm text-secondary-600">Matières</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">Changer le mot de passe</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Ancien mot de passe
                </label>
                <input
                  name="old_password"
                  type="password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {changePasswordMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    'Changer'
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

export default ProfilPage