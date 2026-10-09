export interface Destino {
  id: number
  nombre: string
  pais: string
  descripcion: string | null
  activo: boolean
  fechaCreacion: string
}

export interface DestinoPayload {
  nombre: string
  pais: string
  descripcion: string | null
  activo: boolean
}

export interface Servicio {
  id: number
  nombre: string
  categoria: string | null
  descripcion: string | null
  activo: boolean
  fechaCreacion: string
}

export interface ServicioPayload {
  nombre: string
  categoria: string | null
  descripcion: string | null
  activo: boolean
}

export interface KpisCatalogo {
  destinos: number
  destinosActivos: number
  servicios: number
  serviciosActivos: number
}

export interface Paginacion<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

/** Filtros comunes: `grupo` es el pais (destinos) o la categoria (servicios). */
export interface FiltrosCatalogo {
  q: string
  grupo: string
  activo: string
}
