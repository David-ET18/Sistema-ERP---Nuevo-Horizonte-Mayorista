export type EstadoPaquete = 'ACTIVO' | 'INACTIVO' | 'BORRADOR'

export interface PaqueteVuelo {
  id?: number
  aerolinea: string
  origen: string
  destino: string
  fechaSalida: string
  fechaLlegada: string
}

export interface PaqueteOpcion {
  id?: number
  hotelServicio: string
  fechaDesde: string
  fechaHasta: string
  incluye: string
  precioSimple: number
  precioDoble: number
  precioTriple: number
  precioNino: number
}

export interface Paquete {
  id: number
  nombre: string
  descripcion: string | null
  destinoId: number | null
  destino: string | null
  fechaInicioViaje: string | null
  fechaFinViaje: string | null
  fechaCierreVenta: string | null
  categoria: string | null
  moneda: string
  precioDesde: number | null
  duracionTexto: string | null
  destacado: boolean
  estado: EstadoPaquete
  aliados: string[]
  vuelos: PaqueteVuelo[]
  opciones: PaqueteOpcion[]
  fechaCreacion: string
  fechaActualizacion: string
}

export type PaqueteLista = Pick<
  Paquete,
  | 'id'
  | 'nombre'
  | 'destino'
  | 'categoria'
  | 'duracionTexto'
  | 'moneda'
  | 'precioDesde'
  | 'estado'
  | 'destacado'
  | 'fechaActualizacion'
>

export interface PaquetePayload {
  nombre: string
  descripcion: string | null
  destinoId: number
  fechaInicioViaje: string | null
  fechaFinViaje: string | null
  fechaCierreVenta: string | null
  categoria: string | null
  moneda: string
  precioDesde: number | null
  duracionTexto: string | null
  destacado: boolean
  estado: EstadoPaquete
  aliados: string[]
  vuelos: PaqueteVuelo[]
  opciones: PaqueteOpcion[]
}

export interface FiltrosPaquetes {
  q: string
  categoria: string
  estado: string
  destacado: boolean
  destinoId: string
}

export interface KpisPaquetes {
  publicados: number
  borradores: number
  destacados: number
}

export interface Destino {
  id: number
  nombre: string
  pais: string
}

export interface PaginacionPaquetes<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
