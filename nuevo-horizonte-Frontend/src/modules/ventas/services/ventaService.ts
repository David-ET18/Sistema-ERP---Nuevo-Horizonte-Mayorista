import { http } from '@/api/http'
import type {
  Agencia,
  CotizacionVenta,
  FiltrosVentas,
  KpisVentas,
  PaginacionVentas,
  Producto,
  Tarifa,
  Venta,
  VentaRequest,
} from '../types'

const BASE = '/ventas'

export async function listarVentas(
  filtros: FiltrosVentas,
  page: number,
  size: number,
): Promise<PaginacionVentas> {
  const params = new URLSearchParams()
  if (filtros.q.trim()) params.set('q', filtros.q.trim())
  if (filtros.estado) params.set('estado', filtros.estado)
  if (filtros.agenciaId) params.set('agenciaId', filtros.agenciaId)
  if (filtros.desde) params.set('desde', filtros.desde)
  if (filtros.hasta) params.set('hasta', filtros.hasta)
  params.set('page', String(page))
  params.set('size', String(size))
  const { data } = await http.get<PaginacionVentas>(BASE, { params })
  return data
}

export async function kpisVentas(): Promise<KpisVentas> {
  const { data } = await http.get<KpisVentas>(`${BASE}/kpis`)
  return data
}

export async function detalleVenta(id: number): Promise<Venta> {
  const { data } = await http.get<Venta>(`${BASE}/${id}`)
  return data
}

export async function crearVenta(payload: VentaRequest): Promise<Venta> {
  const { data } = await http.post<Venta>(BASE, payload)
  return data
}

export async function actualizarVenta(id: number, payload: VentaRequest): Promise<Venta> {
  const { data } = await http.put<Venta>(`${BASE}/${id}`, payload)
  return data
}

export async function eliminarVenta(id: number): Promise<void> {
  await http.delete(`${BASE}/${id}`)
}

export async function cambiarEstadoVenta(id: number, estado: string): Promise<Venta> {
  const { data } = await http.patch<Venta>(`${BASE}/${id}/estado`, { estado })
  return data
}

export async function listarAgencias(): Promise<Agencia[]> {
  const { data } = await http.get<Agencia[]>(`${BASE}/referencias/agencias`)
  return data
}

export async function listarProductos(): Promise<Producto[]> {
  const { data } = await http.get<Producto[]>(`${BASE}/referencias/productos`)
  return data
}

export async function listarTarifasVigentes(): Promise<Tarifa[]> {
  const { data } = await http.get<Tarifa[]>(`${BASE}/referencias/tarifas`)
  return data
}

export async function listarCotizacionesCerradas(): Promise<CotizacionVenta[]> {
  const { data } = await http.get<CotizacionVenta[]>(`${BASE}/referencias/cotizaciones`)
  return data
}
