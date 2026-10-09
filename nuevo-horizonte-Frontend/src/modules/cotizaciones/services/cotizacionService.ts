import { http } from '@/api/http'
import type {
  Agencia,
  Cotizacion,
  CotizacionRequest,
  Destino,
  FiltrosCotizaciones,
  KpisCotizaciones,
  PaginacionCotizaciones,
  Tarifa,
} from '../types'

const BASE = '/cotizaciones'

export async function listarCotizaciones(
  filtros: FiltrosCotizaciones,
  page: number,
  size: number,
): Promise<PaginacionCotizaciones> {
  const params = new URLSearchParams()
  if (filtros.q.trim()) params.set('q', filtros.q.trim())
  if (filtros.estado) params.set('estado', filtros.estado)
  if (filtros.agenciaId) params.set('agenciaId', filtros.agenciaId)
  if (filtros.destinoId) params.set('destinoId', filtros.destinoId)
  if (filtros.desde) params.set('desde', filtros.desde)
  if (filtros.hasta) params.set('hasta', filtros.hasta)
  params.set('page', String(page))
  params.set('size', String(size))
  const { data } = await http.get<PaginacionCotizaciones>(BASE, { params })
  return data
}

export async function kpisCotizaciones(): Promise<KpisCotizaciones> {
  const { data } = await http.get<KpisCotizaciones>(`${BASE}/kpis`)
  return data
}

export async function detalleCotizacion(id: number): Promise<Cotizacion> {
  const { data } = await http.get<Cotizacion>(`${BASE}/${id}`)
  return data
}

export async function crearCotizacion(
  payload: CotizacionRequest,
): Promise<Cotizacion> {
  const { data } = await http.post<Cotizacion>(BASE, payload)
  return data
}

export async function actualizarCotizacion(
  id: number,
  payload: CotizacionRequest,
): Promise<Cotizacion> {
  const { data } = await http.put<Cotizacion>(`${BASE}/${id}`, payload)
  return data
}

export async function cambiarEstadoCotizacion(
  id: number,
  estado: string,
): Promise<Cotizacion> {
  const { data } = await http.patch<Cotizacion>(`${BASE}/${id}/estado`, { estado })
  return data
}

export async function listarAgencias(): Promise<Agencia[]> {
  const { data } = await http.get<Agencia[]>(`${BASE}/referencias/agencias`)
  return data
}

export async function listarDestinos(): Promise<Destino[]> {
  const { data } = await http.get<Destino[]>(`${BASE}/referencias/destinos`)
  return data
}

export async function listarTarifasVigentes(): Promise<Tarifa[]> {
  const { data } = await http.get<Tarifa[]>(`${BASE}/referencias/tarifas`)
  return data
}