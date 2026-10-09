import { http } from '@/api/http'
import type { Agencia, AgenciaLista, AgenciaPayload, FiltrosAgencias, KpisAgencias, PaginacionAgencias } from '../types'

const BASE = '/gestion-agencias'

export function logoAgenciaUrl(nombreArchivo: string | null): string | null {
  if (!nombreArchivo) return null
  return `${http.defaults.baseURL}${BASE}/logo/${nombreArchivo}`
}

export function listarAgencias(
  filtros: FiltrosAgencias,
  page: number,
  size: number,
): Promise<PaginacionAgencias<AgenciaLista>> {
  const params: Record<string, string | number | boolean> = { page, size }
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.categoria) params.categoria = filtros.categoria
  if (filtros.activo) params.activo = filtros.activo
  if (filtros.soloPrioritarias) params.soloPrioritarias = true
  return http.get(`${BASE}`, { params }).then((r) => r.data)
}

export function kpisAgencias(): Promise<KpisAgencias> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

export function listarCategorias(): Promise<string[]> {
  return http.get(`${BASE}/categorias`).then((r) => r.data)
}

export function detalleAgencia(id: number): Promise<Agencia> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

export function crearAgencia(payload: AgenciaPayload): Promise<Agencia> {
  return http.post(`${BASE}`, payload).then((r) => r.data)
}

export function actualizarAgencia(id: number, payload: AgenciaPayload): Promise<Agencia> {
  return http.put(`${BASE}/${id}`, payload).then((r) => r.data)
}

export function eliminarAgencia(id: number): Promise<void> {
  return http.delete(`${BASE}/${id}`).then(() => undefined)
}

export function activarAgencia(id: number): Promise<void> {
  return http.patch(`${BASE}/${id}/activar`).then(() => undefined)
}

export function subirLogoAgencia(id: number, archivo: File): Promise<{ logoUrl: string }> {
  const form = new FormData()
  form.append('archivo', archivo)
  return http
    .post(`${BASE}/${id}/logo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data)
}
