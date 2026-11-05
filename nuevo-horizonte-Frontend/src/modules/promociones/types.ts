export type EstadoVigenciaPromocion = 'VIGENTE' | 'PROGRAMADA' | 'VENCIDA' | 'INACTIVA'

export interface Promocion {
  id: number
  nombre: string
  descripcion: string | null
  descuentoPorcentaje: number
  precioOriginal: number | null
  precioPromocional: number | null
  fechaInicio: string | null
  fechaFin: string | null
  destacada: boolean
  activa: boolean
  servicioId: number | null
  servicioNombre: string | null
  tieneImagen: boolean
  estadoVigencia: EstadoVigenciaPromocion
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PromocionPayload {
  nombre: string
  descripcion: string | null
  servicioId: number | null
  descuentoPorcentaje: number
  precioOriginal: number | null
  precioPromocional: number | null
  fechaInicio: string | null
  fechaFin: string | null
  destacada: boolean
  activa: boolean
  quitarImagen: boolean
}

export interface FiltrosPromociones {
  q: string
  estado: string
  servicioId: string
  destacada: boolean
  activa: string
}

export interface KpisPromociones {
  total: number
  activas: number
  destacadas: number
  vigentes: number
  porVencer: number
}

export interface ServicioOpcion {
  id: number
  nombre: string
  categoria: string | null
  /** Tarifa vigente mas baja del servicio; null si no tiene tarifas vigentes. */
  precioReferencia: number | null
}

export interface PaginacionPromociones<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
