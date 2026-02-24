import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  AcademicCapIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import ExportButton from '../../components/common/ExportButton'
import { exportService } from '../../services/export'

const NotesPage = () => {
  const { user } = useAuth()
  const [etudiantId, setEtudiantId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMatiere, setSelectedMatiere] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')

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
  // 2. RÉCUPÉRER LES NOTES
  // ============================================
  const { data: notesData, isLoading: notesLoading, refetch } = useQuery({
    queryKey: ['notes', user?.role, user?.id, etudiantId],
    queryFn: async () => {
      try {
        if (user?.role === 'etudiant' && etudiantId) {
          const response = await academicService.getNotes(etudiantId)
          return Array.isArray(response.data) ? response.data :
                 response.data?.results ? response.data.results : []
        } else if (user?.role === 'professeur' || user?.role === 'admin') {
          const response = await academicService.getNotesRecentes(100)
          return Array.isArray(response.data) ? response.data :
                 response.data?.results ? response.data.results : []
        }
        return []
      } catch (error) {
        console.error('❌ Erreur récupération notes:', error)
        return []
      }
    },
    enabled: !!user?.id
  })

  // ============================================
  // 3. RÉCUPÉRER LES MATIÈRES
  // ============================================
  const { data: matieresData, isLoading: matieresLoading } = useQuery({
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
  // 4. RÉCUPÉRER LES STATISTIQUES (pour étudiants)
  // ============================================
  const { data: stats } = useQuery({
    queryKey: ['stats', etudiantId],
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
  // 5. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const notes = Array.isArray(notesData) ? notesData : []
  const matieres = Array.isArray(matieresData) ? matieresData : []

  // ============================================
  // 6. FILTRES ET TRI
  // ============================================
  const filteredNotes = notes
    .filter(note => {
      if (selectedType !== 'all' && note.type_evaluation !== selectedType) return false
      if (selectedMatiere !== 'all' && note.matiere_nom !== selectedMatiere) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return note.matiere_nom?.toLowerCase().includes(searchLower)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date_note) - new Date(a.date_note)
      if (sortBy === 'date_asc') return new Date(a.date_note) - new Date(b.date_note)
      if (sortBy === 'note_desc') return b.valeur_note - a.valeur_note
      if (sortBy === 'note_asc') return a.valeur_note - b.valeur_note
      return 0
    })

  const getNoteColor = (note) => {
    if (note >= 16) return 'text-green-600'
    if (note >= 12) return 'text-blue-600'
    if (note >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getNoteBgColor = (note) => {
    if (note >= 16) return 'bg-green-100'
    if (note >= 12) return 'bg-blue-100'
    if (note >= 10) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'examen': return '📝'
      case 'devoir': return '📚'
      case 'tp': return '💻'
      default: return '📋'
    }
  }

  const isLoading = notesLoading || matieresLoading || etudiantLoading

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
          <h1 className="text-2xl font-bold text-secondary-900">
            {user?.role === 'etudiant' ? 'Mes Notes' : 'Gestion des notes'}
          </h1>
          {user?.role === 'etudiant' && (
            <p className="text-secondary-600 mt-1">
              Moyenne générale: {stats?.moyenne_generale?.toFixed(1) || 'N/A'}/20
            </p>
          )}
          {user?.role !== 'etudiant' && (
            <p className="text-secondary-600 mt-1">
              {filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''} au total
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(user?.role === 'professeur' || user?.role === 'admin') && (
            <ExportButton
              data={filteredNotes}
              filename="notes"
              formatFunction={exportService.formatNotes}
              title="Exporter"
            />
          )}
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
              placeholder={user?.role === 'etudiant'
                ? "Rechercher par matière..."
                : "Rechercher par étudiant ou matière..."}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            />
          </div>

          <select
            value={selectedMatiere}
            onChange={(e) => setSelectedMatiere(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Toutes les matières</option>
            {matieres.map(m => (
              <option key={m.id_matiere} value={m.nom_matière}>{m.nom_matière}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="examen">Examens</option>
            <option value="devoir">Devoirs</option>
            <option value="tp">TP</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
          >
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="note_desc">Notes + élevées</option>
            <option value="note_asc">Notes - élevées</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides pour les non-étudiants */}
      {user?.role !== 'etudiant' && notes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Note maximale</p>
            <p className="text-3xl font-bold">
              {Math.max(...notes.map(n => n.valeur_note))}/20
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Note minimale</p>
            <p className="text-3xl font-bold">
              {Math.min(...notes.map(n => n.valeur_note))}/20
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90">Moyenne générale</p>
            <p className="text-3xl font-bold">
              {(notes.reduce((acc, n) => acc + n.valeur_note, 0) / notes.length).toFixed(1)}/20
            </p>
          </div>
        </div>
      )}

      {/* Tableau des notes */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                {user?.role !== 'etudiant' && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Étudiant</th>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Matière</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Note</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredNotes.map((note) => (
                <tr key={note.id_note} className="hover:bg-secondary-50 transition-colors">
                  {user?.role !== 'etudiant' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {note.student_prenom?.[0]}{note.student_nom?.[0]}
                          </span>
                        </div>
                        <span className="font-medium text-secondary-900">
                          {note.student_prenom} {note.student_nom}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-8 rounded-full ${getNoteBgColor(note.valeur_note)}`} />
                      <span className="font-medium text-secondary-900">{note.matiere_nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                      {getTypeIcon(note.type_evaluation)} {note.type_evaluation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-semibold ${getNoteColor(note.valeur_note)}`}>
                      {note.valeur_note}/20
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(note.date_note).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    {note.valide ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircleIcon className="h-4 w-4" />
                        Validée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        En attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Aucune note trouvée</p>
          </div>
        )}
      </div>

      {/* Graphique de répartition */}
      {filteredNotes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Répartition des notes</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { range: '16-20', color: 'bg-green-500', count: filteredNotes.filter(n => n.valeur_note >= 16).length },
              { range: '12-16', color: 'bg-blue-500', count: filteredNotes.filter(n => n.valeur_note >= 12 && n.valeur_note < 16).length },
              { range: '10-12', color: 'bg-yellow-500', count: filteredNotes.filter(n => n.valeur_note >= 10 && n.valeur_note < 12).length },
              { range: '0-10', color: 'bg-red-500', count: filteredNotes.filter(n => n.valeur_note < 10).length },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`${item.color} h-2 rounded-full mb-2`} />
                <p className="text-sm font-medium text-secondary-900">{item.count} note{item.count > 1 ? 's' : ''}</p>
                <p className="text-xs text-secondary-500">{item.range}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesPage