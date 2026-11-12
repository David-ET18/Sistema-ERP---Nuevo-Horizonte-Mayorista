export type TipoNotificacion =
  | 'PROMOCION'
  | 'ROL_PERMISOS'
  | 'ROL_ASIGNADO'
  | 'ROL_QUITADO'
  | 'COTIZACION'
  | 'VENTA'
  | 'AGENCIA'
  | 'TARIFA'
  | 'PROVEEDOR'
  | 'PAQUETE'
  | 'CATALOGO'
  | 'MARKETING'
  | 'SISTEMA'

export interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
  /** Ruta interna del modulo relacionado (ej. /promociones). */
  enlace: string | null
  /** Usuario que provoco el cambio; null en avisos automaticos. */
  actorNombre: string | null
  /** Detalle ampliado con el antes/despues del cambio. */
  detalle: string | null
  fechaLeida: string | null
  fechaCreacion: string
}

export interface KpisNotificaciones {
  total: number
  noLeidas: number
  leidas: number
  promociones: number
}

export interface FiltrosNotificaciones {
  q: string
  /** '' = todas, 'false' = no leídas, 'true' = leídas. */
  leida: string
  /** '' = todos los tipos. */
  tipo: string
}

export interface PaginacionNotificaciones<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
