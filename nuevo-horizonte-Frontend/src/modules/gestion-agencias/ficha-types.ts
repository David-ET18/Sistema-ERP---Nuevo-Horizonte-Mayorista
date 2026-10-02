export interface AgenciaFichaResumen {
  id: number
  nombre: string
  logoUrl: string | null
  esPrioritaria: boolean
  activo: boolean
  ultimaInteraccion: string | null
}

export interface ResumenComercial {
  comprasAcumuladas: number
  cotizaciones: number
  ventasCerradas: number
  ultimaCompra: string | null
}

export interface HistorialComercialItem {
  tipo: 'COTIZACION' | 'VENTA'
  numero: string
  titulo: string
  estado: string
  fecha: string
}

export interface NotaSeguimiento {
  id: number
  tipo: string
  notas: string | null
  usuario: string | null
  fecha: string
}
