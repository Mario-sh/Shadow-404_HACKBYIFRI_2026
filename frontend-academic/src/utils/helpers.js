// Formatage de date
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return ''
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
}

// Tronquer un texte
export const truncate = (text, length = 100) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Obtenir la couleur d'une note
export const getNoteColor = (note) => {
  if (note >= 16) return 'text-green-600'
  if (note >= 12) return 'text-blue-600'
  if (note >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

// Obtenir la couleur de fond d'une note
export const getNoteBgColor = (note) => {
  if (note >= 16) return 'bg-green-100'
  if (note >= 12) return 'bg-blue-100'
  if (note >= 10) return 'bg-yellow-100'
  return 'bg-red-100'
}

// Calculer la moyenne d'un tableau de notes
export const calculateAverage = (notes) => {
  if (!notes || notes.length === 0) return 0
  const sum = notes.reduce((acc, note) => acc + note.valeur_note, 0)
  return sum / notes.length
}

// Grouper un tableau par propriété
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {})
}

// Trier un tableau par date
export const sortByDate = (array, dateKey = 'date', ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey])
    const dateB = new Date(b[dateKey])
    return ascending ? dateA - dateB : dateB - dateA
  })
}