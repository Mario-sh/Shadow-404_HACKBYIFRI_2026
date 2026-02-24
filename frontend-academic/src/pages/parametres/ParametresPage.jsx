import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '../../services/auth'
import { notificationsService } from '../../services/notifications'
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  LanguageIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  UserIcon,
  KeyIcon,
  PaintBrushIcon,
  WifiIcon,
  BellAlertIcon,
  SpeakerWaveIcon,
  LockClosedIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Switch } from '@headlessui/react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const ParametresPage = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('apparence')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // ============================================
  // 1. ÉTAT DES PARAMÈTRES (avec localStorage)
  // ============================================
  const [settings, setSettings] = useState({
    // Apparence
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'fr',
    fontSize: localStorage.getItem('fontSize') || 'normal',
    compactMode: JSON.parse(localStorage.getItem('compactMode') || 'false'),
    reducedMotion: JSON.parse(localStorage.getItem('reducedMotion') || 'false'),

    // Notifications
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
    pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'true'),
    notificationSounds: JSON.parse(localStorage.getItem('notificationSounds') || 'true'),
    notifyNewNotes: JSON.parse(localStorage.getItem('notifyNewNotes') || 'true'),
    notifySuggestions: JSON.parse(localStorage.getItem('notifySuggestions') || 'true'),
    notifyMessages: JSON.parse(localStorage.getItem('notifyMessages') || 'true'),
    notifyEvents: JSON.parse(localStorage.getItem('notifyEvents') || 'true'),
    notifyGrades: JSON.parse(localStorage.getItem('notifyGrades') || 'true'),
    notifyComments: JSON.parse(localStorage.getItem('notifyComments') || 'true'),
    quietHours: JSON.parse(localStorage.getItem('quietHours') || 'false'),
    quietHoursStart: localStorage.getItem('quietHoursStart') || '22:00',
    quietHoursEnd: localStorage.getItem('quietHoursEnd') || '07:00',

    // Confidentialité
    profileVisibility: localStorage.getItem('profileVisibility') || 'public',
    showEmail: JSON.parse(localStorage.getItem('showEmail') || 'true'),
    showPhone: JSON.parse(localStorage.getItem('showPhone') || 'false'),
    showBirthdate: JSON.parse(localStorage.getItem('showBirthdate') || 'false'),
    showAddress: JSON.parse(localStorage.getItem('showAddress') || 'false'),
    allowMessagesFrom: localStorage.getItem('allowMessagesFrom') || 'everyone',
    allowFriendRequests: JSON.parse(localStorage.getItem('allowFriendRequests') || 'true'),
    activityStatus: JSON.parse(localStorage.getItem('activityStatus') || 'true'),

    // Sécurité
    twoFactorAuth: JSON.parse(localStorage.getItem('twoFactorAuth') || 'false'),
    sessionTimeout: localStorage.getItem('sessionTimeout') || '30',
    loginAlerts: JSON.parse(localStorage.getItem('loginAlerts') || 'true'),
    deviceHistory: JSON.parse(localStorage.getItem('deviceHistory') || 'true'),
    autoLogout: JSON.parse(localStorage.getItem('autoLogout') || 'true'),
    ipTracking: JSON.parse(localStorage.getItem('ipTracking') || 'false'),

    // Préférences
    defaultDashboard: localStorage.getItem('defaultDashboard') || 'overview',
    itemsPerPage: localStorage.getItem('itemsPerPage') || '20',
    dateFormat: localStorage.getItem('dateFormat') || 'dd/mm/yyyy',
    timeFormat: localStorage.getItem('timeFormat') || '24h',
    firstDayOfWeek: localStorage.getItem('firstDayOfWeek') || 'monday',
  })

  // ============================================
  // 2. RÉCUPÉRER LES STATISTIQUES (optionnel)
  // ============================================
  const { data: notificationStats } = useQuery({
    queryKey: ['notificationStats'],
    queryFn: async () => {
      try {
        const response = await notificationsService.getNotifications()
        return {
          total: response.data?.length || 0,
          unread: response.data?.filter(n => !n.est_lu).length || 0
        }
      } catch (error) {
        return { total: 0, unread: 0 }
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 3. CONFIGURATION DES ONGLETS
  // ============================================
  const tabs = [
    { id: 'apparence', name: 'Apparence', icon: PaintBrushIcon, description: 'Personnalisez l\'apparence de l\'application' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Gérez vos préférences de notifications', badge: notificationStats?.unread },
    { id: 'confidentialite', name: 'Confidentialité', icon: EyeIcon, description: 'Contrôlez qui peut voir vos informations' },
    { id: 'securite', name: 'Sécurité', icon: ShieldCheckIcon, description: 'Paramètres de sécurité de votre compte' },
    { id: 'preferences', name: 'Préférences', icon: UserIcon, description: 'Préférences générales de l\'application' },
  ]

  // ============================================
  // 4. FONCTIONS DE MISE À JOUR
  // ============================================
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    localStorage.setItem(key, value.toString())

    // Appliquer les effets immédiats
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    if (key === 'fontSize') {
      document.documentElement.style.fontSize =
        value === 'small' ? '14px' : value === 'large' ? '18px' : '16px'
    }
  }

  const handleSave = () => {
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString())
    })
    toast.success('Paramètres enregistrés avec succès')
    setIsEditing(false)
  }

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      language: 'fr',
      fontSize: 'normal',
      compactMode: false,
      reducedMotion: false,
      emailNotifications: true,
      pushNotifications: true,
      notificationSounds: true,
      notifyNewNotes: true,
      notifySuggestions: true,
      notifyMessages: true,
      notifyEvents: true,
      notifyGrades: true,
      notifyComments: true,
      quietHours: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false,
      showBirthdate: false,
      showAddress: false,
      allowMessagesFrom: 'everyone',
      allowFriendRequests: true,
      activityStatus: true,
      twoFactorAuth: false,
      sessionTimeout: '30',
      loginAlerts: true,
      deviceHistory: true,
      autoLogout: true,
      ipTracking: false,
      defaultDashboard: 'overview',
      itemsPerPage: '20',
      dateFormat: 'dd/mm/yyyy',
      timeFormat: '24h',
      firstDayOfWeek: 'monday',
    }
    setSettings(defaultSettings)
    Object.entries(defaultSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString())
    })
    toast.success('Paramètres réinitialisés')
    setIsEditing(false)
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
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

    // Simuler le changement de mot de passe
    toast.success('Mot de passe modifié avec succès')
    setShowPasswordModal(false)
    setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
  }

  const handleExportData = () => {
    const userData = {
      profile: user,
      settings: settings,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `academic-twins-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    toast.success('Données exportées avec succès')
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Paramètres</h1>
          <p className="text-secondary-600 mt-1">Personnalisez votre expérience sur Academic Twins</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleExportData}
                className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors flex items-center gap-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Exporter
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors flex items-center gap-2"
              >
                <KeyIcon className="h-5 w-5" />
                Mot de passe
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <PaintBrushIcon className="h-5 w-5" />
                Modifier
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors flex items-center gap-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Réinitialiser
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="h-5 w-5" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckIcon className="h-5 w-5" />
                Enregistrer
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Tabs avec animations */}
      <div className="border-b border-secondary-200">
        <nav className="flex space-x-8 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 px-1 flex items-center gap-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Description de l'onglet */}
      <motion.p
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-secondary-500 italic"
      >
        {tabs.find(t => t.id === activeTab)?.description}
      </motion.p>

      {/* Contenu des onglets avec animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6"
        >
          {/* Apparence */}
          {activeTab === 'apparence' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Apparence</h3>

              {/* Thème */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Thème
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => isEditing && updateSetting('theme', 'light')}
                      disabled={!isEditing}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-secondary-200 hover:border-primary-200'
                      } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <SunIcon className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <span className="text-sm font-medium text-secondary-700">Clair</span>
                    </button>

                    <button
                      onClick={() => isEditing && updateSetting('theme', 'dark')}
                      disabled={!isEditing}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-secondary-200 hover:border-primary-200'
                      } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <MoonIcon className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                      <span className="text-sm font-medium text-secondary-700">Sombre</span>
                    </button>
                  </div>
                </div>

                {/* Langue */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Langue
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => isEditing && updateSetting('language', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50 disabled:text-secondary-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                  </select>
                </div>
              </div>

              {/* Taille de police */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Taille de police
                </label>
                <div className="flex gap-3">
                  {['small', 'normal', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => isEditing && updateSetting('fontSize', size)}
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                        settings.fontSize === size
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-secondary-200 hover:border-primary-200'
                      } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <span className="block text-sm font-medium text-secondary-700">
                        {size === 'small' ? 'Petite' : size === 'normal' ? 'Normale' : 'Grande'}
                      </span>
                      <span className="text-xs text-secondary-500 mt-1 block">
                        {size === 'small' ? '14px' : size === 'normal' ? '16px' : '18px'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options avancées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Mode compact</p>
                    <p className="text-sm text-secondary-500">Afficher plus d'informations sur une seule page</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onChange={(checked) => isEditing && updateSetting('compactMode', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.compactMode ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Réduction des animations</p>
                    <p className="text-sm text-secondary-500">Limiter les animations pour de meilleures performances</p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onChange={(checked) => isEditing && updateSetting('reducedMotion', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.reducedMotion ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Notifications</h3>
                <div className="flex items-center gap-2 text-sm bg-secondary-100 px-3 py-1 rounded-full">
                  <BellAlertIcon className="h-4 w-4 text-primary-600" />
                  <span>{notificationStats?.unread || 0} non lues</span>
                </div>
              </div>

              {/* Canaux de notification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">Email</p>
                      <p className="text-xs text-secondary-500">Recevoir par email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(checked) => isEditing && updateSetting('emailNotifications', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.emailNotifications ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">Push</p>
                      <p className="text-xs text-secondary-500">Notifications mobiles</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(checked) => isEditing && updateSetting('pushNotifications', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.pushNotifications ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <SpeakerWaveIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">Sons</p>
                      <p className="text-xs text-secondary-500">Alertes sonores</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notificationSounds}
                    onChange={(checked) => isEditing && updateSetting('notificationSounds', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.notificationSounds ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.notificationSounds ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">Heures silencieuses</p>
                      <p className="text-xs text-secondary-500">Ne pas déranger</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.quietHours}
                    onChange={(checked) => isEditing && updateSetting('quietHours', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.quietHours ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.quietHours ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>

              {/* Plage horaire silencieuse */}
              {settings.quietHours && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Début
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => isEditing && updateSetting('quietHoursStart', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Fin
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => isEditing && updateSetting('quietHoursEnd', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                    />
                  </div>
                </motion.div>
              )}

              {/* Types de notifications */}
              <div className="pt-4 border-t border-secondary-200">
                <h4 className="font-medium text-secondary-900 mb-4">Types de notifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'notifyNewNotes', label: 'Nouvelles notes', icon: '📝' },
                    { key: 'notifySuggestions', label: 'Suggestions IA', icon: '🤖' },
                    { key: 'notifyMessages', label: 'Messages', icon: '💬' },
                    { key: 'notifyEvents', label: 'Événements', icon: '📅' },
                    { key: 'notifyGrades', label: 'Mises à jour de notes', icon: '📊' },
                    { key: 'notifyComments', label: 'Commentaires', icon: '💭' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-secondary-700">{item.label}</span>
                      </div>
                      <Switch
                        checked={settings[item.key]}
                        onChange={(checked) => isEditing && updateSetting(item.key, checked)}
                        disabled={!isEditing}
                        className={`${
                          settings[item.key] ? 'bg-primary-600' : 'bg-secondary-300'
                        } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                          !isEditing && 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className={`${
                            settings[item.key] ? 'translate-x-5' : 'translate-x-1'
                          } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confidentialité */}
          {activeTab === 'confidentialite' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Confidentialité</h3>

              {/* Visibilité du profil */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Visibilité du profil
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'public', label: 'Public', desc: 'Tout le monde peut voir votre profil', icon: '🌍' },
                    { value: 'private', label: 'Privé', desc: 'Utilisateurs connectés uniquement', icon: '🔒' },
                    { value: 'contacts', label: 'Contacts', desc: 'Seulement vos contacts', icon: '👥' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        settings.profileVisibility === option.value
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-secondary-200 hover:border-primary-200'
                      } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={settings.profileVisibility === option.value}
                        onChange={(e) => isEditing && updateSetting('profileVisibility', e.target.value)}
                        disabled={!isEditing}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <span className="text-3xl mb-2 block">{option.icon}</span>
                        <p className="font-medium text-secondary-900">{option.label}</p>
                        <p className="text-xs text-secondary-500 mt-1">{option.desc}</p>
                      </div>
                      {settings.profileVisibility === option.value && (
                        <CheckIcon className="absolute top-2 right-2 h-4 w-4 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Informations visibles */}
              <div className="pt-4 border-t border-secondary-200">
                <h4 className="font-medium text-secondary-900 mb-4">Informations visibles</h4>
                <div className="space-y-3">
                  {[
                    { key: 'showEmail', label: 'Adresse email', icon: '📧' },
                    { key: 'showPhone', label: 'Numéro de téléphone', icon: '📱' },
                    { key: 'showBirthdate', label: 'Date de naissance', icon: '🎂' },
                    { key: 'showAddress', label: 'Adresse', icon: '🏠' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-secondary-700">{item.label}</span>
                      </div>
                      <Switch
                        checked={settings[item.key]}
                        onChange={(checked) => isEditing && updateSetting(item.key, checked)}
                        disabled={!isEditing}
                        className={`${
                          settings[item.key] ? 'bg-primary-600' : 'bg-secondary-300'
                        } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                          !isEditing && 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className={`${
                            settings[item.key] ? 'translate-x-5' : 'translate-x-1'
                          } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactions */}
              <div className="pt-4 border-t border-secondary-200">
                <h4 className="font-medium text-secondary-900 mb-4">Interactions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                    <div>
                      <p className="font-medium text-secondary-900">Messages de qui ?</p>
                      <p className="text-xs text-secondary-500">Qui peut vous envoyer des messages</p>
                    </div>
                    <select
                      value={settings.allowMessagesFrom}
                      onChange={(e) => isEditing && updateSetting('allowMessagesFrom', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-1 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                    >
                      <option value="everyone">Tout le monde</option>
                      <option value="contacts">Contacts uniquement</option>
                      <option value="none">Personne</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                    <div>
                      <p className="font-medium text-secondary-900">Demandes d'amis</p>
                      <p className="text-xs text-secondary-500">Autoriser les demandes d'amis</p>
                    </div>
                    <Switch
                      checked={settings.allowFriendRequests}
                      onChange={(checked) => isEditing && updateSetting('allowFriendRequests', checked)}
                      disabled={!isEditing}
                      className={`${
                        settings.allowFriendRequests ? 'bg-primary-600' : 'bg-secondary-300'
                      } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        !isEditing && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`${
                          settings.allowFriendRequests ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                    <div>
                      <p className="font-medium text-secondary-900">Statut d'activité</p>
                      <p className="text-xs text-secondary-500">Montrer quand vous êtes en ligne</p>
                    </div>
                    <Switch
                      checked={settings.activityStatus}
                      onChange={(checked) => isEditing && updateSetting('activityStatus', checked)}
                      disabled={!isEditing}
                      className={`${
                        settings.activityStatus ? 'bg-primary-600' : 'bg-secondary-300'
                      } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        !isEditing && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`${
                          settings.activityStatus ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sécurité */}
          {activeTab === 'securite' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Sécurité</h3>

              {/* Double authentification */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <LockClosedIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Authentification à deux facteurs</p>
                    <p className="text-sm text-secondary-500">Sécurisez votre compte avec une vérification en deux étapes</p>
                  </div>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(checked) => isEditing && updateSetting('twoFactorAuth', checked)}
                  disabled={!isEditing}
                  className={`${
                    settings.twoFactorAuth ? 'bg-purple-600' : 'bg-secondary-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    !isEditing && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              {/* Options de sécurité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Alertes de connexion</p>
                    <p className="text-xs text-secondary-500">Email lors des nouvelles connexions</p>
                  </div>
                  <Switch
                    checked={settings.loginAlerts}
                    onChange={(checked) => isEditing && updateSetting('loginAlerts', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.loginAlerts ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.loginAlerts ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Historique appareils</p>
                    <p className="text-xs text-secondary-500">Garder l'historique des connexions</p>
                  </div>
                  <Switch
                    checked={settings.deviceHistory}
                    onChange={(checked) => isEditing && updateSetting('deviceHistory', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.deviceHistory ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.deviceHistory ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Déconnexion automatique</p>
                    <p className="text-xs text-secondary-500">Après période d'inactivité</p>
                  </div>
                  <Switch
                    checked={settings.autoLogout}
                    onChange={(checked) => isEditing && updateSetting('autoLogout', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.autoLogout ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.autoLogout ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">Suivi IP</p>
                    <p className="text-xs text-secondary-500">Enregistrer les adresses IP</p>
                  </div>
                  <Switch
                    checked={settings.ipTracking}
                    onChange={(checked) => isEditing && updateSetting('ipTracking', checked)}
                    disabled={!isEditing}
                    className={`${
                      settings.ipTracking ? 'bg-primary-600' : 'bg-secondary-300'
                    } relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      !isEditing && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`${
                        settings.ipTracking ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>

              {/* Délai d'expiration */}
              <div className="p-4 bg-secondary-50 rounded-xl">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Délai d'expiration de session
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => isEditing && updateSetting('sessionTimeout', e.target.value)}
                  disabled={!isEditing}
                  className="w-full md:w-64 px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="120">2 heures</option>
                  <option value="240">4 heures</option>
                  <option value="480">8 heures</option>
                </select>
                <p className="text-xs text-secondary-500 mt-2">
                  Après cette période d'inactivité, vous serez déconnecté automatiquement
                </p>
              </div>
            </div>
          )}

          {/* Préférences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Préférences générales</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dashboard par défaut */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Dashboard par défaut
                  </label>
                  <select
                    value={settings.defaultDashboard}
                    onChange={(e) => isEditing && updateSetting('defaultDashboard', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                  >
                    <option value="overview">Vue d'ensemble</option>
                    <option value="notes">Notes</option>
                    <option value="calendar">Calendrier</option>
                    <option value="messages">Messages</option>
                  </select>
                </div>

                {/* Éléments par page */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Éléments par page
                  </label>
                  <select
                    value={settings.itemsPerPage}
                    onChange={(e) => isEditing && updateSetting('itemsPerPage', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                {/* Format de date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Format de date
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => isEditing && updateSetting('dateFormat', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                  >
                    <option value="dd/mm/yyyy">31/12/2024</option>
                    <option value="mm/dd/yyyy">12/31/2024</option>
                    <option value="yyyy-mm-dd">2024-12-31</option>
                  </select>
                </div>

                {/* Format d'heure */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Format d'heure
                  </label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => isEditing && updateSetting('timeFormat', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                  >
                    <option value="24h">24h (14:30)</option>
                    <option value="12h">12h (2:30 PM)</option>
                  </select>
                </div>

                {/* Premier jour de la semaine */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Premier jour de la semaine
                  </label>
                  <select
                    value={settings.firstDayOfWeek}
                    onChange={(e) => isEditing && updateSetting('firstDayOfWeek', e.target.value)}
                    disabled={!isEditing}
                    className="w-full md:w-64 px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-secondary-50"
                  >
                    <option value="monday">Lundi</option>
                    <option value="sunday">Dimanche</option>
                    <option value="saturday">Samedi</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal changement mot de passe */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
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
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                  >
                    Changer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton déconnexion */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={logout}
        className="w-full mt-6 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        Déconnexion
      </motion.button>
    </div>
  )
}

export default ParametresPage