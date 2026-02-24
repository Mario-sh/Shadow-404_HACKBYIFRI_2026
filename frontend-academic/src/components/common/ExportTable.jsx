import React, { useRef } from 'react'
import { exportService } from '../../services/export'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

const ExportTable = ({
  data,
  columns,
  filename = 'export',
  children
}) => {
  const tableRef = useRef(null)

  const handleExportExcel = () => {
    // Formater les données selon les colonnes
    const exportData = data.map(row => {
      const formattedRow = {}
      columns.forEach(col => {
        formattedRow[col.header] = row[col.accessor] || ''
      })
      return formattedRow
    })

    exportService.toExcel(exportData, filename)
  }

  const handleExportPDF = () => {
    if (tableRef.current) {
      exportService.toPDF(tableRef.current.id || 'export-table', filename)
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          PDF
        </button>
      </div>

      <div id="export-table" ref={tableRef}>
        {children}
      </div>
    </div>
  )
}

export default ExportTable