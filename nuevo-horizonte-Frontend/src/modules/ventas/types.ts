export type EstadoVenta =
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADA'
  | 'PAGADA'
  | 'CULMINADA'
  | 'ANULADA'

export interface VentaLista {
  id: number
  numero: string
  agencia: string
  producto: string
  tarifa: string
  montoAPagar: number
  comision: number
  igv: number
  estado: EstadoVenta
  fechaVenta: string
}

export interface VentaHistorial {
  id: number
  estadoAnterior: EstadoVenta | null
  estadoNuevo: EstadoVenta
  fechaCambio: string
  usuario: string | null
}

export interface Venta {
  id: number
  numero: string
  cotizacionId: number | null
  cotizacionNumero: string | null
  productoId: number | null
  producto: string | null
  tarifaId: number | null
  tarifa: string | null
  tarifaPrecio: number | null
  agenciaId: number
  agencia: string
  rucAgencia: string
  idDetallePagos: number | null
  montoAPagar: number
  comision: number
  igv: number
  total: number
  notasOperativas: string | null
  estado: EstadoVenta
  fechaVenta: string
  fechaCulminada: string | null
  fechaCreacion: string
  usuarioRegistro: string | null
  historial: VentaHistorial[]
}

export interface KpisVentas {
  ventasMes: number
  montoVendidoMes: number
  pagosPendientes: number
}

export interface Agencia {
  id: number
  razonSocial: string
  nombreComercial: string | null
  nombre: string
  ruc: string
  activo: boolean
}

export interface Producto {
  id: number
  nombre: string
  destino: string | null
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

export interface CotizacionVenta {
  id: number
  numero: string
  agencia: string
  montoEstimado: number
}

export interface FiltrosVentas {
  q: string
  estado: EstadoVenta | ''
  agenciaId: string
  desde: string
  hasta: string
}

export interface PaginacionVentas {
  content: VentaLista[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface VentaRequest {
  cotizacionId: number | null
  productoId: number | null
  tarifaId: number | null
  agenciaId: number
  idDetallePagos: number | null
  montoAPagar: number
  comision: number
  igv: number
  notasOperativas: string
  estado: EstadoVenta
  fechaVenta: string | null
}
