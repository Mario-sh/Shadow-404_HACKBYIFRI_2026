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
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée à exporter')
      }

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
  },

  /**
   * Formater les classes pour l'export
   * @param {Array} classes - Liste des classes
   * @returns {Array} Données formatées
   */
  formatClasses: (classes) => {
    return classes.map(classe => ({
      'ID': classe.id_classe,
      'Nom': classe.nom_class || '',
      'Niveau': classe.niveau || '',
      'Effectif': classe.effectif || 0,
      'Capacité': classe.capacite || 30,
      'Moyenne': classe.moyenne ? `${classe.moyenne}/20` : 'N/A',
      'Date création': new Date(classe.created_at).toLocaleDateString('fr-FR')
    }))
  },

  /**
   * Formater les matières pour l'export
   * @param {Array} matieres - Liste des matières
   * @returns {Array} Données formatées
   */
  formatMatieres: (matieres) => {
    return matieres.map(matiere => ({
      'ID': matiere.id_matiere,
      'Nom': matiere.nom_matière || '',
      'Coefficient': matiere.coefficient || 1,
      'Moyenne': matiere.moyenne ? `${matiere.moyenne}/20` : 'N/A',
      'Nombre de notes': matiere.nb_notes || 0,
      'Date création': new Date(matiere.created_at).toLocaleDateString('fr-FR')
    }))
  },

  /**
   * Formater les exercices pour l'export
   * @param {Array} exercices - Liste des exercices
   * @returns {Array} Données formatées
   */
  formatExercices: (exercices) => {
    return exercices.map(ex => ({
      'ID': ex.id_exercice,
      'Titre': ex.titre || '',
      'Matière': ex.subject_nom || '',
      'Difficulté': ex.niveau_difficulte === 1 ? 'Facile' : ex.niveau_difficulte === 2 ? 'Moyen' : 'Difficile',
      'Type': ex.Type_ressource || '',
      'URL': ex.fichier_url || '',
      'Date création': new Date(ex.created_at).toLocaleDateString('fr-FR')
    }))
  },

  /**
   * Formater les ressources pour l'export
   * @param {Array} ressources - Liste des ressources
   * @returns {Array} Données formatées
   */
  formatRessources: (ressources) => {
    return ressources.map(res => ({
      'ID': res.id_ressource,
      'Titre': res.titre || '',
      'Description': res.description || '',
      'Matière': res.matiere_nom || '',
      'Type': res.Type_ressource || '',
      'URL': res.fichier_url || '',
      'Date création': new Date(res.created_at).toLocaleDateString('fr-FR')
    }))
  },

  /**
   * Formater les logs pour l'export
   * @param {Array} logs - Liste des logs
   * @returns {Array} Données formatées
   */
  formatLogs: (logs) => {
    return logs.map(log => ({
      'Date': new Date(log.timestamp || log.created_at).toLocaleDateString('fr-FR'),
      'Heure': new Date(log.timestamp || log.created_at).toLocaleTimeString('fr-FR'),
      'Niveau': log.level || '',
      'Type': log.type || '',
      'Message': log.message || '',
      'Utilisateur': log.user || 'Système',
      'IP': log.ip_address || '',
      'Détails': log.details ? JSON.stringify(log.details) : ''
    }))
  },

  /**
   * Formater les professeurs en attente pour l'export
   * @param {Array} professeurs - Liste des professeurs en attente
   * @returns {Array} Données formatées
   */
  formatProfesseursEnAttente: (professeurs) => {
    return professeurs.map(prof => ({
      'Nom': prof.nom || '',
      'Prénom': prof.prenom || '',
      'Email': prof.email || '',
      'Spécialité': prof.specialite || '',
      'Date inscription': new Date(prof.date_joined).toLocaleDateString('fr-FR'),
      'Nom d\'utilisateur proposé': prof.username || ''
    }))
  }
}