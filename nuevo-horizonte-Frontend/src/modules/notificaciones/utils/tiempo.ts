import { formatDate } from '@/utils/format'

export function tiempoRelativo(isoDate: string): string {
  const fecha = new Date(isoDate)
  const diffMs = Date.now() - fecha.getTime()
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias} d`
  return formatDate(isoDate)
}
