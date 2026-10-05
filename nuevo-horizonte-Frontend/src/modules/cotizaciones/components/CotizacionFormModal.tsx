import { useEffect, useState } from 'react'

import type {
  Agencia,
  Cotizacion,
  CotizacionRequest,
  Destino,
  Tarifa,
} from '../types'
import {
  actualizarCotizacion,
  cambiarEstadoCotizacion,
  crearCotizacion,
  listarAgencias,
  listarDestinos,
  listarTarifasVigentes,
} from '../services/cotizacionService'
import { formatDateDDMMYYYY, formatMonto } from '../utils'
import { extractErrorMessage } from '@/api/http'
import { IconX } from '@/components/icons'
import { useFormDraft } from '@/hooks/useFormDraft'

interface Props {
  cotizacion?: Cotizacion | null
  onClose: () => void
  onSaved: () => void
}

interface Guardado {
  id: number
  numero: string
}

interface CotizacionFormState {
  agenciaId: string
  destinoId: string
  tarifaId: string
  fechaViaje: string
  numPasajeros: string
  serviciosAdicionales: string
  margenPct: string
}

const VACIO: CotizacionFormState = {
  agenciaId: '',
  destinoId: '',
  tarifaId: '',
  fechaViaje: '',
  numPasajeros: '2',
  serviciosAdicionales: '',
  margenPct: '15',
}

const SECCION_CAMPO =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

export default function CotizacionFormModal({
  cotizacion,
  onClose,
  onSaved,
}: Props) {
  const [paso, setPaso] = useState(1)
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [destinos, setDestinos] = useState<Destino[]>([])
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [formEdicion, setFormEdicion] = useState<CotizacionFormState>(VACIO)
  const [danos, setDanos] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [guardado, setGuardado] = useState<Guardado | null>(
    cotizacion ? { id: cotizacion.id, numero: cotizacion.numero } : null,
  )

  const esEdicion = Boolean(cotizacion)

  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<CotizacionFormState>('cotizacion:nueva', VACIO)
  const form = esEdicion ? formEdicion : borrador.valor
  const { agenciaId, destinoId, tarifaId, fechaViaje, numPasajeros, serviciosAdicionales, margenPct } = form

  function setCampo<K extends keyof CotizacionFormState>(campo: K, valor: CotizacionFormState[K]) {
    if (esEdicion) setFormEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
  }

  function limpiarFormulario() {
    setFormEdicion(VACIO)
    setGuardado(null)
    setPaso(1)
    borrador.reset()
  }

  useEffect(() => {
    Promise.all([listarAgencias(), listarDestinos(), listarTarifasVigentes()])
      .then(([ag, de, tar]) => {
        setAgencias(ag)
        setDestinos(de)
        setTarifas(tar)
        if (cotizacion) {
          setFormEdicion({
            agenciaId: String(cotizacion.agenciaId),
            destinoId: '',
            tarifaId: '',
            fechaViaje: cotizacion.fechaViaje ? cotizacion.fechaViaje.slice(0, 10) : '',
            numPasajeros: '2',
            serviciosAdicionales: cotizacion.serviciosAdicionales ?? '',
            margenPct: String(cotizacion.margenPorcentaje ?? 15),
          })
          const linea = cotizacion.lineas[0]
          if (linea) {
            const tarifa = tar.find((t) => t.id === linea.tarifaId)
            setFormEdicion((prev) => ({
              ...prev,
              tarifaId: String(linea.tarifaId),
              numPasajeros: String(linea.cantidadPax),
              destinoId: tarifa ? String(tarifa.destinoId) : '',
            }))
          }
        }
      })
      .catch((err) => setDanos(extractErrorMessage(err)))
  }, [cotizacion])

  const tarifasDelDestino = destinoId
    ? tarifas.filter((t) => String(t.destinoId) === destinoId)
    : tarifas

  const tarifaSeleccionada: Tarifa | undefined = tarifas.find(
    (t) => String(t.id) === tarifaId,
  )
  const agenciaSeleccionada: Agencia | undefined = agencias.find(
    (a) => String(a.id) === agenciaId,
  )
  const pax = Number(numPasajeros) || 0
  const costoBase = tarifaSeleccionada ? tarifaSeleccionada.precio * pax : 0
  const margenMonto = (costoBase * (Number(margenPct) || 0)) / 100
  const precioVenta = costoBase + margenMonto
  const total = precioVenta

  const datosValidos = Boolean(agenciaId && tarifaId && pax > 0)

  function elegirProducto(idTarifa: string) {
    setCampo('tarifaId', idTarifa)
    const tarifa = tarifas.find((t) => String(t.id) === idTarifa)
    if (tarifa) setCampo('destinoId', String(tarifa.destinoId))
  }

  function buildRequest(): CotizacionRequest {
    return {
      agenciaId: Number(agenciaId),
      fechaEnvio: null,
      fechaViaje: fechaViaje || null,
      serviciosAdicionales: serviciosAdicionales.trim(),
      margenPorcentaje: Number(margenPct) || 0,
      lineas: [{ tarifaId: Number(tarifaId), cantidadPax: pax }],
    }
  }

  async function guardar(payload: CotizacionRequest): Promise<Guardado> {
    if (guardado) {
      await actualizarCotizacion(guardado.id, payload)
      return guardado
    }
    const creada = await crearCotizacion(payload)
    const nuevoGuardado = { id: creada.id, numero: creada.numero }
    setGuardado(nuevoGuardado)
    return nuevoGuardado
  }

  function prepararDatos(): CotizacionRequest | null {
    setDanos(null)
    if (!agenciaId) {
      setDanos('Selecciona la agencia')
      return null
    }
    if (!tarifaId) {
      setDanos('Selecciona el producto')
      return null
    }
    if (pax <= 0) {
      setDanos('El número de pasajeros debe ser mayor a 0')
      return null
    }
    return buildRequest()
  }

  async function guardarBorrador() {
    const payload = prepararDatos()
    if (!payload) return
    setSaving(true)
    try {
      await guardar(payload)
      onSaved()
    } catch (err) {
      setDanos(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function siguiente() {
    const payload = prepararDatos()
    if (!payload) return
    setSaving(true)
    try {
      await guardar(payload)
      onSaved()
      setPaso(2)
    } catch (err) {
      setDanos(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function enviar() {
    if (!guardado) {
      const payload = prepararDatos()
      if (!payload) return
      setSaving(true)
      try {
        await guardar(payload)
      } catch (err) {
        setDanos(extractErrorMessage(err))
        setSaving(false)
        return
      }
    }
    const idFinal = guardado?.id
    if (!idFinal) return
    setSaving(true)
    try {
      await cambiarEstadoCotizacion(idFinal, 'ENVIADA')
      limpiarFormulario()
      onSaved()
      onClose()
    } catch (err) {
      setDanos(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function generarPDF() {
    const agencia = agenciaSeleccionada?.nombre ?? ''
    const destino = tarifaSeleccionada?.destino ?? ''
    const producto = tarifaSeleccionada?.servicio ?? ''
    const contenido = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cotización ${guardado?.numero ?? 'Borrador'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .sub { color: #6b7280; font-size: 12px; margin-bottom: 24px; }
    h2 { font-size: 13px; text-transform: uppercase; color: #374151; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td, th { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #f9fafb; }
    .total { font-weight: 700; text-align: right; font-size: 15px; }
    .fila { margin-bottom: 6px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <h1>Nuevo Horizonte — Cotización ${guardado?.numero ?? 'Borrador'}</h1>
  <p class="sub">Agencia Mayorista · Cotización comercial</p>

  <h2>Agencia y destino</h2>
  <table>
    <tr><th>Agencia</th><td>${agencia}</td></tr>
    <tr><th>Destino</th><td>${destino}</td></tr>
    <tr><th>Producto</th><td>${producto}</td></tr>
  </table>

  <h2>Información básica</h2>
  <table>
    <tr><th>Fecha de viaje</th><td>${formatDateDDMMYYYY(fechaViaje)}</td></tr>
    <tr><th>Número de pasajeros</th><td>${pax}</td></tr>
    ${
      serviciosAdicionales.trim()
        ? `<tr><th>Servicios adicionales</th><td>${serviciosAdicionales}</td></tr>`
        : ''
    }
  </table>

  <h2>Resumen estimado</h2>
  <div class="fila"><span>Costo base</span><span>${formatMonto(costoBase)}</span></div>
  <div class="fila"><span>Margen</span><span>${formatMonto(margenMonto)}</span></div>
  <div class="fila"><span>Precio de venta</span><span>${formatMonto(precioVenta)}</span></div>
  <div class="total">Total estimado: ${formatMonto(total)}</div>

  <script>window.onload = function () { window.print(); }</script>
</body>
</html>`

    const win = window.open('', '_blank', 'width=820,height=640')
    if (!win) return
    win.document.write(contenido)
    win.document.close()
    win.focus()
  }

  function botonOutline(etiqueta: string, accion: () => void | Promise<void>) {
    return (
      <button
        type="button"
        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={accion}
        disabled={saving || !datosValidos}
      >
        {etiqueta}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 flex h-full w-[620px] max-w-[95vw] flex-col bg-gray-50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {esEdicion ? `Editar ${cotizacion?.numero}` : 'Nueva cotización'}
            </h3>
            <p className="text-xs text-gray-400">
              Paso {paso} de 2 · {paso === 1 ? 'Datos de la propuesta' : 'Revisión y envío'}
            </p>
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

        <div className="flex flex-1 gap-4 overflow-y-auto p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {paso === 1 ? (
              <>
                <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Agencia y destino
                  </p>
                  <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                    <span>Agencia *</span>
                    <select
                      className={SECCION_CAMPO}
                      value={agenciaId}
                      onChange={(e) => setCampo('agenciaId', e.target.value)}
                    >
                      <option value="">Seleccionar agencia</option>
                      {agencias.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                    <span>Producto *</span>
                    <select
                      className={SECCION_CAMPO}
                      value={tarifaId}
                      onChange={(e) => elegirProducto(e.target.value)}
                    >
                      <option value="">Seleccionar producto</option>
                      {tarifasDelDestino.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.servicio} · {t.proveedor} · {formatMonto(t.precio)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                    <span>Destino *</span>
                    <select
                      className={SECCION_CAMPO}
                      value={destinoId}
                      onChange={(e) => {
                        setCampo('destinoId', e.target.value)
                        setCampo('tarifaId', '')
                      }}
                    >
                      <option value="">Seleccionar destino</option>
                      {destinos.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} · {d.pais}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>

                <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Información básica
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                      <span>Fecha de viaje *</span>
                      <input
                        type="date"
                        className={SECCION_CAMPO}
                        value={fechaViaje}
                        onChange={(e) => setCampo('fechaViaje', e.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                      <span>Número de pasajeros *</span>
                      <input
                        type="number"
                        min={1}
                        className={SECCION_CAMPO}
                        value={numPasajeros}
                        onChange={(e) => setCampo('numPasajeros', e.target.value)}
                      />
                    </label>
                  </div>
                </section>

                <section className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Servicios adicionales
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Describir los servicios adicionales..."
                    className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                    value={serviciosAdicionales}
                    onChange={(e) => setCampo('serviciosAdicionales', e.target.value)}
                  />
                </section>
              </>
            ) : (
              <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Revisión y envío
                </p>
                <dl className="flex flex-col gap-2 text-sm">
                  <Row etiqueta="Cotización" valor={guardado?.numero ?? '-'} />
                  <Row etiqueta="Agencia" valor={agenciaSeleccionada?.nombre ?? '-'} />
                  <Row etiqueta="Destino" valor={tarifaSeleccionada?.destino ?? '-'} />
                  <Row etiqueta="Producto" valor={tarifaSeleccionada?.servicio ?? '-'} />
                  <Row
                    etiqueta="Proveedor"
                    valor={tarifaSeleccionada?.proveedor ?? '-'}
                  />
                  <Row etiqueta="Fecha de viaje" valor={formatDateDDMMYYYY(fechaViaje)} />
                  <Row etiqueta="Pasajeros" valor={String(pax)} />
                  {serviciosAdicionales.trim() && (
                    <Row etiqueta="Servicios adicionales" valor={serviciosAdicionales} />
                  )}
                </dl>
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-[13px] text-blue-700">
                  Al confirmar, la cotización se marcará como <b>Enviada</b> y quedará
                  registrada la fecha de envío.
                </p>
              </section>
            )}
          </div>

          <aside className="flex w-56 shrink-0 flex-col gap-3">
            <section className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Resumen estimado
              </p>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Costo base</span>
                  <span className="font-medium text-gray-800">{formatMonto(costoBase)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Margen</span>
                  <span className="font-medium text-gray-800">{formatMonto(margenMonto)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Precio de venta</span>
                  <span className="font-medium text-gray-800">{formatMonto(precioVenta)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="font-semibold text-gray-800">Total estimado</span>
                  <span className="text-base font-bold text-gray-900">{formatMonto(total)}</span>
                </div>
              </div>
            </section>

            <label className="flex flex-col gap-1 text-[13px] text-gray-500">
              <span>Margen (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                className={SECCION_CAMPO}
                value={margenPct}
                onChange={(e) => setCampo('margenPct', e.target.value)}
              />
            </label>
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-5 py-4">
          {!esEdicion && (
            <span className="text-[11px] text-gray-400">
              {borrador.restaurado
                ? 'Borrador restaurado'
                : 'Los datos se guardan al cerrar el modal'}
            </span>
          )}
          <div className="ml-auto flex items-center justify-end gap-2">
          {paso === 1 ? (
            <>
              {botonOutline('Guardar Borrador', guardarBorrador)}
              {botonOutline('Generar PDF', generarPDF)}
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                onClick={siguiente}
                disabled={saving || !datosValidos}
              >
                {saving ? 'Guardando...' : 'Siguiente →'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPaso(1)}
                disabled={saving}
              >
                ← Atrás
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                onClick={enviar}
                disabled={saving}
              >
                {saving ? 'Enviando...' : 'Enviar a agencia'}
              </button>
            </>
          )}
          </div>
        </footer>
      </aside>
    </div>
  )
}

function Row({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-gray-500">{etiqueta}</dt>
      <dd className="text-right font-medium text-gray-800">{valor}</dd>
    </div>
  )
}