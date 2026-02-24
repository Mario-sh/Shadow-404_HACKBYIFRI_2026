import React, { useState } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { exportService } from '../../services/export'
import toast from 'react-hot-toast'

const ExportButton = ({
  data,
  filename = 'export',
  formats = ['excel', 'csv', 'pdf'],
  formatFunction = null,
  title = 'Exporter'
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExport = async (format) => {
    setLoading(true)
    try {
      if (!data || data.length === 0) {
        toast.error('Aucune donnée à exporter')
        return
      }

      // Appliquer la fonction de formatage si fournie
      const exportData = formatFunction ? formatFunction(data) : data

      let result
      switch (format) {
        case 'excel':
          result = exportService.toExcel(exportData, filename)
          if (result.success) {
            toast.success('Export Excel réussi')
          }
          break
        case 'csv':
          result = exportService.toCSV(exportData, filename)
          if (result.success) {
            toast.success('Export CSV réussi')
          }
          break
        case 'pdf':
          // Pour PDF, on utilise l'impression
          toast.success('Préparation du document...')
          setTimeout(() => {
            window.print()
          }, 100)
          break
        default:
          break
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export')
      console.error(error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  if (loading) {
    return (
      <button className="p-2 bg-secondary-100 rounded-xl opacity-50 cursor-not-allowed">
        <ArrowPathIcon className="h-5 w-5 text-secondary-600 animate-spin" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200 transition-colors"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        {title}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-secondary-200 py-2 z-50 animate-slide-down">
          {formats.includes('excel') && (
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
            >
              <TableCellsIcon className="h-4 w-4 text-green-600" />
              Excel (.xlsx)
            </button>
          )}

          {formats.includes('csv') && (
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              CSV (.csv)
            </button>
          )}

          {formats.includes('pdf') && (
            <button
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4 text-red-600" />
              PDF
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExportButton