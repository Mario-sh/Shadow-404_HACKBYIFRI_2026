import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { academicService } from '../../services/academic'
import { useAuth } from '../../hooks/useAuth'
import {
  AcademicCapIcon,
  UserGroupIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const SaisieNotesPage = () => {
  const { user } = useAuth()
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const [selectedEtudiant, setSelectedEtudiant] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    valeur: '',
    type: 'examen',
    date: new Date().toISOString().split('T')[0],
    observation: ''
  })
  const [bulkNotes, setBulkNotes] = useState([])

  // ============================================
  // 1. RÉCUPÉRER LES CLASSES
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
  // 2. RÉCUPÉRER LES MATIÈRES
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
  // 3. RÉCUPÉRER LES ÉTUDIANTS DE LA CLASSE
  // ============================================
  const { data: etudiantsData, refetch: refetchEtudiants, isLoading: etudiantsLoading } = useQuery({
    queryKey: ['etudiantsClasse', selectedClasse],
    queryFn: async () => {
      if (!selectedClasse) return []
      try {
        const response = await academicService.getEtudiants({ classe: selectedClasse })
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('❌ Erreur récupération étudiants:', error)
        return []
      }
    },
    enabled: !!selectedClasse
  })

  // ============================================
  // 4. RÉCUPÉRER LES NOTES DE L'ÉTUDIANT
  // ============================================
  const { data: notesData, refetch: refetchNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['notesEtudiant', selectedEtudiant?.id_student],
    queryFn: async () => {
      if (!selectedEtudiant?.id_student) return []
      try {
        const response = await academicService.getNotes(selectedEtudiant.id_student)
        return Array.isArray(response.data) ? response.data :
               response.data?.results ? response.data.results : []
      } catch (error) {
        console.error('❌ Erreur récupération notes:', error)
        return []
      }
    },
    enabled: !!selectedEtudiant?.id_student
  })

  // ============================================
  // 5. MUTATIONS
  // ============================================
  const addNoteMutation = useMutation({
    mutationFn: (data) => academicService.addNote(data),
    onSuccess: () => {
      toast.success('Note ajoutée avec succès')
      setShowModal(false)
      resetForm()
      refetchNotes()
      if (selectedClasse) refetchEtudiants()
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout')
      console.error(error)
    }
  })

  const addBulkNotesMutation = useMutation({
    mutationFn: (data) => academicService.addBulkNotes(data),
    onSuccess: () => {
      toast.success('Notes ajoutées avec succès')
      setShowBulkModal(false)
      setBulkNotes([])
      if (selectedClasse) refetchEtudiants()
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout des notes')
      console.error(error)
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => academicService.updateNote(id, data),
    onSuccess: () => {
      toast.success('Note modifiée')
      setShowModal(false)
      resetForm()
      refetchNotes()
    },
    onError: (error) => {
      toast.error('Erreur lors de la modification')
      console.error(error)
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => academicService.deleteNote(id),
    onSuccess: () => {
      toast.success('Note supprimée')
      refetchNotes()
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    }
  })

  const validerNoteMutation = useMutation({
    mutationFn: (id) => academicService.validerNote(id),
    onSuccess: () => {
      toast.success('Note validée')
      refetchNotes()
    },
    onError: (error) => {
      toast.error('Erreur lors de la validation')
      console.error(error)
    }
  })

  // ============================================
  // 6. S'ASSURER QUE LES DONNÉES SONT DES TABLEAUX
  // ============================================
  const classes = Array.isArray(classesData) ? classesData : []
  const matieres = Array.isArray(matieresData) ? matieresData : []
  const etudiants = Array.isArray(etudiantsData) ? etudiantsData : []
  const notes = Array.isArray(notesData) ? notesData : []

  // ============================================
  // 7. FILTRES
  // ============================================
  const filteredEtudiants = etudiants.filter(etudiant => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return etudiant.nom?.toLowerCase().includes(searchLower) ||
             etudiant.prenom?.toLowerCase().includes(searchLower) ||
             etudiant.matricule?.toLowerCase().includes(searchLower)
    }
    return true
  })

  // ============================================
  // 8. FONCTIONS UTILITAIRES
  // ============================================
  const resetForm = () => {
    setFormData({
      valeur: '',
      type: 'examen',
      date: new Date().toISOString().split('T')[0],
      observation: ''
    })
  }

  const handleAddNote = (e) => {
    e.preventDefault()

    const noteData = {
      student_id: selectedEtudiant.id_student,
      matiere_id: parseInt(selectedMatiere),
      ...formData,
      valeur: parseFloat(formData.valeur)
    }

    addNoteMutation.mutate(noteData)
  }

  const handleEditNote = (note) => {
    setSelectedEtudiant(prev => ({ ...prev, id_student: note.id_student }))
    setFormData({
      valeur: note.valeur_note.toString(),
      type: note.type_evaluation,
      date: note.date_note,
      observation: note.observation || ''
    })
    setSelectedMatiere(note.id_matiere?.toString() || '')
    setShowModal(true)
  }

  const handleUpdateNote = (e, noteId) => {
    e.preventDefault()

    const noteData = {
      matiere_id: parseInt(selectedMatiere),
      ...formData,
      valeur: parseFloat(formData.valeur)
    }

    updateNoteMutation.mutate({ id: noteId, data: noteData })
  }

  const handleDeleteNote = (id) => {
    if (window.confirm('Supprimer cette note ?')) {
      deleteNoteMutation.mutate(id)
    }
  }

  const handleValiderNote = (id) => {
    if (window.confirm('Valider cette note ?')) {
      validerNoteMutation.mutate(id)
    }
  }

  const prepareBulkNotes = () => {
    if (!selectedClasse || !selectedMatiere) {
      toast.error('Sélectionnez une classe et une matière')
      return
    }

    const notes = etudiants.map(etudiant => ({
      student_id: etudiant.id_student,
      student_name: `${etudiant.prenom} ${etudiant.nom}`,
      valeur: '',
      type: 'examen',
      date: new Date().toISOString().split('T')[0],
      observation: ''
    }))

    setBulkNotes(notes)
    setShowBulkModal(true)
  }

  const handleBulkNoteChange = (index, field, value) => {
    const updatedNotes = [...bulkNotes]
    updatedNotes[index][field] = value
    setBulkNotes(updatedNotes)
  }

  const handleSubmitBulkNotes = (e) => {
    e.preventDefault()

    const notesToSubmit = bulkNotes
      .filter(note => note.valeur && parseFloat(note.valeur) >= 0 && parseFloat(note.valeur) <= 20)
      .map(note => ({
        student_id: note.student_id,
        matiere_id: parseInt(selectedMatiere),
        valeur: parseFloat(note.valeur),
        type: note.type,
        date: note.date,
        observation: note.observation
      }))

    if (notesToSubmit.length === 0) {
      toast.error('Aucune note valide à ajouter')
      return
    }

    addBulkNotesMutation.mutate({ notes: notesToSubmit })
  }

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

  const isLoading = etudiantsLoading || notesLoading

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Saisie des notes</h1>
        <div className="flex gap-2">
          {selectedClasse && selectedMatiere && (
            <button
              onClick={prepareBulkNotes}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Saisie multiple
            </button>
          )}
          <Link
            to="/notes"
            className="px-4 py-2 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50 transition-colors"
          >
            Voir les notes
          </Link>
        </div>
      </div>

      {/* Sélection classe et matière */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Classe
            </label>
            <select
              value={selectedClasse}
              onChange={(e) => {
                setSelectedClasse(e.target.value)
                setSelectedEtudiant(null)
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(c => (
                <option key={c.id_classe} value={c.id_classe}>{c.nom_class}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Matière
            </label>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
            >
              <option value="">Sélectionner une matière</option>
              {matieres.map(m => (
                <option key={m.id_matiere} value={m.id_matiere}>{m.nom_matière}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des étudiants */}
      {selectedClasse && (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Liste des étudiants</h2>
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEtudiants.map((etudiant) => (
                <button
                  key={etudiant.id_student}
                  onClick={() => setSelectedEtudiant(etudiant)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                    selectedEtudiant?.id_student === etudiant.id_student
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'hover:bg-secondary-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-secondary-900">{etudiant.prenom} {etudiant.nom}</p>
                      <p className="text-xs text-secondary-500">{etudiant.matricule}</p>
                    </div>
                  </div>
                  <span className="text-xs text-secondary-400">
                    {notes.filter(n => n.id_student === etudiant.id_student).length} note(s)
                  </span>
                </button>
              ))}

              {filteredEtudiants.length === 0 && (
                <p className="text-center text-secondary-500 py-8">Aucun étudiant trouvé</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes de l'étudiant sélectionné */}
      {selectedEtudiant && (
        <div className="bg-white rounded-2xl shadow-lg border border-secondary-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">
                Notes de {selectedEtudiant.prenom} {selectedEtudiant.nom}
              </h2>
              <p className="text-sm text-secondary-500">{selectedEtudiant.matricule}</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              disabled={!selectedMatiere}
            >
              <PlusCircleIcon className="h-5 w-5" />
              Ajouter une note
            </button>
          </div>

          {notesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <p className="text-center text-secondary-500 py-8">Aucune note pour cet étudiant</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id_note} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-secondary-900">{note.matiere_nom}</span>
                      <span className="text-xs text-secondary-500">{getTypeIcon(note.type_evaluation)} {note.type_evaluation}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-secondary-500">
                      <span>{new Date(note.date_note).toLocaleDateString('fr-FR')}</span>
                      {note.observation && <span>• {note.observation}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${getNoteColor(note.valeur_note)}`}>
                      {note.valeur_note}/20
                    </span>
                    <div className="flex gap-1">
                      {!note.valide && (
                        <button
                          onClick={() => handleValiderNote(note.id_note)}
                          className="p-2 hover:bg-white rounded-lg"
                          title="Valider"
                        >
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 hover:bg-white rounded-lg"
                        title="Modifier"
                      >
                        <PencilSquareIcon className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id_note)}
                        className="p-2 hover:bg-white rounded-lg"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal ajout/modification note */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-secondary-900">
                {formData.valeur ? 'Modifier' : 'Ajouter'} une note
              </h3>
              <button onClick={() => {
                setShowModal(false)
                resetForm()
              }}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <form onSubmit={(e) => formData.valeur ? handleUpdateNote(e, notes.find(n => n.valeur_note === parseFloat(formData.valeur))?.id_note) : handleAddNote(e)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Matière
                </label>
                <select
                  value={selectedMatiere}
                  onChange={(e) => setSelectedMatiere(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                  disabled={!!formData.valeur}
                >
                  <option value="">Sélectionner</option>
                  {matieres.map(m => (
                    <option key={m.id_matiere} value={m.id_matiere}>{m.nom_matière}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Note (0-20)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={formData.valeur}
                  onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  >
                    <option value="examen">Examen</option>
                    <option value="devoir">Devoir</option>
                    <option value="tp">TP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Observation
                </label>
                <input
                  type="text"
                  value={formData.observation}
                  onChange={(e) => setFormData({...formData, observation: e.target.value})}
                  placeholder="Optionnel"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addNoteMutation.isLoading || updateNoteMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {addNoteMutation.isLoading || updateNoteMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    formData.valeur ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal saisie multiple */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-secondary-900">
                Saisie multiple de notes
              </h3>
              <button onClick={() => {
                setShowBulkModal(false)
                setBulkNotes([])
              }}>
                <XMarkIcon className="h-6 w-6 text-secondary-400 hover:text-secondary-600" />
              </button>
            </div>

            <form onSubmit={handleSubmitBulkNotes} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-secondary-700">Type:</span>
                  <select
                    value={bulkNotes[0]?.type || 'examen'}
                    onChange={(e) => {
                      const newType = e.target.value
                      setBulkNotes(bulkNotes.map(note => ({ ...note, type: newType })))
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  >
                    <option value="examen">Examen</option>
                    <option value="devoir">Devoir</option>
                    <option value="tp">TP</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-secondary-700">Date:</span>
                  <input
                    type="date"
                    value={bulkNotes[0]?.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = e.target.value
                      setBulkNotes(bulkNotes.map(note => ({ ...note, date: newDate })))
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Étudiant</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Note (0-20)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500">Observation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {bulkNotes.map((note, index) => (
                      <tr key={note.student_id}>
                        <td className="px-4 py-2">
                          <span className="text-sm text-secondary-900">{note.student_name}</span>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="20"
                            value={note.valeur}
                            onChange={(e) => handleBulkNoteChange(index, 'valeur', e.target.value)}
                            className="w-24 px-2 py-1 text-sm rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={note.observation}
                            onChange={(e) => handleBulkNoteChange(index, 'observation', e.target.value)}
                            placeholder="Optionnel"
                            className="w-full px-2 py-1 text-sm rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-secondary-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false)
                    setBulkNotes([])
                  }}
                  className="px-6 py-2.5 border border-secondary-200 text-secondary-600 rounded-xl hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addBulkNotesMutation.isLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {addBulkNotesMutation.isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    'Enregistrer les notes'
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

export default SaisieNotesPage