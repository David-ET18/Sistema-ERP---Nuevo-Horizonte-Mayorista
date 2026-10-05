export function formatDate(isoDate: string): string {
  if (!isoDate) return '-'
  const date = new Date(isoDate)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function firstLetterUpper(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}