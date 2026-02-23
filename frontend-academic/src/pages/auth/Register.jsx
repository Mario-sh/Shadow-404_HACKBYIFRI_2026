import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import {
  AcademicCapIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  IdentificationIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

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
    telephone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

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
      if (formData.password !== formData.password2) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
      if (formData.password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères')
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

    const result = await register(formData)

    if (result.success) {
      toast.success('Inscription réussie !')
      navigate('/')
    } else {
      if (typeof result.error === 'object') {
        Object.values(result.error).forEach(err => {
          toast.error(err)
        })
      } else {
        toast.error(result.error)
      }
    }

    setLoading(false)
  }

  const steps = [
    { number: 1, title: 'Informations de base', icon: UserIcon },
    { number: 2, title: 'Détails académiques', icon: AcademicCapIcon },
    { number: 3, title: 'Confirmation', icon: CheckCircleIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-primary-900 to-secondary-900 flex items-center justify-center p-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-2xl w-full relative animate-slide-up">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
          <p className="text-primary-200 mt-2">Rejoignez Academic Twins</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    step > s.number 
                      ? 'bg-primary-500 border-primary-500 text-white' 
                      : step === s.number
                      ? 'border-primary-500 text-primary-500 bg-white'
                      : 'border-secondary-300 text-secondary-300 bg-white'
                  }`}>
                    {step > s.number ? <CheckCircleIcon className="h-5 w-5" /> : s.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= s.number ? 'text-white' : 'text-secondary-300'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > index + 1 ? 'bg-primary-500' : 'bg-secondary-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Carte d'inscription */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit}>
            {/* Étape 1: Informations de base */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">Informations de base</h3>

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      placeholder="john_doe"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-primary-600 transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      name="password2"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.password2}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-primary-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Détails académiques */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">Détails académiques</h3>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Rôle
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="professeur">Professeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                {formData.role === 'etudiant' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Filière
                      </label>
                      <select
                        name="filiere"
                        value={formData.filiere}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      >
                        <option value="">Sélectionnez une filière</option>
                        <option value="Informatique">Informatique</option>
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Physique">Physique</option>
                        <option value="Chimie">Chimie</option>
                        <option value="Biologie">Biologie</option>
                        <option value="Lettres">Lettres</option>
                        <option value="Droit">Droit</option>
                        <option value="Economie">Économie</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Niveau
                      </label>
                      <select
                        name="niveau"
                        value={formData.niveau}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="L1">Licence 1</option>
                        <option value="L2">Licence 2</option>
                        <option value="L3">Licence 3</option>
                        <option value="M1">Master 1</option>
                        <option value="M2">Master 2</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Numéro étudiant
                      </label>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          name="numero_etudiant"
                          type="text"
                          value={formData.numero_etudiant}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                          placeholder="2024001"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-secondary-50 text-secondary-900"
                      placeholder="61234567"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">Vérifiez vos informations</h3>

                <div className="bg-primary-50 p-6 rounded-xl border border-primary-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-600">Nom d'utilisateur</p>
                      <p className="font-medium text-secondary-900">{formData.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Email</p>
                      <p className="font-medium text-secondary-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Rôle</p>
                      <p className="font-medium text-secondary-900 capitalize">{formData.role}</p>
                    </div>
                    {formData.filiere && (
                      <div>
                        <p className="text-sm text-secondary-600">Filière</p>
                        <p className="font-medium text-secondary-900">{formData.filiere}</p>
                      </div>
                    )}
                    {formData.niveau && (
                      <div>
                        <p className="text-sm text-secondary-600">Niveau</p>
                        <p className="font-medium text-secondary-900">{formData.niveau}</p>
                      </div>
                    )}
                    {formData.numero_etudiant && (
                      <div>
                        <p className="text-sm text-secondary-600">Numéro étudiant</p>
                        <p className="font-medium text-secondary-900">{formData.numero_etudiant}</p>
                      </div>
                    )}
                    {formData.telephone && (
                      <div>
                        <p className="text-sm text-secondary-600">Téléphone</p>
                        <p className="font-medium text-secondary-900">{formData.telephone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    En cliquant sur "S'inscrire", vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 bg-secondary-100 text-secondary-700 rounded-xl font-medium hover:bg-secondary-200 transition-colors"
                >
                  Précédent
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-colors flex items-center gap-2"
                >
                  Suivant
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                      <CheckCircleIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group">
                Se connecter
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register