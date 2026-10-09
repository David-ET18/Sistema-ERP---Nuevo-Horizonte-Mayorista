export type EstadoCotizacion =
  | 'PENDIENTE'
  | 'EN_NEGOCIACION'
  | 'ENVIADA'
  | 'CERRADA'
  | 'PERDIDA'
  | 'ANULADA'

export interface CotizacionLista {
  id: number
  numero: string
  agencia: string
  destino: string
  producto: string
  monto: number
  estado: EstadoCotizacion
  fechaCreacion: string
}

export interface CotizacionLinea {
  id: number
  tarifaId: number
  servicio: string
  destino: string
  proveedor: string
  precioUnitario: number
  cantidadPax: number
  monto: number
  moneda: string
}

export interface CotizacionHistorial {
  id: number
  estadoAnterior: EstadoCotizacion | null
  estadoNuevo: EstadoCotizacion
  fechaCambio: string
  usuario: string | null
}

export interface Cotizacion {
  id: number
  numero: string
  agenciaId: number
  agencia: string
  rucAgencia: string
  asesor: string | null
  fechaCreacion: string
  fechaEnvio: string | null
  fechaCierre: string | null
  fechaViaje: string | null
  serviciosAdicionales: string | null
  margenPorcentaje: number
  costoBase: number
  margenMonto: number
  precioVenta: number
  estado: EstadoCotizacion
  destino: string
  producto: string
  monto: number
  lineas: CotizacionLinea[]
  historial: CotizacionHistorial[]
}

export interface KpisCotizaciones {
  pendientes: number
  enNegociacion: number
  cerradasMes: number
}

export interface Agencia {
  id: number
  razonSocial: string
  nombreComercial: string | null
  nombre: string
  ruc: string
  activo: boolean
}

export interface Destino {
  id: number
  nombre: string
  pais: string
}

export interface Tarifa {
  id: number
  servicio: string
  destino: string
  destinoId: number
  proveedor: string
  precio: number
  moneda: string
  fechaDesde: string
  fechaHasta: string
}

export interface FiltrosCotizaciones {
  q: string
  estado: EstadoCotizacion | ''
  agenciaId: string
  destinoId: string
  desde: string
  hasta: string
}

export interface PaginacionCotizaciones {
  content: CotizacionLista[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CotizacionLineaRequest {
  tarifaId: number
  cantidadPax: number
}

export interface CotizacionRequest {
  agenciaId: number
  fechaEnvio: string | null
  fechaViaje: string | null
  serviciosAdicionales: string
  margenPorcentaje: number
  lineas: CotizacionLineaRequest[]
}