import { http } from '@/api/http'
import type {
  FiltrosPromociones,
  KpisPromociones,
  PaginacionPromociones,
  Promocion,
  PromocionPayload,
  ServicioOpcion,
} from '../types'

const BASE = '/promociones'

export function promocionImagenUrl(ruta: string | null): string | null {
  if (!ruta) return null
  if (/^https?:\/\//i.test(ruta)) return ruta
  return `${http.defaults.baseURL ?? ''}${ruta}`
}

function params(filtros: FiltrosPromociones, page: number, size: number) {
  const p: Record<string, string | number | boolean> = { page, size }
  if (filtros.q.trim()) p.q = filtros.q.trim()
  if (filtros.servicioId) p.servicioId = filtros.servicioId
  if (filtros.estado) p.estado = filtros.estado
  if (filtros.destacada) p.destacada = true
  return p
}

export function listarPromociones(
  filtros: FiltrosPromociones,
  page: number,
  size: number,
): Promise<PaginacionPromociones<Promocion>> {
  return http.get(BASE, { params: params(filtros, page, size) }).then((r) => r.data)
}

export function kpisPromociones(): Promise<KpisPromociones> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

export function listarServiciosPromocion(): Promise<ServicioOpcion[]> {
  return http.get(`${BASE}/servicios`).then((r) => r.data)
}

export function detallePromocion(id: number): Promise<Promocion> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

function aFormData(payload: PromocionPayload): FormData {
  const form = new FormData()
  form.append('titulo', payload.titulo)
  if (payload.descripcion) form.append('descripcion', payload.descripcion)
  form.append('descuento', String(payload.descuento))
  form.append('fechaInicio', payload.fechaInicio)
  form.append('fechaFin', payload.fechaFin)
  form.append('activo', String(payload.activo))
  form.append('destacada', String(payload.destacada))
  if (payload.servicioId !== null) form.append('servicioId', String(payload.servicioId))
  form.append('quitarImagen', String(payload.quitarImagen))
  if (payload.imagen) form.append('imagen', payload.imagen)
  return form
}

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

export function crearPromocion(payload: PromocionPayload): Promise<Promocion> {
  return http.post(BASE, aFormData(payload), MULTIPART).then((r) => r.data)
}

export function actualizarPromocion(id: number, payload: PromocionPayload): Promise<Promocion> {
  return http.put(`${BASE}/${id}`, aFormData(payload), MULTIPART).then((r) => r.data)
}

export function cambiarActivoPromocion(id: number, activo: boolean): Promise<Promocion> {
  return http.patch(`${BASE}/${id}/activo`, null, { params: { activo } }).then((r) => r.data)
}

export function eliminarPromocion(id: number): Promise<void> {
  return http.delete(`${BASE}/${id}`).then(() => undefined)
}
