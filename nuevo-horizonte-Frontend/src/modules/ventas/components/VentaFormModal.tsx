import { useEffect, useState } from 'react'

import type {
  Agencia,
  CotizacionVenta,
  Producto,
  Tarifa,
  Venta,
  VentaRequest,
} from '../types'
import {
  actualizarVenta,
  cambiarEstadoVenta,
  crearVenta,
  listarAgencias,
  listarCotizacionesCerradas,
  listarProductos,
  listarTarifasVigentes,
} from '../services/ventaService'
import { formatMonto } from '../utils'
import { extractErrorMessage } from '@/api/http'
import { IconX } from '@/components/icons'

interface Props {
  venta?: Venta | null
  onClose: () => void
  onSaved: () => void
}

interface Guardado {
  id: number
  numero: string
}

const SECCION_CAMPO =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

export default function VentaFormModal({ venta, onClose, onSaved }: Props) {
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [cotizaciones, setCotizaciones] = useState<CotizacionVenta[]>([])
  const [cotizacionId, setCotizacionId] = useState('')
  const [productoId, setProductoId] = useState('')
  const [tarifaId, setTarifaId] = useState('')
  const [agenciaId, setAgenciaId] = useState('')
  const [montoAPagar, setMontoAPagar] = useState('')
  const [comision, setComision] = useState('')
  const [igv, setIgv] = useState('')
  const [notas, setNotas] = useState('')
  const [fechaVenta, setFechaVenta] = useState('')
  const [danos, setDanos] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [guardado, setGuardado] = useState<Guardado | null>(
    venta ? { id: venta.id, numero: venta.numero } : null,
  )

  const esEdicion = Boolean(venta)

  useEffect(() => {
    Promise.all([
      listarAgencias(),
      listarProductos(),
      listarTarifasVigentes(),
      listarCotizacionesCerradas(),
    ])
      .then(([ag, prod, tar, cots]) => {
        setAgencias(ag)
        setProductos(prod)
        setTarifas(tar)
        setCotizaciones(cots)
        if (venta) {
          setCotizacionId(venta.cotizacionId ? String(venta.cotizacionId) : '')
          setProductoId(venta.productoId ? String(venta.productoId) : '')
          setTarifaId(venta.tarifaId ? String(venta.tarifaId) : '')
          setAgenciaId(String(venta.agenciaId))
          setMontoAPagar(String(venta.montoAPagar ?? 0))
          setComision(String(venta.comision ?? 0))
          setIgv(String(venta.igv ?? 0))
          setNotas(venta.notasOperativas ?? '')
          setFechaVenta(venta.fechaVenta ? venta.fechaVenta.slice(0, 10) : '')
        } else {
          const hoy = new Date().toISOString().slice(0, 10)
          setFechaVenta(hoy)
        }
      })
      .catch((err) => setDanos(extractErrorMessage(err)))
  }, [venta])

  const cotizacionSeleccionada = cotizaciones.find((c) => String(c.id) === cotizacionId)
  const tarifaSeleccionada = tarifas.find((t) => String(t.id) === tarifaId)
  const productoSeleccionado = productos.find((p) => String(p.id) === productoId)

  const montoNum = Number(montoAPagar) || 0
  const comisionNum = Number(comision) || 0
  const igvNum = Number(igv) || 0
  const total = montoNum + igvNum

  const datosValidos = Boolean(agenciaId)

  function buildRequest(): VentaRequest {
    return {
      cotizacionId: cotizacionId ? Number(cotizacionId) : null,
      productoId: productoId ? Number(productoId) : null,
      tarifaId: tarifaId ? Number(tarifaId) : null,
      agenciaId: Number(agenciaId),
      idDetallePagos: null,
      montoAPagar: montoNum,
      comision: comisionNum,
      igv: igvNum,
      notasOperativas: notas.trim(),
      estado: 'CONFIRMADA',
      fechaVenta: fechaVenta || null,
    }
  }

  async function guardar(): Promise<Guardado> {
    const payload = buildRequest()
    if (guardado) {
      await actualizarVenta(guardado.id, payload)
      return guardado
    }
    const creada = await crearVenta(payload)
    const nuevo = { id: creada.id, numero: creada.numero }
    setGuardado(nuevo)
    return nuevo
  }

  async function guardarVenta() {
    setDanos(null)
    if (!agenciaId) {
      setDanos('Selecciona la agencia')
      return
    }
    if (!cotizacionId && !productoId && !tarifaId) {
      setDanos('Vincula una cotización o selecciona producto/tarifa')
      return
    }
    setSaving(true)
    try {
      await guardar()
      onSaved()
      onClose()
    } catch (err) {
      setDanos(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function guardarYConfirmar() {
    setDanos(null)
    if (!agenciaId) {
      setDanos('Selecciona la agencia')
      return
    }
    if (!cotizacionId && !productoId && !tarifaId) {
      setDanos('Vincula una cotización o selecciona producto/tarifa')
      return
    }
    setSaving(true)
    try {
      const g = await guardar()
      await cambiarEstadoVenta(g.id, 'CONFIRMADA')
      onSaved()
      onClose()
    } catch (err) {
      setDanos(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function alCambiarCotizacion(id: string) {
    setCotizacionId(id)
    const c = cotizaciones.find((x) => String(x.id) === id)
    if (c) {
      setAgenciaId(String(agencias.find((a) => a.nombre === c.agencia)?.id ?? ''))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 flex h-full w-[640px] max-w-[95vw] flex-col bg-gray-50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {esEdicion ? `Editar venta ${venta?.numero}` : 'Registrar venta'}
            </h3>
            <p className="text-xs text-gray-400">Completa los datos para registrar la venta confirmada</p>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <IconX width={18} height={18} />
          </button>
        </header>

        {danos && <p className="bg-red-50 px-5 py-2 text-[13px] text-red-700">{danos}</p>}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Origen</p>
            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Cotización</span>
              <select className={SECCION_CAMPO} value={cotizacionId} onChange={(e) => alCambiarCotizacion(e.target.value)}>
                <option value="">Sin vincular</option>
                {cotizaciones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero} · {c.agencia}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Producto y tarifa</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                <span>Producto (Paquete)</span>
                <select
                  className={SECCION_CAMPO}
                  value={productoId}
                  onChange={(e) => {
                    setProductoId(e.target.value)
                    if (e.target.value) setCotizacionId('')
                  }}
                >
                  <option value="">Seleccionar paquete</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {productoSeleccionado?.destino && (
                  <span className="text-xs text-gray-400">{productoSeleccionado.destino}</span>
                )}
              </label>
              <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                <span>Tarifa</span>
                <select
                  className={SECCION_CAMPO}
                  value={tarifaId}
                  onChange={(e) => {
                    setTarifaId(e.target.value)
                    if (e.target.value) setCotizacionId('')
                  }}
                >
                  <option value="">Seleccionar tarifa</option>
                  {tarifas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.servicio} · {t.destino} · {formatMonto(t.precio)}
                    </option>
                  ))}
                </select>
                {tarifaSeleccionada && (
                  <span className="text-xs text-gray-400">
                    {tarifaSeleccionada.proveedor} · {formatMonto(tarifaSeleccionada.precio)}
                  </span>
                )}
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Cliente y fechas</p>
            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Agencia *</span>
              <select className={SECCION_CAMPO} value={agenciaId} onChange={(e) => setAgenciaId(e.target.value)}>
                <option value="">Seleccionar agencia</option>
                {agencias.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Fecha de venta</span>
              <input type="date" className={SECCION_CAMPO} value={fechaVenta} onChange={(e) => setFechaVenta(e.target.value)} />
            </label>
            {cotizacionSeleccionada && (
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-[13px] text-blue-700">
                Cotización vinculada: {cotizacionSeleccionada.numero} · Estimado {formatMonto(cotizacionSeleccionada.montoEstimado)}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Montos</p>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                <span>Monto a pagar (S/)</span>
                <input type="number" step="0.01" min="0" className={SECCION_CAMPO} value={montoAPagar} onChange={(e) => setMontoAPagar(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                <span>Comisión (S/)</span>
                <input type="number" step="0.01" min="0" className={SECCION_CAMPO} value={comision} onChange={(e) => setComision(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                <span>IGV (S/)</span>
                <input type="number" step="0.01" min="0" className={SECCION_CAMPO} value={igv} onChange={(e) => setIgv(e.target.value)} />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2 text-sm">
              <span className="text-gray-500">Total a cobrar</span>
              <span className="font-semibold text-gray-900">{formatMonto(total)}</span>
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Notas operativas</p>
            <textarea
              rows={3}
              placeholder="Observaciones internas o detalles operativos..."
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </section>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4">
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={guardarVenta}
            disabled={saving || !datosValidos}
          >
            {saving ? 'Guardando...' : 'Guardar venta'}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            onClick={guardarYConfirmar}
            disabled={saving || !datosValidos}
          >
            {saving ? 'Guardando...' : 'Guardar y confirmar'}
          </button>
        </footer>
      </aside>
    </div>
  )
}
