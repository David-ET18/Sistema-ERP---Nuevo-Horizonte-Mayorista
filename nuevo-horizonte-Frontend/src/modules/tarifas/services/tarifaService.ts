import { http } from '@/api/http'
import type {
  Destino,
  FiltrosTarifas,
  KpisTarifas,
  PaginacionTarifas,
  ProveedorRef,
  Servicio,
  Tarifa,
  TarifaLista,
  TarifaPayload,
} from '../types'

const BASE = '/tarifas'

export function listarTarifas(
  filtros: FiltrosTarifas,
  page: number,
  size: number,
): Promise<PaginacionTarifas<TarifaLista>> {
  const params: Record<string, string | number> = { page, size }
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.proveedorId) params.proveedorId = filtros.proveedorId
  if (filtros.destinoId) params.destinoId = filtros.destinoId
  if (filtros.servicioId) params.servicioId = filtros.servicioId
  if (filtros.estado) params.estado = filtros.estado
  return http.get(`${BASE}`, { params }).then((r) => r.data)
}

export function kpisTarifas(): Promise<KpisTarifas> {
  return http.get(`${BASE}/kpis`).then((r) => r.data)
}

export function listarTiposTarifa(): Promise<string[]> {
  return http.get(`${BASE}/tipos-tarifa`).then((r) => r.data)
}

export function listarMonedas(): Promise<string[]> {
  return http.get(`${BASE}/monedas`).then((r) => r.data)
}

export function listarProveedores(): Promise<ProveedorRef[]> {
  return http.get(`${BASE}/referencias/proveedores`).then((r) => r.data)
}

export function listarDestinos(): Promise<Destino[]> {
  return http.get(`${BASE}/referencias/destinos`).then((r) => r.data)
}

export function listarServicios(): Promise<Servicio[]> {
  return http.get(`${BASE}/referencias/servicios`).then((r) => r.data)
}

export function detalleTarifa(id: number): Promise<Tarifa> {
  return http.get(`${BASE}/${id}`).then((r) => r.data)
}

export function crearTarifa(payload: TarifaPayload): Promise<Tarifa> {
  return http.post(`${BASE}`, payload).then((r) => r.data)
}

export function actualizarTarifa(id: number, payload: TarifaPayload): Promise<Tarifa> {
  return http.put(`${BASE}/${id}`, payload).then((r) => r.data)
}

export function eliminarTarifa(id: number): Promise<void> {
  return http.delete(`${BASE}/${id}`).then(() => undefined)
}

export type FormatoExportacionTarifas = 'csv' | 'excel'

function paramsExportacion(filtros: FiltrosTarifas): Record<string, string> {
  const params: Record<string, string> = {}
  if (filtros.q.trim()) params.q = filtros.q.trim()
  if (filtros.proveedorId) params.proveedorId = filtros.proveedorId
  if (filtros.destinoId) params.destinoId = filtros.destinoId
  if (filtros.servicioId) params.servicioId = filtros.servicioId
  if (filtros.estado) params.estado = filtros.estado
  return params
}

/** Descarga las tarifas que cumplen los filtros actuales en CSV o Excel (.xls). */
export async function descargarTarifas(
  filtros: FiltrosTarifas,
  formato: FormatoExportacionTarifas,
): Promise<void> {
  const response = await http.get(`${BASE}/exportar/${formato}`, {
    params: paramsExportacion(filtros),
    responseType: 'blob',
  })
  const extension = formato === 'csv' ? 'csv' : 'xls'
  const fecha = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob([response.data]))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `tarifas_${fecha}.${extension}`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export function archivoRespaldoUrl(nombreArchivo: string | null): string | null {
  if (!nombreArchivo) return null
  return `${http.defaults.baseURL}${BASE}/archivo-respaldo/${nombreArchivo}`
}

export function subirArchivoRespaldo(id: number, archivo: File): Promise<{ archivoRespaldoUrl: string }> {
  const form = new FormData()
  form.append('archivo', archivo)
  return http
    .post(`${BASE}/${id}/archivo-respaldo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data)
}
