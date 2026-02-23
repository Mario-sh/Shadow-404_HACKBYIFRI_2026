import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
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
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useQuery, useMutation } from '@tanstack/react-query'
import { authService } from '../../services/auth'
import toast from 'react-hot-toast'

const ProfilPage = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    filiere: user?.filiere || '',
    niveau: user?.niveau || '',
    numero_etudiant: user?.numero_etudiant || '',
    telephone: user?.telephone || ''
  })

  // Récupérer les statistiques de l'utilisateur
  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => authService.getProfile(),
    enabled: !!user?.id
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès')
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour')
    }
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      filiere: user?.filiere || '',
      niveau: user?.niveau || '',
      numero_etudiant: user?.numero_etudiant || '',
      telephone: user?.telephone || ''
    })
    setIsEditing(false)
  }

  const getInitials = (username) => {
    return username?.charAt(0).toUpperCase() || 'U'
  }

  const stats = [
    { label: 'Membre depuis', value: new Date(user?.date_joined).toLocaleDateString('fr-FR'), icon: CalendarIcon },
    { label: 'Dernière connexion', value: user?.last_login ? new Date(user?.last_login).toLocaleDateString('fr-FR') : 'Jamais', icon: ClockIcon },
    { label: 'Rôle', value: user?.role, icon: ShieldCheckIcon, capitalize: true },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Mon Profil</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
            Modifier le profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <CheckIcon className="h-5 w-5" />
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* Carte principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Avatar et infos rapides */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-5xl font-bold text-white">{getInitials(user?.username)}</span>
                </div>
                <button className="absolute bottom-0 right-0 bg-secondary-200 p-2 rounded-full hover:bg-secondary-300 transition-colors">
                  <ArrowUpTrayIcon className="h-5 w-5 text-secondary-700" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">{user?.username}</h2>
              <p className="text-secondary-500 capitalize">{user?.role}</p>
            </div>

            <div className="mt-6 space-y-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">{stat.label}</p>
                    <p className={`text-sm font-medium text-secondary-900 ${stat.capitalize ? 'capitalize' : ''}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={logout}
              className="mt-6 w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed"
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
                          ? 'border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 bg-white' 
                          : 'border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed'
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
                          ? 'border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 bg-white' 
                          : 'border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed'
                      } outline-none transition-all`}
                      placeholder="61234567"
                    />
                  </div>
                </div>

                {/* Rôle (non modifiable) */}
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500 capitalize cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Filière */}
                {user?.role === 'etudiant' && (
                  <>
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                          >
                            <option value="">Sélectionnez une filière</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Mathématiques">Mathématiques</option>
                            <option value="Physique">Physique</option>
                            <option value="Chimie">Chimie</option>
                            <option value="Biologie">Biologie</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.filiere || 'Non renseigné'}
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                          >
                            <option value="">Sélectionnez un niveau</option>
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed"
                          />
                        )}
                      </div>
                    </div>

                    {/* Numéro étudiant */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Numéro étudiant
                      </label>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                        <input
                          name="numero_etudiant"
                          type="text"
                          value={formData.numero_etudiant}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            isEditing 
                              ? 'border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 bg-white' 
                              : 'border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed'
                          } outline-none transition-all`}
                          placeholder="2024001"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Pour professeur */}
                {user?.role === 'professeur' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Spécialité
                    </label>
                    <div className="relative">
                      <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      {isEditing ? (
                        <input
                          name="specialite"
                          type="text"
                          value={formData.specialite}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                          placeholder="Votre spécialité"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData.specialite || 'Non renseigné'}
                          disabled
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 text-secondary-500 cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilPage