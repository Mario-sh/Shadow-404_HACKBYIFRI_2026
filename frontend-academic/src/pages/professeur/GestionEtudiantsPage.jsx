import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  EyeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import ExportButton from '../../components/common/ExportButton'
import { exportService } from '../../services/export'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const GestionEtudiantsPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClasse, setSelectedClasse] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedEtudiant, setSelectedEtudiant] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // ============================================
  // 1. RÉCUPÉRER LES ÉTUDIANTS
  // ============================================
  const { data: etudiantsData, isLoading, refetch } = useQuery({
    queryKey: ['etudiants', selectedClasse, selectedStatus, searchTerm],
    queryFn: async () => {
      try {
        const params = {}
        if (selectedClasse !== 'all') params.classe = selectedClasse
        if (searchTerm) params.search = searchTerm

        const response = await academicService.getEtudiants(params)
        console.log('📚 Étudiants reçus:', response.data)

        let etudiants = response.data?.results || response.data || []

        // Filtrer par statut (en difficulté ou non)
        if (selectedStatus === 'difficile') {
          const difficiles = await academicService.getEtudiantsEnDifficulte()
          const idsDifficiles = new Set(difficiles.data.map(e => e.id_student))
          etudiants = etudiants.filter(e => idsDifficiles.has(e.id_student))
        }

        return etudiants
      } catch (error) {
        console.error('❌ Erreur récupération étudiants:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 2. RÉCUPÉRER LES CLASSES
  // ============================================
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const response = await academicService.getClasses()
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération classes:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 3. RÉCUPÉRER LES STATISTIQUES D'UN ÉTUDIANT
  // ============================================
  const { data: etudiantStats, refetch: refetchStats } = useQuery({
    queryKey: ['etudiantStats', selectedEtudiant?.id_student],
    queryFn: async () => {
      if (!selectedEtudiant?.id_student) return null
      try {
        const response = await academicService.getStatistiques(selectedEtudiant.id_student)
        return response.data
      } catch (error) {
        console.error('❌ Erreur récupération stats étudiant:', error)
        return null
      }
    },
    enabled: !!selectedEtudiant?.id_student && showDetailsModal
  })

  // ============================================
  // 4. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const etudiants = Array.isArray(etudiantsData) ? etudiantsData : []
  const classes = Array.isArray(classesData) ? classesData : []

  // ============================================
  // 5. FILTRES
  // ============================================
  const filteredEtudiants = etudiants.filter(etudiant => {
    if (selectedClasse !== 'all' && etudiant.classe_id !== parseInt(selectedClasse)) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return etudiant.nom?.toLowerCase().includes(searchLower) ||
             etudiant.prenom?.toLowerCase().includes(searchLower) ||
             etudiant.matricule?.toLowerCase().includes(searchLower) ||
             etudiant.email?.toLowerCase().includes(searchLower)
    }
    return true
  })

  // ============================================
  // 6. FONCTIONS
  // ============================================
  const handleViewDetails = (etudiant) => {
    setSelectedEtudiant(etudiant)
    setShowDetailsModal(true)
  }

  const getNoteColor = (note) => {
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête avec bouton d'export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des étudiants</h1>
          <p className="text-secondary-600 mt-1">
            {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''} trouvé{filteredEtudiants.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredEtudiants}
            filename="etudiants"
            formatFunction={exportService.formatEtudiants}
            title="Exporter"
          />
          <button
            onClick={() => refetch()}
            className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5 text-secondary-600" />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom, matricule..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id_classe} value={c.id_classe}>{c.nom_class}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous les étudiants</option>
            <option value="difficile">En difficulté</option>
          </select>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Étudiant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Matricule</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Classe</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredEtudiants.map((etudiant) => (
                <tr key={etudiant.id_student} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{etudiant.prenom} {etudiant.nom}</p>
                        <p className="text-xs text-secondary-500">ID: {etudiant.id_student}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{etudiant.matricule}</td>
                  <td className="px-6 py-4 text-secondary-600">{etudiant.classe_nom}</td>
                  <td className="px-6 py-4 text-secondary-600">{etudiant.email}</td>
                  <td className="px-6 py-4 text-secondary-600">{etudiant.telephone || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(etudiant)}
                        className="p-2 hover:bg-secondary-100 rounded-lg"
                        title="Voir détails"
                      >
                        <EyeIcon className="h-5 w-5 text-blue-600" />
                      </button>
                      <Link
                        to={`/notes/saisie?etudiant=${etudiant.id_student}`}
                        className="p-2 hover:bg-secondary-100 rounded-lg"
                        title="Saisir notes"
                      >
                        <PencilSquareIcon className="h-5 w-5 text-green-600" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEtudiants.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucun étudiant trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Détails Étudiant */}
      {showDetailsModal && selectedEtudiant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* ... (contenu du modal inchangé) ... */}
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionEtudiantsPage