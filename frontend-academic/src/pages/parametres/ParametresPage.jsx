import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { authService } from '../../services/auth'
import toast from 'react-hot-toast'
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Switch } from '@headlessui/react'

const ParametresPage = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profil')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // État pour les différents formulaires
  const [profilForm, setProfilForm] = useState({
    email: user?.email || '',
    telephone: user?.telephone || '',
    filiere: user?.filiere || '',
    niveau: user?.niveau || '',
    numero_etudiant: user?.numero_etudiant || ''
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    suggestion_alerts: true,
    note_validations: true,
    exam_reminders: true,
    newsletter: false,
    marketing_emails: false
  })

  const [apparence, setApparence] = useState({
    theme: 'system', // 'light', 'dark', 'system'
    language: 'fr',
    density: 'comfortable', // 'comfortable', 'compact'
    animations: true,
    reduced_motion: false,
    fontSize: 'medium' // 'small', 'medium', 'large'
  })

  const [confidentialite, setConfidentialite] = useState({
    profile_visible: true,
    show_email: false,
    show_phone: false,
    show_statistics: true,
    allow_data_collection: true,
    share_anonymized_data: false
  })

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    },
    onError: () => {
      toast.error('Erreur lors du changement de mot de passe')
    }
  })

  const handleProfilSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(profilForm)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    updatePasswordMutation.mutate(passwordForm)
  }

  const handleExportData = () => {
    toast.success('Export des données démarré')
    // Logique d'export
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      toast.success('Demande de suppression envoyée')
      // Logique de suppression
    }
  }

  const tabs = [
    { id: 'profil', name: 'Profil', icon: UserIcon },
    { id: 'securite', name: 'Sécurité', icon: LockClosedIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'apparence', name: 'Apparence', icon: PaintBrushIcon },
    { id: 'confidentialite', name: 'Confidentialité', icon: ShieldCheckIcon },
    { id: 'donnees', name: 'Données', icon: DocumentTextIcon },
  ]

  const getInitials = (username) => {
    return username?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Paramètres</h1>
          <p className="text-secondary-600 mt-1">
            Gérez vos préférences et les paramètres de votre compte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar des onglets */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-4 sticky top-20">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 ${
                    activeTab === tab.id ? 'text-primary-600' : 'text-secondary-400'
                  }`} />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Version info */}
            <div className="mt-6 pt-4 border-t border-secondary-100">
              <p className="text-xs text-secondary-400 text-center">
                Academic Twins v2.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {/* Onglet Profil */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{getInitials(user?.username)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">{user?.username}</h2>
                  <p className="text-secondary-500">Membre depuis {new Date(user?.date_joined).toLocaleDateString('fr-FR')}</p>
                </div>
                <button className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                  Changer la photo
                </button>
              </div>

              <form onSubmit={handleProfilSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type="email"
                        value={profilForm.email}
                        onChange={(e) => setProfilForm({...profilForm, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type="tel"
                        value={profilForm.telephone}
                        onChange={(e) => setProfilForm({...profilForm, telephone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        placeholder="61234567"
                      />
                    </div>
                  </div>

                  {user?.role === 'etudiant' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Filière
                        </label>
                        <select
                          value={profilForm.filiere}
                          onChange={(e) => setProfilForm({...profilForm, filiere: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        >
                          <option value="">Sélectionnez une filière</option>
                          <option value="Informatique">Informatique</option>
                          <option value="Mathématiques">Mathématiques</option>
                          <option value="Physique">Physique</option>
                          <option value="Chimie">Chimie</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Niveau
                        </label>
                        <select
                          value={profilForm.niveau}
                          onChange={(e) => setProfilForm({...profilForm, niveau: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        >
                          <option value="">Sélectionnez un niveau</option>
                          <option value="L1">Licence 1</option>
                          <option value="L2">Licence 2</option>
                          <option value="L3">Licence 3</option>
                          <option value="M1">Master 1</option>
                          <option value="M2">Master 2</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Numéro étudiant
                        </label>
                        <input
                          type="text"
                          value={profilForm.numero_etudiant}
                          onChange={(e) => setProfilForm({...profilForm, numero_etudiant: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                          placeholder="2024001"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'securite' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Changer le mot de passe</h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5 text-secondary-400" /> : <EyeIcon className="h-5 w-5 text-secondary-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeSlashIcon className="h-5 w-5 text-secondary-400" /> : <EyeIcon className="h-5 w-5 text-secondary-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-secondary-400" /> : <EyeIcon className="h-5 w-5 text-secondary-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">Critères de mot de passe :</h3>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4" />
                        Au moins 8 caractères
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4" />
                        Au moins une lettre majuscule
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4" />
                        Au moins un chiffre
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                      Changer le mot de passe
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Authentification à deux facteurs</h2>
                <p className="text-secondary-600 mb-4">
                  Renforcez la sécurité de votre compte en activant l'authentification à deux facteurs.
                </p>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                  Activer la 2FA
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Sessions actives</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ComputerDesktopIcon className="h-5 w-5 text-secondary-600" />
                      <div>
                        <p className="font-medium text-secondary-900">Windows • Chrome</p>
                        <p className="text-xs text-secondary-500">IP: 192.168.1.45 • Dernière activité: il y a 2 minutes</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Actuelle</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-secondary-600" />
                      <div>
                        <p className="font-medium text-secondary-900">iPhone • Safari</p>
                        <p className="text-xs text-secondary-500">IP: 192.168.1.78 • Dernière activité: il y a 2 jours</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm">Déconnecter</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-6">Préférences de notifications</h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-secondary-900">Email</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                      <div>
                        <p className="font-medium text-secondary-900">Notifications par email</p>
                        <p className="text-sm text-secondary-500">Recevoir des notifications par email</p>
                      </div>
                      <Switch
                        checked={notifications.email_notifications}
                        onChange={(checked) => setNotifications({...notifications, email_notifications: checked})}
                        className={`${
                          notifications.email_notifications ? 'bg-primary-600' : 'bg-secondary-300'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                      >
                        <span
                          className={`${
                            notifications.email_notifications ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                      <div>
                        <p className="font-medium text-secondary-900">Notifications push</p>
                        <p className="text-sm text-secondary-500">Recevoir des notifications sur votre navigateur</p>
                      </div>
                      <Switch
                        checked={notifications.push_notifications}
                        onChange={(checked) => setNotifications({...notifications, push_notifications: checked})}
                        className={`${
                          notifications.push_notifications ? 'bg-primary-600' : 'bg-secondary-300'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-secondary-900">Types de notifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                      <span className="text-secondary-900">Alertes de suggestions</span>
                      <input
                        type="checkbox"
                        checked={notifications.suggestion_alerts}
                        onChange={(e) => setNotifications({...notifications, suggestion_alerts: e.target.checked})}
                        className="w-5 h-5 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                      <span className="text-secondary-900">Validations de notes</span>
                      <input
                        type="checkbox"
                        checked={notifications.note_validations}
                        onChange={(e) => setNotifications({...notifications, note_validations: e.target.checked})}
                        className="w-5 h-5 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                      <span className="text-secondary-900">Rappels d'examens</span>
                      <input
                        type="checkbox"
                        checked={notifications.exam_reminders}
                        onChange={(e) => setNotifications({...notifications, exam_reminders: e.target.checked})}
                        className="w-5 h-5 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                      <span className="text-secondary-900">Newsletter</span>
                      <input
                        type="checkbox"
                        checked={notifications.newsletter}
                        onChange={(e) => setNotifications({...notifications, newsletter: e.target.checked})}
                        className="w-5 h-5 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === 'apparence' && (
            <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-6">Personnalisation</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">Thème</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setApparence({...apparence, theme: 'light'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        apparence.theme === 'light' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-secondary-200 hover:border-primary-200'
                      }`}
                    >
                      <SunIcon className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <span className="text-sm font-medium">Clair</span>
                    </button>
                    <button
                      onClick={() => setApparence({...apparence, theme: 'dark'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        apparence.theme === 'dark' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-secondary-200 hover:border-primary-200'
                      }`}
                    >
                      <MoonIcon className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                      <span className="text-sm font-medium">Sombre</span>
                    </button>
                    <button
                      onClick={() => setApparence({...apparence, theme: 'system'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        apparence.theme === 'system' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-secondary-200 hover:border-primary-200'
                      }`}
                    >
                      <ComputerDesktopIcon className="h-6 w-6 mx-auto mb-2 text-secondary-600" />
                      <span className="text-sm font-medium">Système</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">Langue</label>
                  <select
                    value={apparence.language}
                    onChange={(e) => setApparence({...apparence, language: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">Taille de police</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setApparence({...apparence, fontSize: 'small'})}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        apparence.fontSize === 'small' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-secondary-200'
                      }`}
                    >
                      <span className="text-sm">Petite</span>
                    </button>
                    <button
                      onClick={() => setApparence({...apparence, fontSize: 'medium'})}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        apparence.fontSize === 'medium' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-secondary-200'
                      }`}
                    >
                      <span className="text-base">Moyenne</span>
                    </button>
                    <button
                      onClick={() => setApparence({...apparence, fontSize: 'large'})}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        apparence.fontSize === 'large' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-secondary-200'
                      }`}
                    >
                      <span className="text-lg">Grande</span>
                    </button>
                  </div>
                </div>

                <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Animations</p>
                    <p className="text-sm text-secondary-500">Activer les animations de l'interface</p>
                  </div>
                  <Switch
                    checked={apparence.animations}
                    onChange={(checked) => setApparence({...apparence, animations: checked})}
                    className={`${
                      apparence.animations ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span
                      className={`${
                        apparence.animations ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </label>

                <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Mode réduit</p>
                    <p className="text-sm text-secondary-500">Réduire les mouvements de l'interface</p>
                  </div>
                  <Switch
                    checked={apparence.reduced_motion}
                    onChange={(checked) => setApparence({...apparence, reduced_motion: checked})}
                    className={`${
                      apparence.reduced_motion ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Onglet Confidentialité */}
          {activeTab === 'confidentialite' && (
            <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-6">Confidentialité</h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Profil visible</p>
                    <p className="text-sm text-secondary-500">Permettre aux autres utilisateurs de voir votre profil</p>
                  </div>
                  <Switch
                    checked={confidentialite.profile_visible}
                    onChange={(checked) => setConfidentialite({...confidentialite, profile_visible: checked})}
                    className={`${
                      confidentialite.profile_visible ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Afficher l'email</p>
                    <p className="text-sm text-secondary-500">Rendre votre email visible sur votre profil</p>
                  </div>
                  <Switch
                    checked={confidentialite.show_email}
                    onChange={(checked) => setConfidentialite({...confidentialite, show_email: checked})}
                    className={`${
                      confidentialite.show_email ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Afficher le téléphone</p>
                    <p className="text-sm text-secondary-500">Rendre votre numéro visible sur votre profil</p>
                  </div>
                  <Switch
                    checked={confidentialite.show_phone}
                    onChange={(checked) => setConfidentialite({...confidentialite, show_phone: checked})}
                    className={`${
                      confidentialite.show_phone ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Statistiques publiques</p>
                    <p className="text-sm text-secondary-500">Permettre d'afficher vos statistiques dans le classement</p>
                  </div>
                  <Switch
                    checked={confidentialite.show_statistics}
                    onChange={(checked) => setConfidentialite({...confidentialite, show_statistics: checked})}
                    className={`${
                      confidentialite.show_statistics ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  />
                </label>

                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Collecte de données</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Nous collectons des données pour améliorer nos services. Vous pouvez gérer vos préférences ci-dessous.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700">Autoriser la collecte de données</span>
                      <input
                        type="checkbox"
                        checked={confidentialite.allow_data_collection}
                        onChange={(e) => setConfidentialite({...confidentialite, allow_data_collection: e.target.checked})}
                        className="w-4 h-4 text-primary-600 rounded border-secondary-300"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700">Partager des données anonymisées</span>
                      <input
                        type="checkbox"
                        checked={confidentialite.share_anonymized_data}
                        onChange={(e) => setConfidentialite({...confidentialite, share_anonymized_data: e.target.checked})}
                        className="w-4 h-4 text-primary-600 rounded border-secondary-300"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Onglet Données */}
          {activeTab === 'donnees' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Gestion des données</h2>

                <div className="space-y-4">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CloudArrowUpIcon className="h-5 w-5 text-primary-600" />
                      <div className="text-left">
                        <p className="font-medium text-secondary-900">Exporter mes données</p>
                        <p className="text-sm text-secondary-500">Télécharger une copie de toutes vos données</p>
                      </div>
                    </div>
                    <ArrowPathIcon className="h-5 w-5 text-secondary-400" />
                  </button>

                  <button
                    className="w-full flex items-center justify-between p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="h-5 w-5 text-primary-600" />
                      <div className="text-left">
                        <p className="font-medium text-secondary-900">Historique des connexions</p>
                        <p className="text-sm text-secondary-500">Consulter l'historique de vos connexions</p>
                      </div>
                    </div>
                    <span className="text-sm text-primary-600">Voir →</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Zone de danger</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Supprimer le compte</p>
                        <p className="text-sm text-red-700 mt-1">
                          Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                    >
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParametresPage