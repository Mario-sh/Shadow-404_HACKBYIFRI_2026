import api from './api'

// Données mockées enrichies
const mockSearchResults = {
  etudiants: [
    { id: 1, prenom: 'Jean', nom: 'Dupont', classe: 'L1 INFO', matricule: '2024001', email: 'jean.dupont@email.com' },
    { id: 2, prenom: 'Marie', nom: 'Martin', classe: 'L2 GL', matricule: '2024015', email: 'marie.martin@email.com' },
    { id: 3, prenom: 'Pierre', nom: 'Durand', classe: 'L3 INFO', matricule: '2024022', email: 'pierre.durand@email.com' },
    { id: 4, prenom: 'Sophie', nom: 'Bernard', classe: 'M1 INFO', matricule: '2024030', email: 'sophie.bernard@email.com' },
  ],
  exercices: [
    { id: 1, titre: 'Exercices sur les dérivées', matiere: 'Mathématiques', difficulte: 'Moyen', description: 'Série d\'exercices sur les dérivées partielles' },
    { id: 2, titre: 'Lois de Newton', matiere: 'Physique', difficulte: 'Facile', description: 'Applications des lois de Newton' },
    { id: 3, titre: 'Algorithmes de tri', matiere: 'Informatique', difficulte: 'Difficile', description: 'Tri rapide, fusion, tas' },
    { id: 4, titre: 'Équations différentielles', matiere: 'Mathématiques', difficulte: 'Difficile', description: 'Résolution d\'équations différentielles' },
  ],
  notes: [
    { id: 1, matiere: 'Mathématiques', valeur: 16.5, etudiant: 'Jean Dupont', date: '2026-02-15' },
    { id: 2, matiere: 'Physique', valeur: 8.5, etudiant: 'Jean Dupont', date: '2026-02-10' },
    { id: 3, matiere: 'Informatique', valeur: 18.0, etudiant: 'Marie Martin', date: '2026-02-12' },
    { id: 4, matiere: 'Anglais', valeur: 14.5, etudiant: 'Pierre Durand', date: '2026-02-08' },
  ],
  ressources: [
    { id: 1, titre: 'Cours Mathématiques - Dérivées', matiere: 'Mathématiques', type: 'PDF', taille: '2.5 MB' },
    { id: 2, titre: 'Vidéo - Lois de Newton', matiere: 'Physique', type: 'Vidéo', duree: '15 min' },
    { id: 3, titre: 'TP Algorithmes', matiere: 'Informatique', type: 'Document', taille: '1.8 MB' },
    { id: 4, titre: 'Formulaire Mathématiques', matiere: 'Mathématiques', type: 'PDF', taille: '500 KB' },
  ]
}

export const searchService = {
  // Recherche globale
  globalSearch: async (query) => {
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!query || query.length < 2) {
      return { etudiants: [], exercices: [], notes: [], ressources: [] }
    }

    const q = query.toLowerCase()

    return {
      etudiants: mockSearchResults.etudiants.filter(e =>
        `${e.prenom} ${e.nom}`.toLowerCase().includes(q) ||
        e.matricule.includes(q) ||
        e.email.toLowerCase().includes(q)
      ),
      exercices: mockSearchResults.exercices.filter(e =>
        e.titre.toLowerCase().includes(q) ||
        e.matiere.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      ),
      notes: mockSearchResults.notes.filter(n =>
        n.matiere.toLowerCase().includes(q) ||
        n.etudiant.toLowerCase().includes(q)
      ),
      ressources: mockSearchResults.ressources.filter(r =>
        r.titre.toLowerCase().includes(q) ||
        r.matiere.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      )
    }
  },

  // Recherche avancée avec filtres
  advancedSearch: async ({ query, type, matiere, dateDebut, dateFin }) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let results = await searchService.globalSearch(query)

    if (type && type !== 'all') {
      results = { [type]: results[type] }
    }

    return results
  },

  // Suggestions de recherche
  getSuggestions: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const allItems = [
      ...mockSearchResults.etudiants.map(e => ({ type: 'etudiant', text: `${e.prenom} ${e.nom}`, id: e.id })),
      ...mockSearchResults.exercices.map(e => ({ type: 'exercice', text: e.titre, id: e.id })),
      ...mockSearchResults.notes.map(n => ({ type: 'note', text: `${n.matiere} - ${n.etudiant}`, id: n.id })),
      ...mockSearchResults.ressources.map(r => ({ type: 'ressource', text: r.titre, id: r.id }))
    ]

    return allItems
      .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
  }
}