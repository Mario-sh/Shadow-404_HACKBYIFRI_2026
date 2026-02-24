import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  BookOpenIcon,
  PlusCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  LinkIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const CreationExercicePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    subject_id: '',
    niveau_difficulte: '1',
    Type_ressource: 'pdf',
    fichier_url: '',
    consigne: '',
    duree_estimee: 30,
    points: 100,
    tags: ''
  })

  // ============================================
  // 1. RÉCUPÉRER LES MATIÈRES
  // ============================================
  const { data: matieresData } = useQuery({
    queryKey: ['matieres'],
    queryFn: async () => {
      try {
        const response = await academicService.getMatieres()
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération matières:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. MUTATION POUR CRÉER L'EXERCICE
  // ============================================
  const createExerciceMutation = useMutation({
    mutationFn: (data) => academicService.createExercice(data),
    onSuccess: () => {
      toast.success('Exercice créé avec succès !')
      navigate('/exercices')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création')
      console.error(error)
    }
  })

  // ============================================
  // 3. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const matieres = Array.isArray(matieresData) ? matieresData : []

  // ============================================
  // 4. GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.titre || !formData.subject_id || !formData.consigne) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    const dataToSend = {
      ...formData,
      niveau_difficulte: parseInt(formData.niveau_difficulte),
      duree_estimee: parseInt(formData.duree_estimee),
      points: parseInt(formData.points),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      cree_par: user?.id
    }

    createExerciceMutation.mutate(dataToSend)
  }

  const handleCancel = () => {
    if (window.confirm('Voulez-vous annuler la création ? Les données non sauvegardées seront perdues.')) {
      navigate('/exercices')
    }
  }

  // ============================================
  // 5. CONFIGURATION
  // ============================================
  const difficultyConfig = {
    1: { label: 'Facile', color: 'text-green-700', bg: 'bg-green-100', icon: '🌱' },
    2: { label: 'Moyen', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: '📚' },
    3: { label: 'Difficile', color: 'text-red-700', bg: 'bg-red-100', icon: '⚡' },
  }

  const typeIcons = {
    pdf: { icon: DocumentTextIcon, color: 'text-red-500', bg: 'bg-red-100' },
    video: { icon: VideoCameraIcon, color: 'text-blue-500', bg: 'bg-blue-100' },
    lien: { icon: LinkIcon, color: 'text-green-500', bg: 'bg-green-100' },
    document: { icon: DocumentTextIcon, color: 'text-purple-500', bg: 'bg-purple-100' },
  }

  const currentDifficulty = difficultyConfig[formData.niveau_difficulte]

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête avec animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <SparklesIcon className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Créer un exercice</h1>
              <p className="text-primary-100">Créez un nouvel exercice pour vos étudiants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Titre de l'exercice <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Exercices sur les dérivées partielles"
              className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Décrivez l'exercice, les objectifs, les prérequis..."
              className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          {/* Consigne */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Consigne <span className="text-red-500">*</span>
            </label>
            <textarea
              name="consigne"
              value={formData.consigne}
              onChange={handleChange}
              rows="4"
              placeholder="Instructions détaillées pour les étudiants..."
              className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              required
            />
          </div>

          {/* Ligne 1: Matière et Difficulté */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Matière <span className="text-red-500">*</span>
              </label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map(m => (
                  <option key={m.id_matiere} value={m.id_matiere}>{m.nom_matière}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Niveau de difficulté <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((niveau) => {
                  const diff = difficultyConfig[niveau]
                  return (
                    <button
                      key={niveau}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, niveau_difficulte: niveau.toString() }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.niveau_difficulte === niveau.toString()
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-primary-200'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{diff.icon}</span>
                      <span className={`text-xs font-medium ${diff.color}`}>{diff.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Ligne 2: Type et Durée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Type de ressource <span className="text-red-500">*</span>
              </label>
              <select
                name="Type_ressource"
                value={formData.Type_ressource}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              >
                <option value="pdf">PDF</option>
                <option value="video">Vidéo</option>
                <option value="lien">Lien externe</option>
                <option value="document">Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Durée estimée (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duree_estimee"
                value={formData.duree_estimee}
                onChange={handleChange}
                min="5"
                max="300"
                className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              />
            </div>
          </div>

          {/* Ligne 3: Points et URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Points <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="0"
                max="500"
                className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                URL / Fichier
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="fichier_url"
                  value={formData.fichier_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200"
                  title="Uploader un fichier"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="mathématiques, dérivées, exercices"
              className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          {/* Aperçu des points */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
            <h3 className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              Récapitulatif
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-primary-600">Points maximum</p>
                <p className="text-lg font-bold text-primary-800">{formData.points} pts</p>
              </div>
              <div>
                <p className="text-xs text-primary-600">Durée estimée</p>
                <p className="text-lg font-bold text-primary-800">{formData.duree_estimee} min</p>
              </div>
              <div>
                <p className="text-xs text-primary-600">Difficulté</p>
                <p className="text-lg font-bold text-primary-800 flex items-center gap-1">
                  <span>{currentDifficulty?.icon}</span>
                  <span>{currentDifficulty?.label}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-600">Type</p>
                <p className="text-lg font-bold text-primary-800 capitalize">{formData.Type_ressource}</p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createExerciceMutation.isLoading}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {createExerciceMutation.isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <PlusCircleIcon className="h-5 w-5" />
                  Créer l'exercice
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Conseils */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <AcademicCapIcon className="h-5 w-5" />
          💡 Conseils pour créer un bon exercice
        </h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Soyez précis dans la consigne pour éviter les ambiguïtés</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Indiquez clairement le barème et les critères d'évaluation</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Ajoutez des ressources complémentaires (PDF, vidéos) pour aider les étudiants</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Testez l'exercice vous-même pour vérifier la durée estimée</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Utilisez des tags pour faciliter la recherche et le classement</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CreationExercicePage