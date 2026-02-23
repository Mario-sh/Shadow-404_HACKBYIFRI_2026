import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const RecentNotes = ({ notes }) => {
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
          <div key={note.id_note} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{note.matiere_nom}</p>
              <p className="text-sm text-gray-500">{note.date_note}</p>
            </div>
            <span className="text-lg font-semibold text-primary-600">{note.valeur_note}/20</span>
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