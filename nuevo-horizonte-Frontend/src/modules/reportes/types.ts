export type PeriodoRendimiento = '7D' | '30D' | 'MES' | 'ANIO'

export interface ResumenEjecutivo {
  cotizacionesCerradasPct: number
  tiempoRespuestaHoras: number | null
  tiempoRespuestaDeltaPct: number | null
  ventasDelPeriodo: number
  ventasDeltaPct: number | null
}

export interface PuntoSerie {
  label: string
  valor: number
}

export interface RankingAgencia {
  agenciaId: number
  agencia: string
  monto: number
}

export interface TarifasPorProveedor {
  proveedorId: number
  proveedor: string
  cantidad: number
}

export interface Alerta {
  severidad: 'WARNING' | 'INFO'
  cantidad: number
  mensaje: string
}
