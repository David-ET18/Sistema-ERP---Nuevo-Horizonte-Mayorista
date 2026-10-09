import { useEffect, useState } from 'react'

import type { Cotizacion, EstadoCotizacion } from '../types'
import { cambiarEstadoCotizacion, detalleCotizacion } from '../services/cotizacionService'
import { ESTADOS_COTIZACION, formatDateDDMMYYYY, formatFechaHora, formatMonto } from '../utils'
import { extractErrorMessage } from '@/api/http'
import EstadoBadge from './EstadoBadge'
import { IconX } from '@/components/icons'
import ModalMarca from '@/components/ModalMarca'
import { useToastStore } from '@/store/toastStore'

interface Props {
  id: number
  onClose: () => void
  onEstadoCambiado: () => Promise<void>
  puedeEditar: boolean
}

export default function CotizacionDetailModal({
  id,
  onClose,
  onEstadoCambiado,
  puedeEditar,
}: Props) {
  const [detalle, setDetalle] = useState<Cotizacion | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState<EstadoCotizacion>('PENDIENTE')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toast = useToastStore((s) => s.show)

  async function cargar() {
    try {
      const data = await detalleCotizacion(id)
      setDetalle(data)
      setNuevoEstado(data.estado)
      setError(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function aplicarEstado() {
    if (!detalle) return
    setSaving(true)
    setError(null)
    try {
      await cambiarEstadoCotizacion(detalle.id, nuevoEstado)
      await cargar()
      await onEstadoCambiado()
      toast('Estado de la cotización actualizado', 'success')
    } catch (err) {
      setError(extractErrorMessage(err))
      toast(`No se pudo actualizar el estado: ${extractErrorMessage(err)}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!detalle && !error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
        <div className="rounded-xl bg-white p-6">
          <p className="text-sm text-gray-500">Cargando cotización...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="animate-modal-pop flex max-h-[90vh] w-[720px] max-w-[95vw] flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="-mx-6 -mt-6 mb-1 rounded-t-2xl">
          <ModalMarca />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{detalle?.numero}</h3>
            {detalle && <EstadoBadge estado={detalle.estado} />}
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        {error && <p className="text-[13px] text-red-700">{error}</p>}

        {detalle && (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
              <InfoRow etiqueta="Agencia" valor={detalle.agencia} />
              <InfoRow etiqueta="RUC" valor={detalle.rucAgencia || '-'} />
              <InfoRow etiqueta="Asesor" valor={detalle.asesor || '-'} />
              <InfoRow etiqueta="Destino" valor={detalle.destino || '-'} />
              <InfoRow etiqueta="Producto" valor={detalle.producto || '-'} />
              <InfoRow etiqueta="Fecha de viaje" valor={formatDateDDMMYYYY(detalle.fechaViaje)} />
              <InfoRow etiqueta="Pasajeros" valor={String(detalle.lineas.reduce((acc, l) => acc + l.cantidadPax, 0))} />
              <InfoRow etiqueta="Creada" valor={formatFechaHora(detalle.fechaCreacion)} />
              <InfoRow etiqueta="Enviada" valor={formatFechaHora(detalle.fechaEnvio)} />
              <InfoRow etiqueta="Cerrada" valor={formatFechaHora(detalle.fechaCierre)} />
              <InfoRow etiqueta="Margen" valor={`${Number(detalle.margenPorcentaje ?? 0)} %`} />
              <InfoRow etiqueta="Servicios adicionales" valor={detalle.serviciosAdicionales || '-'} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium text-gray-500">Productos incluidos</p>
              <table className="w-full overflow-hidden rounded-lg border border-gray-100 text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2 font-semibold">Servicio</th>
                    <th className="px-3 py-2 font-semibold">Destino</th>
                    <th className="px-3 py-2 font-semibold">Proveedor</th>
                    <th className="px-3 py-2 text-right font-semibold">P. Unitario</th>
                    <th className="px-3 py-2 text-center font-semibold">Pax</th>
                    <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.lineas.map((l) => (
                    <tr key={l.id} className="border-t border-gray-100">
                      <td className="px-3 py-2">{l.servicio}</td>
                      <td className="px-3 py-2">{l.destino}</td>
                      <td className="px-3 py-2">{l.proveedor}</td>
                      <td className="px-3 py-2 text-right">{formatMonto(l.precioUnitario)}</td>
                      <td className="px-3 py-2 text-center">{l.cantidadPax}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatMonto(l.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[13px] text-gray-500">Costo base</span>
                <p className="font-medium text-gray-800">{formatMonto(detalle.costoBase)}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[13px] text-gray-500">Margen</span>
                <p className="font-medium text-gray-800">{formatMonto(detalle.margenMonto)}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[13px] text-gray-500">Precio de venta</span>
                <p className="font-medium text-gray-800">{formatMonto(detalle.precioVenta)}</p>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
                <span className="text-sm font-semibold text-gray-800">Total estimado</span>
                <p className="text-lg font-bold text-gray-900">{formatMonto(detalle.monto)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium text-gray-500">Historial de estados</p>
              {detalle.historial.length === 0 ? (
                <p className="text-sm text-gray-400">Sin movimientos registrados</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {detalle.historial.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      {h.estadoAnterior ? (
                        <EstadoBadge estado={h.estadoAnterior} />
                      ) : (
                        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">—</span>
                      )}
                      <span className="text-gray-400">→</span>
                      <EstadoBadge estado={h.estadoNuevo} />
                      <span className="ml-auto text-xs text-gray-400">
                        {formatFechaHora(h.fechaCambio)}
                        {h.usuario ? ` · ${h.usuario}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {puedeEditar && (
              <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
                <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                  <span>Cambiar estado</span>
                  <select
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as EstadoCotizacion)}
                  >
                    {ESTADOS_COTIZACION.map((e) => (
                      <option key={e.valor} value={e.valor}>
                        {e.etiqueta}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={aplicarEstado}
                  disabled={saving || nuevoEstado === detalle.estado}
                >
                  {saving ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <p className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-400">{etiqueta}</span>
      <span className="font-medium capitalize text-gray-800">{valor}</span>
    </p>
  )
}