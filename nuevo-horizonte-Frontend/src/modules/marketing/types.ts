export type CanalPublicacion = 'TELEGRAM'
export type EstadoPublicacion = 'PUBLICADO' | 'ERROR'

export interface MarketingPublicacion {
  id: number
  textoOriginal: string
  textoPublicado: string | null
  canal: CanalPublicacion
  estado: EstadoPublicacion
  mensajeError: string | null
  tieneImagen: boolean
  responsableNombre: string | null
  fechaPublicacion: string
}

export interface FiltrosMarketing {
  q: string
  estado: string
}

export interface KpisMarketing {
  total: number
  publicadas: number
  conError: number
  hoy: number
}

export interface PaginacionMarketing<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
