import type { Rol } from '../types'

const PALETA = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0ea5e9', '#dc2626']

const COLORES_SISTEMA: Record<string, string> = {
  'Administración': '#2563eb',
  'Gerencia': '#6366f1',
  'Area de Producto': '#f59e0b',
  'Area de Ventas': '#10b981',
}

export const DEFAULT_ROLE_COLOR = '#2563eb'

export function getRoleColor(rol: Pick<Rol, 'color'> & Partial<Pick<Rol, 'nombre'>>): string {
  if (rol.color) {
    return rol.color
  }
  if (rol.nombre) {
    return COLORES_SISTEMA[rol.nombre] ?? PALETA[hashNombre(rol.nombre)]
  }
  return DEFAULT_ROLE_COLOR
}

function hashNombre(nombre: string): number {
  return [...nombre].reduce((suma, caracter) => suma + caracter.charCodeAt(0), 0) % PALETA.length
}

export function mezclarColor(hex1: string, hex2: string, peso: number): string {
  const parse = (hex: string) => {
    const limpio = hex.replace('#', '')
    const completo = limpio.length === 3 ? limpio.split('').map((c) => c + c).join('') : limpio
    return [0, 2, 4].map((i) => parseInt(completo.slice(i, i + 2), 16))
  }
  const [r1, g1, b1] = parse(hex1)
  const [r2, g2, b2] = parse(hex2)
  const r = Math.round(r1 * peso + r2 * (1 - peso))
  const g = Math.round(g1 * peso + g2 * (1 - peso))
  const b = Math.round(b1 * peso + b2 * (1 - peso))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}