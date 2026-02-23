export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const getNoteColor = (note) => {
  if (note >= 16) return 'text-green-600'
  if (note >= 12) return 'text-blue-600'
  if (note >= 10) return 'text-yellow-600'
  return 'text-red-600'
}