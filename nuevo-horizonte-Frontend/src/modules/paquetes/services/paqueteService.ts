import { http } from '@/api/http'
import type {
  Destino,
  FiltrosPaquetes,
  KpisPaquetes,
  PaginacionPaquetes,
  Paquete,
  PaqueteLista,
  PaquetePayload,
} from '../types'

const BASE = '/paquetes'

export function listarPaquetes(
  filtros: FiltrosPaquetes,
  page: number,
  size: number,
): Promise<PaginacionPaquetes<PaqueteLista>> {
  const params: Record<string, string | number | boolean> = { page, size }
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.categoria) params.categoria = filtros.categoria
  if (filtros.estado) params.estado = filtros.estado
  if (filtros.destacado) params.destacado = true
  if (filtros.destinoId) params.destinoId = filtros.destinoId
  return http.get(`${BASE}`, { params }).then((r) => r.data)
}

export function kpisPaquetes(): Promise<KpisPaquetes> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

export function listarCategorias(): Promise<string[]> {
  return http.get(`${BASE}/categorias`).then((r) => r.data)
}

export function listarMonedas(): Promise<string[]> {
  return http.get(`${BASE}/monedas`).then((r) => r.data)
}

export function listarOpcionesIncluye(): Promise<string[]> {
  return http.get(`${BASE}/opciones-incluye`).then((r) => r.data)
}

export function listarAerolineasSugeridas(): Promise<string[]> {
  return http.get(`${BASE}/aerolineas-sugeridas`).then((r) => r.data)
}

export function listarDestinos(): Promise<Destino[]> {
  return http.get(`${BASE}/referencias/destinos`).then((r) => r.data)
}

export function detallePaquete(id: number): Promise<Paquete> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

export function crearPaquete(payload: PaquetePayload): Promise<Paquete> {
  return http.post(`${BASE}`, payload).then((r) => r.data)
}

export function actualizarPaquete(id: number, payload: PaquetePayload): Promise<Paquete> {
  return http.put(`${BASE}/${id}`, payload).then((r) => r.data)
}

export function eliminarPaquete(id: number): Promise<void> {
  return http.delete(`${BASE}/${id}`).then(() => undefined)
}
