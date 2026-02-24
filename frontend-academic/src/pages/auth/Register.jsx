import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const Register = () => {
  const [step, setStep] = useState(1)
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  // Images de fond
  const backgroundImages = [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d3c6b3b7f4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80'
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Rediriger si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.username || !formData.email || !formData.password || !formData.password2) {
        toast.error('Veuillez remplir tous les champs obligatoires')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast.error('Format d\'email invalide')
        return
      }

      if (formData.password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères')
        return
      }

      if (formData.password !== formData.password2) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
    }
    setStep(step + 1)
  }

  const handlePrev = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (formData.role === 'etudiant') {
      if (!formData.filiere || !formData.niveau) {
        toast.error('Veuillez remplir votre filière et niveau')
        setLoading(false)
        return
      }
    } else if (formData.role === 'professeur') {
      if (!formData.specialite) {
        toast.error('Veuillez renseigner votre spécialité')
        setLoading(false)
        return
      }
    }

    const dataToSend = { ...formData }

    if (formData.role === 'etudiant') {
      dataToSend.filiere = formData.filiere || ''
      dataToSend.niveau = formData.niveau || ''
      dataToSend.numero_etudiant = formData.numero_etudiant || ''
      delete dataToSend.specialite
    } else if (formData.role === 'professeur') {
      dataToSend.specialite = formData.specialite || ''
      delete dataToSend.filiere
      delete dataToSend.niveau
      delete dataToSend.numero_etudiant
    }

    const result = await register(dataToSend)

    if (result.success) {
      if (formData.role === 'professeur') {
        toast.success('Inscription réussie ! Votre compte sera activé par un administrateur.')
      } else {
        toast.success('Inscription réussie !')
      }
      navigate('/login')
    } else {
      if (typeof result.error === 'object') {
        Object.entries(result.error).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            errors.forEach(error => toast.error(`${field}: ${error}`))
          } else {
            toast.error(errors)
          }
        })
      } else {
        toast.error(result.error || 'Erreur lors de l\'inscription')
      }
    }

    setLoading(false)
  }

  const steps = [
    { number: 1, title: 'Informations de base', icon: '📝' },
    { number: 2, title: 'Détails du compte', icon: '👤' },
    { number: 3, title: 'Confirmation', icon: '✅' },
  ]

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-black">
      {/* Images en fond - sans aucun overlay de couleur */}
      {backgroundImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Contenu */}
      <div className="relative z-10 flex w-full min-h-screen overflow-y-auto">
        {/* Côté gauche - Marque (caché sur mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white sticky top-0 h-screen"
        >
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-black/30 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Academic Twins</h1>
                <p className="text-white/70 text-sm">Plateforme de gestion académique</p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-5xl font-bold leading-tight">
                Rejoignez<br />notre communauté<br />d'apprenants
              </h2>

              <div className="space-y-4">
                {[
                  { icon: '🎓', text: 'Accédez à des ressources pédagogiques de qualité' },
                  { icon: '📊', text: 'Suivez votre progression en temps réel' },
                  { icon: '🤖', text: 'Bénéficiez de suggestions personnalisées par IA' },
                  { icon: '💬', text: 'Échangez avec vos camarades et professeurs' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-white/60 text-sm">
            © 2026 Academic Twins. Tous droits réservés.
          </div>
        </motion.div>

        {/* Côté droit - Formulaire */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 py-12"
        >
          <div className="w-full max-w-lg">
            {/* Logo mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Academic Twins</h2>
            </div>

            {/* Carte d'inscription avec fond noir transparent */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl p-14 border border-white/20">

              {/* Stepper */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((s, index) => (
                    <React.Fragment key={s.number}>
                      <div className="flex items-center">
                        <div className={`relative`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            step > s.number 
                              ? 'bg-white/30 text-white'
                              : step === s.number
                              ? 'bg-white/20 text-white border-2 border-white/50'
                              : 'bg-white/10 text-white/50'
                          }`}>
                            {step > s.number ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              s.icon
                            )}
                          </div>
                          <span className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${
                            step >= s.number ? 'text-white/80 font-medium' : 'text-white/40'
                          }`}>
                            {s.title}
                          </span>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${
                          step > index + 1 ? 'bg-white/30' : 'bg-white/10'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {/* Étape 1 */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">Informations de base</h3>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Nom d'utilisateur
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                            👤
                          </span>
                          <input
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                            placeholder="jean.dupont"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                            📧
                          </span>
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                            placeholder="jean@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Mot de passe
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                              🔒
                            </span>
                            <input
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                            >
                              {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Confirmation
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                              🔒
                            </span>
                            <input
                              name="password2"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formData.password2}
                              onChange={handleChange}
                              className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                            >
                              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Étape 2 */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">Détails du compte</h3>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Type de compte
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white"
                        >
                          <option value="etudiant" className="bg-gray-900">👨‍🎓 Étudiant</option>
                          <option value="professeur" className="bg-gray-900">👨‍🏫 Professeur</option>
                        </select>
                      </div>

                      {formData.role === 'etudiant' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Filière
                            </label>
                            <select
                              name="filiere"
                              value={formData.filiere}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white"
                            >
                              <option value="" className="bg-gray-900">Sélectionnez une filière</option>
                              <option value="Informatique" className="bg-gray-900">💻 Informatique</option>
                              <option value="Mathématiques" className="bg-gray-900">📐 Mathématiques</option>
                              <option value="Physique" className="bg-gray-900">⚛️ Physique</option>
                              <option value="Chimie" className="bg-gray-900">🧪 Chimie</option>
                              <option value="Biologie" className="bg-gray-900">🧬 Biologie</option>
                              <option value="Gestion" className="bg-gray-900">📊 Gestion</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Niveau
                            </label>
                            <select
                              name="niveau"
                              value={formData.niveau}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white"
                            >
                              <option value="" className="bg-gray-900">Sélectionnez un niveau</option>
                              <option value="L1" className="bg-gray-900">Licence 1</option>
                              <option value="L2" className="bg-gray-900">Licence 2</option>
                              <option value="L3" className="bg-gray-900">Licence 3</option>
                              <option value="M1" className="bg-gray-900">Master 1</option>
                              <option value="M2" className="bg-gray-900">Master 2</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Numéro étudiant
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                                🆔
                              </span>
                              <input
                                name="numero_etudiant"
                                type="text"
                                value={formData.numero_etudiant}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                                placeholder="2024001"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {formData.role === 'professeur' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Spécialité
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                                🔬
                              </span>
                              <input
                                name="specialite"
                                type="text"
                                value={formData.specialite}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                                placeholder="Ex: Mathématiques, Physique..."
                                required
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Téléphone (optionnel)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                            📱
                          </span>
                          <input
                            name="telephone"
                            type="tel"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 outline-none transition-all bg-white/10 text-white placeholder-white/50"
                            placeholder="61234567"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Étape 3 */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">Confirmation</h3>

                      <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-white/50">Nom d'utilisateur</p>
                            <p className="font-medium text-white">{formData.username}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/50">Email</p>
                            <p className="font-medium text-white">{formData.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/50">Rôle</p>
                            <p className="font-medium text-white capitalize">
                              {formData.role === 'etudiant' ? '👨‍🎓 Étudiant' : '👨‍🏫 Professeur'}
                            </p>
                          </div>

                          {formData.role === 'etudiant' && (
                            <>
                              {formData.filiere && (
                                <div>
                                  <p className="text-xs text-white/50">Filière</p>
                                  <p className="font-medium text-white">{formData.filiere}</p>
                                </div>
                              )}
                              {formData.niveau && (
                                <div>
                                  <p className="text-xs text-white/50">Niveau</p>
                                  <p className="font-medium text-white">{formData.niveau}</p>
                                </div>
                              )}
                              {formData.numero_etudiant && (
                                <div>
                                  <p className="text-xs text-white/50">Numéro étudiant</p>
                                  <p className="font-medium text-white">{formData.numero_etudiant}</p>
                                </div>
                              )}
                            </>
                          )}

                          {formData.role === 'professeur' && formData.specialite && (
                            <div>
                              <p className="text-xs text-white/50">Spécialité</p>
                              <p className="font-medium text-white">{formData.specialite}</p>
                            </div>
                          )}

                          {formData.telephone && (
                            <div>
                              <p className="text-xs text-white/50">Téléphone</p>
                              <p className="font-medium text-white">{formData.telephone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <p className="text-sm text-white/80 flex items-center gap-2">
                          <span>ℹ️</span>
                          {formData.role === 'professeur'
                            ? "Votre compte professeur sera activé après validation par un administrateur."
                            : "En cliquant sur 'S'inscrire', vous acceptez nos conditions d'utilisation."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-lg border border-white/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Précédent
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="ml-auto px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] flex items-center gap-2 backdrop-blur-lg border border-white/30"
                    >
                      Suivant
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-auto px-6 py-3 bg-white/30 hover:bg-white/40 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2 backdrop-blur-lg border border-white/40"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Inscription...
                        </>
                      ) : (
                        <>
                          S'inscrire
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/70">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-white hover:text-white/80 font-medium inline-flex items-center gap-1">
                    Se connecter
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register