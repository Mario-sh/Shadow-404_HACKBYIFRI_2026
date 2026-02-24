import React from 'react'
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

const NotesTable = ({ notes, showStudent = false, onNoteClick = null }) => {
  // ============================================
  // 1. FONCTIONS UTILITAIRES
  // ============================================
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

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
        <p className="text-secondary-500">Aucune note disponible</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary-50 border-b border-secondary-200">
          <tr>
            {showStudent && (
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
          {notes.map((note) => (
            <tr
              key={note.id_note}
              className={`hover:bg-secondary-50 transition-colors ${onNoteClick ? 'cursor-pointer' : ''}`}
              onClick={() => onNoteClick && onNoteClick(note)}
            >
              {showStudent && (
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
  )
}

export default NotesTable