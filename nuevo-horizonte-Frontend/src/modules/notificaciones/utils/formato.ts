import type { ReactElement, SVGProps } from 'react'

import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconHandshake,
  IconInfo,
  IconMail,
  IconMoney,
  IconPencil,
  IconSend,
  IconStar,
  IconTrash,
  IconTrendingUp,
  IconUsers,
} from '@/components/icons'
import { formatDate } from '@/utils/format'

export type IconoTipo = (props: SVGProps<SVGSVGElement>) => ReactElement

export interface EstiloTipo {
  bg: string
  text: string
  ring: string
  Icon: IconoTipo
  etiqueta: string
  descripcion: string
}

/** Color, icono y textos por tipo de notificacion (compartido por lista y modal). */
export function estiloTipo(tipo: string): EstiloTipo {
  switch (tipo) {
    case 'PROMOCION':
      return {
        bg: 'bg-fuchsia-100',
        text: 'text-fuchsia-700',
        ring: 'ring-fuchsia-200',
        Icon: IconStar,
        etiqueta: 'Promoción',
        descripcion: 'Aviso de una promoción publicada o reactivada.',
      }
    case 'ROL_PERMISOS':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        ring: 'ring-amber-200',
        Icon: IconPencil,
        etiqueta: 'Permisos',
        descripcion: 'Se modificaron los permisos de uno de tus roles.',
      }
    case 'ROL_ASIGNADO':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        ring: 'ring-emerald-200',
        Icon: IconUsers,
        etiqueta: 'Rol asignado',
        descripcion: 'Se agregó un rol nuevo a tu cuenta.',
      }
    case 'ROL_QUITADO':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        ring: 'ring-red-200',
        Icon: IconTrash,
        etiqueta: 'Rol retirado',
        descripcion: 'Se retiró uno de tus roles.',
      }
    case 'COTIZACION':
      return {
        bg: 'bg-sky-100',
        text: 'text-sky-700',
        ring: 'ring-sky-200',
        Icon: IconSend,
        etiqueta: 'Cotización',
        descripcion: 'Se creó, actualizó o cambió el estado de una cotización.',
      }
    case 'VENTA':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        ring: 'ring-emerald-200',
        Icon: IconMoney,
        etiqueta: 'Venta',
        descripcion: 'Se registró, actualizó o cambió el estado de una venta.',
      }
    case 'AGENCIA':
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        ring: 'ring-indigo-200',
        Icon: IconBuilding,
        etiqueta: 'Agencia',
        descripcion: 'Se creó, actualizó o cambió el estado de una agencia.',
      }
    case 'TARIFA':
      return {
        bg: 'bg-teal-100',
        text: 'text-teal-700',
        ring: 'ring-teal-200',
        Icon: IconTrendingUp,
        etiqueta: 'Tarifa',
        descripcion: 'Se creó, actualizó o eliminó una tarifa.',
      }
    case 'PROVEEDOR':
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-700',
        ring: 'ring-cyan-200',
        Icon: IconHandshake,
        etiqueta: 'Proveedor',
        descripcion: 'Se creó, actualizó o cambió el estado de un proveedor.',
      }
    case 'PAQUETE':
      return {
        bg: 'bg-violet-100',
        text: 'text-violet-700',
        ring: 'ring-violet-200',
        Icon: IconBriefcase,
        etiqueta: 'Paquete',
        descripcion: 'Se creó, actualizó, eliminó o desactivó un paquete turístico.',
      }
    case 'CATALOGO':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        ring: 'ring-slate-200',
        Icon: IconCalendar,
        etiqueta: 'Catálogo',
        descripcion: 'Se creó, actualizó o eliminó un destino o servicio del catálogo.',
      }
    case 'MARKETING':
      return {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        ring: 'ring-pink-200',
        Icon: IconMail,
        etiqueta: 'Marketing',
        descripcion: 'Se envió una publicación de difusión a Telegram.',
      }
    default:
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        ring: 'ring-blue-200',
        Icon: IconInfo,
        etiqueta: 'Sistema',
        descripcion: 'Aviso generado por el sistema.',
      }
  }
}

/** "ahora mismo", "hace 5 min", "hace 3 h", "hace 2 d" o la fecha absoluta. */
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

const NOMBRES_MODULO: Record<string, string> = {
  '/promociones': 'Promociones',
  '/notificaciones': 'Notificaciones',
  '/usuarios': 'Usuarios',
  '/roles': 'Roles y permisos',
  '/cotizaciones': 'Cotizaciones',
  '/ventas': 'Ventas',
  '/compras': 'Compras',
  '/reportes': 'Reportes',
  '/catalogo': 'Catálogo Base',
  '/proveedores': 'Proveedores',
  '/tarifas': 'Tarifas',
  '/paquetes': 'Paquetes Turísticos',
  '/gestion-agencias': 'Gestión de Agencias',
  '/marketing': 'Difusión y Marketing',
}

/** Nombre legible de la ruta interna a la que apunta la notificacion. */
export function nombreModulo(enlace: string | null): string | null {
  if (!enlace) return null
  const ruta = enlace.split('?')[0]
  return NOMBRES_MODULO[ruta] ?? ruta.replace(/^\//, '').replace(/-/g, ' ')
}
