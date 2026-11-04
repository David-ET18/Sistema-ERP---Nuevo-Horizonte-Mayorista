import { http } from '@/api/http'
import { API_BASE_URL } from '@/config/env'
import type {
  FiltrosPromociones,
  KpisPromociones,
  PaginacionPromociones,
  Promocion,
  PromocionPayload,
  ServicioOpcion,
} from '../types'

const BASE = '/promociones'

export function listarPromociones(
  filtros: FiltrosPromociones,
  page: number,
  size: number,
): Promise<PaginacionPromociones<Promocion>> {
  const params: Record<string, string | number | boolean> = { page, size }
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.estado) params.estado = filtros.estado
  if (filtros.servicioId) params.servicioId = filtros.servicioId
  if (filtros.activa !== '') params.activa = filtros.activa === 'true'
  if (filtros.destacada) params.destacada = true
  return http.get(BASE, { params }).then((r) => r.data)
}

export function kpisPromociones(): Promise<KpisPromociones> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

export function listarServiciosDisponibles(): Promise<ServicioOpcion[]> {
  return http.get(`${BASE}/servicios`).then((r) => r.data)
}

export function detallePromocion(id: number): Promise<Promocion> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

export function crearPromocion(payload: PromocionPayload, imagen: File | null): Promise<Promocion> {
  return http.post(BASE, construirFormData(payload, imagen)).then((r) => r.data)
}

export function actualizarPromocion(
  id: number,
  payload: PromocionPayload,
  imagen: File | null,
): Promise<Promocion> {
  return http.put(`${BASE}/${id}`, construirFormData(payload, imagen)).then((r) => r.data)
}

export function cambiarEstadoPromocion(id: number, activa: boolean): Promise<Promocion> {
  const accion = activa ? 'activar' : 'desactivar'
  return http.patch(`${BASE}/${id}/${accion}`).then((r) => r.data)
}

export function eliminarPromocion(id: number): Promise<void> {
  return http.delete(`${BASE}/${id}`).then(() => undefined)
}

/** URL autenticada de la imagen; la version evita cache viejo tras editar. */
export function urlImagenPromocion(id: number, version?: string): string {
  const base = `${API_BASE_URL}${BASE}/${id}/imagen`
  return version ? `${base}?v=${encodeURIComponent(version)}` : base
}

function construirFormData(payload: PromocionPayload, imagen: File | null): FormData {
  const data = new FormData()
  data.append('nombre', payload.nombre)
  if (payload.descripcion) data.append('descripcion', payload.descripcion)
  if (payload.servicioId != null) data.append('servicioId', String(payload.servicioId))
  data.append('descuentoPorcentaje', String(payload.descuentoPorcentaje))
  if (payload.precioOriginal != null) data.append('precioOriginal', String(payload.precioOriginal))
  if (payload.precioPromocional != null) data.append('precioPromocional', String(payload.precioPromocional))
  if (payload.fechaInicio) data.append('fechaInicio', payload.fechaInicio)
  if (payload.fechaFin) data.append('fechaFin', payload.fechaFin)
  data.append('destacada', String(payload.destacada))
  data.append('activa', String(payload.activa))
  if (payload.quitarImagen) data.append('quitarImagen', 'true')
  if (imagen) data.append('imagen', imagen)
  return data
}
