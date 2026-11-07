import { http } from '@/api/http'
import { API_BASE_URL } from '@/config/env'
import type { FiltrosMarketing, KpisMarketing, MarketingPublicacion, PaginacionMarketing } from '../types'

const BASE = '/marketing'

export function publicarMarketing(texto: string, imagen: File): Promise<void> {
  const data = new FormData()
  data.append('texto', texto)
  data.append('imagen', imagen)
  return http.post(`${BASE}/publicaciones`, data).then(() => undefined)
}

export function listarPublicaciones(
  filtros: FiltrosMarketing,
  page: number,
  size: number,
): Promise<PaginacionMarketing<MarketingPublicacion>> {
  const params: Record<string, string | number> = { page, size }
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.estado) params.estado = filtros.estado
  return http.get(`${BASE}/publicaciones`, { params }).then((r) => r.data)
}

export function kpisMarketing(): Promise<KpisMarketing> {
  return http.get(`${BASE}/publicaciones/kpis`).then((r) => r.data)
}

export function detallePublicacion(id: number): Promise<MarketingPublicacion> {
  return http.get(`${BASE}/publicaciones/${id}`).then((r) => r.data)
}

export function urlImagenPublicacion(id: number): string {
  return `${API_BASE_URL}${BASE}/publicaciones/${id}/imagen`
}
