import { useEffect, useState } from 'react'

import type { EstadoVenta, Venta } from '../types'
import { cambiarEstadoVenta, detalleVenta } from '../services/ventaService'
import { ESTADOS_VENTA, formatFechaHora, formatMonto } from '../utils'
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

export default function VentaDetailModal({ id, onClose, onEstadoCambiado, puedeEditar }: Props) {
  const [detalle, setDetalle] = useState<Venta | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState<EstadoVenta>('CONFIRMADA')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toast = useToastStore((s) => s.show)

  async function cargar() {
    try {
      const data = await detalleVenta(id)
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
      await cambiarEstadoVenta(detalle.id, nuevoEstado)
      await cargar()
      await onEstadoCambiado()
      toast('Estado de la venta actualizado', 'success')
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
          <p className="text-sm text-gray-500">Cargando venta...</p>
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
              <InfoRow etiqueta="Cotización" valor={detalle.cotizacionNumero || '-'} />
              <InfoRow etiqueta="Producto" valor={detalle.producto || '-'} />
              <InfoRow etiqueta="Tarifa" valor={detalle.tarifa || '-'} />
              <InfoRow etiqueta="Fecha de venta" valor={formatFechaHora(detalle.fechaVenta)} />
              <InfoRow etiqueta="Culminada" valor={formatFechaHora(detalle.fechaCulminada)} />
              <InfoRow etiqueta="Registrado por" valor={detalle.usuarioRegistro || '-'} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium text-gray-500">Detalle de montos</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Monto a pagar</p>
                  <p className="mt-1 font-semibold text-gray-900">{formatMonto(detalle.montoAPagar)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Comisión</p>
                  <p className="mt-1 font-semibold text-emerald-600">{formatMonto(detalle.comision)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">IGV</p>
                  <p className="mt-1 font-semibold text-gray-900">{formatMonto(detalle.igv)}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
                <span className="text-sm font-semibold text-gray-800">Total a cobrar</span>
                <p className="text-lg font-bold text-gray-900">{formatMonto(detalle.total)}</p>
              </div>
            </div>

            {detalle.notasOperativas && (
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-medium text-gray-500">Notas operativas</p>
                <p className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {detalle.notasOperativas}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium text-gray-500">Historial de estados</p>
              {detalle.historial.length === 0 ? (
                <p className="text-sm text-gray-400">Sin movimientos registrados</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {detalle.historial.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                    >
                      {h.estadoAnterior ? (
                        <EstadoBadge estado={h.estadoAnterior} />
                      ) : (
                        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          —
                        </span>
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
                    onChange={(e) => setNuevoEstado(e.target.value as EstadoVenta)}
                  >
                    {ESTADOS_VENTA.map((e) => (
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
