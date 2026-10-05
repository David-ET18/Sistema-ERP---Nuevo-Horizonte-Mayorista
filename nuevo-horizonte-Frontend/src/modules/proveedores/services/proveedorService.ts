import { http } from '@/api/http'
import type {
  Destino,
  FiltrosProveedores,
  KpisProveedores,
  PaginacionProveedores,
  Proveedor,
  ProveedorLista,
  ProveedorPayload,
} from '../types'

const BASE = '/proveedores'

export function listarProveedores(
  filtros: FiltrosProveedores,
  page: number,
  size: number,
): Promise<PaginacionProveedores<ProveedorLista>> {
  const params: Record<string, string | number> = { page, size }
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.tipoProveedor) params.tipoProveedor = filtros.tipoProveedor
  if (filtros.activo) params.activo = filtros.activo
  if (filtros.destinoId) params.destinoId = filtros.destinoId
  return http.get(`${BASE}`, { params }).then((r) => r.data)
}

export function kpisProveedores(): Promise<KpisProveedores> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

export function listarTiposServicio(): Promise<string[]> {
  return http.get(`${BASE}/tipos-servicio`).then((r) => r.data)
}

export function listarCondicionesComerciales(): Promise<string[]> {
  return http.get(`${BASE}/condiciones-comerciales`).then((r) => r.data)
}

export function listarDestinos(): Promise<Destino[]> {
  return http.get(`${BASE}/referencias/destinos`).then((r) => r.data)
}

export function detalleProveedor(id: number): Promise<Proveedor> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

export function crearProveedor(payload: ProveedorPayload): Promise<Proveedor> {
  return http.post(`${BASE}`, payload).then((r) => r.data)
}

export function actualizarProveedor(id: number, payload: ProveedorPayload): Promise<Proveedor> {
  return http.put(`${BASE}/${id}`, payload).then((r) => r.data)
}

export function eliminarProveedor(id: number): Promise<void> {
  return http.delete(`${BASE}/${id}`).then(() => undefined)
}
