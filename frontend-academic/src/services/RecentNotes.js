import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { getNoteColor, formatDate } from '../../utils/helpers'

const RecentNotes = ({ notes }) => {
  const getTypeBadgeColor = (type) => {
    const colors = {
      examen: 'bg-purple-100 text-purple-800',
      devoir: 'bg-blue-100 text-blue-800',
      tp: 'bg-green-100 text-green-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Dernières notes</h2>
        <Link
          to="/notes"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Voir tout <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {notes?.slice(0, 5).map((note) => (
          <div key={note.id_note} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{note.matiere_nom}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(note.type_evaluation)}`}>
                  {note.type_evaluation}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{formatDate(note.date_note)}</p>
            </div>
            <div className="text-right">
              <span className={`text-xl font-semibold ${getNoteColor(note.valeur_note)}`}>
                {note.valeur_note}/20
              </span>
              {note.valide ? (
                <p className="text-xs text-green-600 mt-1">Validée</p>
              ) : (
                <p className="text-xs text-yellow-600 mt-1">En attente</p>
              )}
            </div>
          </div>
        ))}

        {(!notes || notes.length === 0) && (
          <p className="text-center text-gray-500 py-4">Aucune note pour le moment</p>
        )}
      </div>
    </div>
  )
}

export default RecentNotes