import type { ReactElement, SVGProps } from 'react'

import { IconInfo, IconPencil, IconStar, IconTrash, IconUsers } from '@/components/icons'

export type IconoTipo = (props: SVGProps<SVGSVGElement>) => ReactElement

export interface EstiloTipo {
  bg: string
  text: string
  Icon: IconoTipo
  etiqueta: string
}

export function estiloTipo(tipo: string): EstiloTipo {
  switch (tipo) {
    case 'PROMOCION':
      return { bg: 'bg-amber-100', text: 'text-amber-700', Icon: IconStar, etiqueta: 'Promoción' }
    case 'ROL_PERMISOS':
      return { bg: 'bg-amber-100', text: 'text-amber-700', Icon: IconPencil, etiqueta: 'Permisos' }
    case 'ROL_ASIGNADO':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: IconUsers, etiqueta: 'Rol asignado' }
    case 'ROL_QUITADO':
      return { bg: 'bg-red-100', text: 'text-red-700', Icon: IconTrash, etiqueta: 'Rol retirado' }
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', Icon: IconInfo, etiqueta: 'Sistema' }
  }
}
