export type EstadoTarifa = 'VIGENTE' | 'POR_VENCER' | 'VENCIDA'

export interface TarifaHistorial {
  precioAnterior: number | null
  precioNuevo: number
  fechaCambio: string
  usuarioCambio: string | null
}

export interface Tarifa {
  id: number
  proveedorId: number
  proveedor: string
  servicioId: number
  servicio: string
  destinoId: number
  destino: string
  tipoTarifa: string | null
  precio: number
  moneda: string
  fechaDesde: string
  fechaHasta: string
  condiciones: string | null
  observaciones: string | null
  archivoRespaldoUrl: string | null
  estado: EstadoTarifa
  historial: TarifaHistorial[]
  fechaCreacion: string
  fechaActualizacion: string
}

export type TarifaLista = Pick<
  Tarifa,
  | 'id'
  | 'proveedor'
  | 'servicio'
  | 'destino'
  | 'precio'
  | 'moneda'
  | 'fechaDesde'
  | 'fechaHasta'
  | 'estado'
  | 'fechaActualizacion'
>

export interface TarifaPayload {
  proveedorId: number
  servicioId: number
  destinoId: number
  tipoTarifa: string | null
  precio: number
  moneda: string
  fechaDesde: string
  fechaHasta: string
  condiciones: string | null
  observaciones: string | null
}

export interface FiltrosTarifas {
  q: string
  proveedorId: string
  destinoId: string
  servicioId: string
  estado: string
}

export interface KpisTarifas {
  vigentes: number
  porVencer: number
  vencidas: number
}

export interface ProveedorRef {
  id: number
  nombre: string
}

export interface Destino {
  id: number
  nombre: string
  pais: string
}

export interface Servicio {
  id: number
  nombre: string
  categoria: string | null
}

export interface PaginacionTarifas<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
