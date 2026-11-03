import { http } from '@/api/http'
import { ENDPOINTS } from './endpoints'
import type {
  FiltrosNotificaciones,
  KpisNotificaciones,
  Notificacion,
  PaginacionNotificaciones,
} from '../types'

interface ParamsNotificaciones {
  q?: string
  leida?: boolean
  tipo?: string
}

function construirParams(
  filtros: FiltrosNotificaciones,
  page?: number,
  size?: number,
): ParamsNotificaciones & { page?: number; size?: number } {
  const params: ParamsNotificaciones & { page?: number; size?: number } = {}
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.leida !== '') params.leida = filtros.leida === 'true'
  if (filtros.tipo) params.tipo = filtros.tipo
  if (page != null) params.page = page
  if (size != null) params.size = size
  return params
}

/** Listado simple (sin paginar) del modal del topbar. */
export async function listarNotificaciones(
  filtros: FiltrosNotificaciones = { q: '', leida: '', tipo: '' },
): Promise<Notificacion[]> {
  const { data } = await http.get<Notificacion[]>(ENDPOINTS.notificaciones.base, {
    params: construirParams(filtros),
  })
  return data
}

/** Listado paginado de la página completa de notificaciones. */
export function listarNotificacionesPaginadas(
  filtros: FiltrosNotificaciones,
  page: number,
  size: number,
): Promise<PaginacionNotificaciones<Notificacion>> {
  return http
    .get(ENDPOINTS.notificaciones.paginado, { params: construirParams(filtros, page, size) })
    .then((r) => r.data)
}

export async function kpisNotificaciones(): Promise<KpisNotificaciones> {
  const { data } = await http.get<KpisNotificaciones>(ENDPOINTS.notificaciones.kpis)
  return data
}

export async function contarNoLeidas(): Promise<number> {
  const { data } = await http.get<number>(ENDPOINTS.notificaciones.noLeidas)
  return data
}

export async function marcarNotificacionLeida(id: number): Promise<void> {
  await http.patch(ENDPOINTS.notificaciones.marcarUna(id))
}

export async function marcarTodasNotificacionesLeidas(): Promise<number> {
  const { data } = await http.post<{ actualizadas: number }>(ENDPOINTS.notificaciones.marcarTodas)
  return data.actualizadas
}

/** Compatibilidad con el flujo anterior basado en un lote de ids. */
export async function marcarNotificacionesLeidas(ids: number[]): Promise<void> {
  if (ids.length === 1) {
    await marcarNotificacionLeida(ids[0])
    return
  }
  await http.post(ENDPOINTS.notificaciones.leidas, { ids })
}

export async function eliminarNotificacion(id: number): Promise<void> {
  await http.delete(ENDPOINTS.notificaciones.byId(id))
}

export async function eliminarNotificacionesLeidas(): Promise<number> {
  const { data } = await http.delete<{ eliminadas: number }>(ENDPOINTS.notificaciones.leidas)
  return data.eliminadas
}
