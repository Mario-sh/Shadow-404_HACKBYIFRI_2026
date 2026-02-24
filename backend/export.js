import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportService = {
  /**
   * Exporter des données au format Excel
   * @param {Array} data - Les données à exporter
   * @param {string} filename - Nom du fichier
   * @param {string} sheetName - Nom de la feuille
   */
  toExcel: (data, filename = 'export', sheetName = 'Données') => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Générer le fichier
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

      saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
      return { success: true }
    } catch (error) {
      console.error('❌ Erreur export Excel:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Exporter des données au format CSV
   * @param {Array} data - Les données à exporter
   * @param {string} filename - Nom du fichier
   */
  toCSV: (data, filename = 'export') => {
    try {
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée à exporter')
      }

      // Extraire les en-têtes
      const headers = Object.keys(data[0])

      // Créer les lignes CSV
      const csvRows = []
      csvRows.push(headers.join(','))

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || ''
          // Échapper les virgules et guillemets
          return `"${String(value).replace(/"/g, '""')}"`
        })
        csvRows.push(values.join(','))
      })

      const csvString = csvRows.join('\n')
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })

      saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      return { success: true }
    } catch (error) {
      console.error('❌ Erreur export CSV:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Exporter au format PDF (via impression)
   * @param {string} elementId - ID de l'élément à imprimer
   * @param {string} title - Titre du document
   */
  toPDF: (elementId, title = 'Document') => {
    try {
      const printWindow = window.open('', '_blank')
      const element = document.getElementById(elementId)

      if (!element) {
        throw new Error('Élément non trouvé')
      }

      const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
      let stylesHtml = ''
      styles.forEach(style => {
        if (style.tagName === 'STYLE') {
          stylesHtml += style.outerHTML
        } else if (style.tagName === 'LINK') {
          stylesHtml += style.outerHTML
        }
      })

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8">
            ${stylesHtml}
            <style>
              body { padding: 20px; font-family: 'Inter', sans-serif; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; cursor: pointer;">
                🖨️ Imprimer
              </button>
            </div>
            ${element.outerHTML}
          </body>
        </html>
      `)

      printWindow.document.close()
      return { success: true }
    } catch (error) {
      console.error('❌ Erreur export PDF:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Formater les notes pour l'export
   * @param {Array} notes - Liste des notes
   * @returns {Array} Données formatées
   */
  formatNotes: (notes) => {
    return notes.map(note => ({
      'Étudiant': `${note.student_prenom || ''} ${note.student_nom || ''}`,
      'Matricule': note.student_matricule || '',
      'Matière': note.matiere_nom || '',
      'Note': note.valeur_note,
      'Type': note.type_evaluation || '',
      'Date': new Date(note.date_note).toLocaleDateString('fr-FR'),
      'Validée': note.valide ? 'Oui' : 'Non'
    }))
  },

  /**
   * Formater les étudiants pour l'export
   * @param {Array} etudiants - Liste des étudiants
   * @returns {Array} Données formatées
   */
  formatEtudiants: (etudiants) => {
    return etudiants.map(etudiant => ({
      'Matricule': etudiant.matricule || '',
      'Nom': etudiant.nom || '',
      'Prénom': etudiant.prenom || '',
      'Email': etudiant.email || '',
      'Classe': etudiant.classe_nom || '',
      'Téléphone': etudiant.telephone || '',
      'Moyenne': etudiant.moyenne ? `${etudiant.moyenne}/20` : 'N/A',
      'Date inscription': new Date(etudiant.date_inscription).toLocaleDateString('fr-FR')
    }))
  },

  /**
   * Formater les utilisateurs pour l'export
   * @param {Array} users - Liste des utilisateurs
   * @returns {Array} Données formatées
   */
  formatUtilisateurs: (users) => {
    return users.map(user => ({
      'ID': user.id,
      'Nom d\'utilisateur': user.username || '',
      'Email': user.email || '',
      'Rôle': user.role || '',
      'Actif': user.is_active ? 'Oui' : 'Non',
      'Dernière connexion': user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais',
      'Date inscription': new Date(user.date_joined).toLocaleDateString('fr-FR')
    }))
  }
}