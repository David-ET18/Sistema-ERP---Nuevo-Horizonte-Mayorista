import type { EstadoVenta } from './types'

export interface EstadoInfo {
  valor: EstadoVenta
  etiqueta: string
  badge: string
  dot: string
}

export const ESTADOS_VENTA: EstadoInfo[] = [
  { valor: 'PAGADA', etiqueta: 'Pagada', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { valor: 'PENDIENTE_PAGO', etiqueta: 'Pendiente de pago', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { valor: 'CULMINADA', etiqueta: 'Culminada', badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-400' },
  { valor: 'ANULADA', etiqueta: 'Anulada', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
]

export function estadoInfo(estado: EstadoVenta): EstadoInfo {
  return (
    ESTADOS_VENTA.find((e) => e.valor === estado) ?? {
      valor: estado,
      etiqueta: estado,
      badge: 'bg-gray-100 text-gray-700',
      dot: 'bg-gray-400',
    }
  )
}

export function formatDateDDMMYYYY(iso: string | null | undefined): string {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

export function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()} ${hour}:${minutes}`
}

export function formatMonto(cantidad: number): string {
  return `S/ ${(Number(cantidad) || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
