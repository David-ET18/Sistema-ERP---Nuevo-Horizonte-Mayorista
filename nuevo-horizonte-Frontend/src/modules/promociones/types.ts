export interface Promocion {
  id: number
  titulo: string
  descripcion: string | null
  descuento: number
  fechaInicio: string
  fechaFin: string
  activo: boolean
  destacada: boolean
  servicioId: number | null
  servicioNombre: string | null
  servicioCategoria: string | null
  imagenUrl: string | null
  imagenNombre: string | null
  estado: 'VIGENTE' | 'PROGRAMADA' | 'VENCIDA' | 'INACTIVA'
  fechaCreacion: string
  fechaActualizacion: string
}

export interface KpisPromociones {
  total: number
  activas: number
  vigentes: number
  programadas: number
  vencidas: number
  destacadas: number
}

export interface ServicioOpcion {
  id: number
  nombre: string
  categoria: string | null
}

export interface PaginacionPromociones<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export interface FiltrosPromociones {
  q: string
  servicioId: string
  estado: string
  destacada: boolean
}

export interface PromocionPayload {
  titulo: string
  descripcion: string | null
  descuento: number
  fechaInicio: string
  fechaFin: string
  activo: boolean
  destacada: boolean
  servicioId: number | null
  quitarImagen: boolean
  imagen: File | null
}

export interface PromocionFormState {
  titulo: string
  descripcion: string
  descuento: string
  fechaInicio: string
  fechaFin: string
  activo: boolean
  destacada: boolean
  servicioId: string
  quitarImagen: boolean
  imagen: File | null
}
