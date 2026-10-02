import { http } from '@/api/http'
import type {
  Destino,
  DestinoPayload,
  FiltrosCatalogo,
  KpisCatalogo,
  Paginacion,
  Servicio,
  ServicioPayload,
} from '../types'

const BASE = '/catalogo'

function params(filtros: FiltrosCatalogo, grupoClave: string, page: number, size: number) {
  const p: Record<string, string | number> = { page, size }
  if (filtros.q.trim()) p.q = filtros.q.trim()
  if (filtros.grupo) p[grupoClave] = filtros.grupo
  if (filtros.activo) p.activo = filtros.activo
  return p
}

export function kpisCatalogo(): Promise<KpisCatalogo> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

// ---- Destinos ----

export function listarDestinos(filtros: FiltrosCatalogo, page: number, size: number): Promise<Paginacion<Destino>> {
  return http.get(`${BASE}/destinos`, { params: params(filtros, 'pais', page, size) }).then((r) => r.data)
}

export function listarPaises(): Promise<string[]> {
  return http.get(`${BASE}/destinos/paises`).then((r) => r.data)
}

export function crearDestino(payload: DestinoPayload): Promise<Destino> {
  return http.post(`${BASE}/destinos`, payload).then((r) => r.data)
}

export function actualizarDestino(id: number, payload: DestinoPayload): Promise<Destino> {
  return http.put(`${BASE}/destinos/${id}`, payload).then((r) => r.data)
}

export function eliminarDestino(id: number): Promise<void> {
  return http.delete(`${BASE}/destinos/${id}`).then(() => undefined)
}

// ---- Servicios ----

export function listarServicios(filtros: FiltrosCatalogo, page: number, size: number): Promise<Paginacion<Servicio>> {
  return http.get(`${BASE}/servicios`, { params: params(filtros, 'categoria', page, size) }).then((r) => r.data)
}

export function listarCategorias(): Promise<string[]> {
  return http.get(`${BASE}/servicios/categorias`).then((r) => r.data)
}

export function crearServicio(payload: ServicioPayload): Promise<Servicio> {
  return http.post(`${BASE}/servicios`, payload).then((r) => r.data)
}

export function actualizarServicio(id: number, payload: ServicioPayload): Promise<Servicio> {
  return http.put(`${BASE}/servicios/${id}`, payload).then((r) => r.data)
}

export function eliminarServicio(id: number): Promise<void> {
  return http.delete(`${BASE}/servicios/${id}`).then(() => undefined)
}
