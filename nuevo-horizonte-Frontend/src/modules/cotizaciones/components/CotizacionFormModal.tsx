import { useEffect, useMemo, useState } from 'react'

import type {
  Agencia,
  Cotizacion,
  CotizacionRequest,
  Tarifa,
} from '../types'
import {
  actualizarCotizacion,
  cambiarEstadoCotizacion,
  crearCotizacion,
  listarAgencias,
  listarTarifasVigentes,
} from '../services/cotizacionService'
import { formatDateDDMMYYYY, formatMonto } from '../utils'
import { extractErrorMessage } from '@/api/http'
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconHandshake,
  IconInfo,
  IconMoney,
  IconTrash,
  IconX,
} from '@/components/icons'
import ModalMarca from '@/components/ModalMarca'
import { useToastStore } from '@/store/toastStore'
import { useFormDraft } from '@/hooks/useFormDraft'
import { soloTexto } from '@/utils/validacion'

interface Props {
  cotizacion?: Cotizacion | null
  onClose: () => void
  onSaved: () => void
}

interface Guardado {
  id: number
  numero: string
}

interface LineaForm {
  tarifaId: string
  numPasajeros: string
}

interface CotizacionFormState {
  agenciaId: string
  fechaViaje: string
  serviciosAdicionales: string
  margenPct: string
  lineas: LineaForm[]
  /**
   * Si el borrador ya se guardo, al reabrirlo se continua esa misma cotizacion
   * en lugar de crear una nueva (evita duplicados).
   */
  guardadoId: number | null
  guardadoNumero: string
}

const LINEA_VACIA: LineaForm = { tarifaId: '', numPasajeros: '2' }

const VACIO: CotizacionFormState = {
  agenciaId: '',
  fechaViaje: '',
  serviciosAdicionales: '',
  margenPct: '15',
  lineas: [{ ...LINEA_VACIA }],
  guardadoId: null,
  guardadoNumero: '',
}

const SECCION_CAMPO =
  'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10'
const TARJETA = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'
const ETIQUETA_SECCION =
  'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500'

export default function CotizacionFormModal({
  cotizacion,
  onClose,
  onSaved,
}: Props) {
  const [paso, setPaso] = useState(1)
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [formEdicion, setFormEdicion] = useState<CotizacionFormState>(VACIO)
  const [danos, setDanos] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [cargando, setCargando] = useState(true)

  const esEdicion = Boolean(cotizacion)

  // El alta conserva borrador entre cierres; la edicion parte del registro real.
  const borrador = useFormDraft<CotizacionFormState>('cotizacion:nueva', VACIO)
  const form = esEdicion ? formEdicion : borrador.valor
  const { agenciaId, fechaViaje, serviciosAdicionales, margenPct, lineas } = form

  const [guardado, setGuardado] = useState<Guardado | null>(() => {
    if (cotizacion) return { id: cotizacion.id, numero: cotizacion.numero }
    return borrador.valor.guardadoId
      ? { id: borrador.valor.guardadoId, numero: borrador.valor.guardadoNumero }
      : null
  })

  const toast = useToastStore((s) => s.show)

  function setCampo<K extends keyof CotizacionFormState>(
    campo: K,
    valor: CotizacionFormState[K],
  ) {
    if (esEdicion) setFormEdicion((prev) => ({ ...prev, [campo]: valor }))
    else borrador.setCampo(campo, valor)
  }

  function limpiarFormulario() {
    setFormEdicion(VACIO)
    setGuardado(null)
    setPaso(1)
    borrador.reset()
  }

  // Cada combo se carga por separado: si una API falla, las demas siguen
  // funcionando (antes un solo error dejaba los tres selectores vacios).
  useEffect(() => {
    let vivo = true
    setCargando(true)
    Promise.allSettled([listarAgencias(), listarTarifasVigentes()]).then(
      ([agenciasResp, tarifasResp]) => {
        if (!vivo) return
        const fallas: string[] = []
        if (agenciasResp.status === 'fulfilled') setAgencias(agenciasResp.value)
        else fallas.push('agencias')
        if (tarifasResp.status === 'fulfilled') setTarifas(tarifasResp.value)
        else fallas.push('tarifas')
        if (fallas.length) {
          setDanos(
            `No se pudieron cargar ${fallas.join(' ni ')}. Cerrá y volvé a abrir el formulario para reintentar.`,
          )
        }
        setCargando(false)
      },
    )
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (!cotizacion) return
    setFormEdicion({
      agenciaId: String(cotizacion.agenciaId),
      fechaViaje: cotizacion.fechaViaje ? cotizacion.fechaViaje.slice(0, 10) : '',
      serviciosAdicionales: cotizacion.serviciosAdicionales ?? '',
      margenPct: String(cotizacion.margenPorcentaje ?? 15),
      lineas: cotizacion.lineas.length
        ? cotizacion.lineas.map((linea) => ({
            tarifaId: String(linea.tarifaId),
            numPasajeros: String(linea.cantidadPax),
          }))
        : [{ ...LINEA_VACIA }],
      guardadoId: cotizacion.id,
      guardadoNumero: cotizacion.numero,
    })
  }, [cotizacion])

  // Incluye las tarifas vigentes mas las que usa la cotizacion aunque hayan
  // vencido: asi al editar una cotizacion vieja no se pierde el producto.
  const tarifasDisponibles = useMemo(() => {
    const mapa = new Map<number, Tarifa>()
    tarifas.forEach((tarifa) => mapa.set(tarifa.id, tarifa))
    cotizacion?.lineas.forEach((linea) => {
      if (!mapa.has(linea.tarifaId)) {
        mapa.set(linea.tarifaId, {
          id: linea.tarifaId,
          servicio: linea.servicio,
          destino: linea.destino,
          destinoId: 0,
          proveedor: linea.proveedor,
          precio: linea.precioUnitario,
          moneda: linea.moneda,
          fechaDesde: '',
          fechaHasta: '',
        })
      }
    })
    return [...mapa.values()]
  }, [tarifas, cotizacion])

  const gruposTarifas = useMemo(() => {
    const grupos = new Map<string, Tarifa[]>()
    tarifasDisponibles.forEach((tarifa) => {
      const clave = tarifa.destino || 'Sin destino'
      const lista = grupos.get(clave)
      if (lista) lista.push(tarifa)
      else grupos.set(clave, [tarifa])
    })
    return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [tarifasDisponibles])

  const lineasCalculadas = lineas.map((linea, indice) => {
    const tarifa = tarifasDisponibles.find((t) => String(t.id) === linea.tarifaId)
    const cantidad = Number(linea.numPasajeros) || 0
    return {
      indice,
      linea,
      tarifa,
      cantidad,
      subtotal: tarifa ? tarifa.precio * cantidad : 0,
    }
  })

  const costoBase = lineasCalculadas.reduce((suma, linea) => suma + linea.subtotal, 0)
  const margenMonto = (costoBase * (Number(margenPct) || 0)) / 100
  const precioVenta = costoBase + margenMonto
  const total = precioVenta

  const agenciaSeleccionada = agencias.find((a) => String(a.id) === agenciaId)

  const datosValidos =
    Boolean(agenciaId) &&
    lineas.length > 0 &&
    lineas.every((linea) => Boolean(linea.tarifaId) && Number(linea.numPasajeros) > 0)

  function actualizarLinea(indice: number, cambios: Partial<LineaForm>) {
    setCampo(
      'lineas',
      lineas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    )
  }

  function agregarLinea() {
    const ultima = lineas[lineas.length - 1]
    setCampo('lineas', [
      ...lineas,
      { tarifaId: '', numPasajeros: ultima?.numPasajeros ?? LINEA_VACIA.numPasajeros },
    ])
  }

  function quitarLinea(indice: number) {
    if (lineas.length <= 1) return
    setCampo(
      'lineas',
      lineas.filter((_, i) => i !== indice),
    )
  }

  function buildRequest(): CotizacionRequest {
    return {
      agenciaId: Number(agenciaId),
      fechaEnvio: null,
      fechaViaje: fechaViaje || null,
      serviciosAdicionales: serviciosAdicionales.trim(),
      margenPorcentaje: Number(margenPct) || 0,
      lineas: lineas.map((linea) => ({
        tarifaId: Number(linea.tarifaId),
        cantidadPax: Number(linea.numPasajeros),
      })),
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
    if (!esEdicion) {
      borrador.setValor((prev) => ({
        ...prev,
        guardadoId: creada.id,
        guardadoNumero: creada.numero,
      }))
    }
    return nuevoGuardado
  }

  function prepararDatos(): CotizacionRequest | null {
    setDanos(null)
    if (!agenciaId) {
      setDanos('Selecciona la agencia')
      return null
    }
    if (lineas.length === 0) {
      setDanos('Agregá al menos un producto')
      return null
    }
    const sinProducto = lineas.findIndex((linea) => !linea.tarifaId)
    if (sinProducto >= 0) {
      setDanos(`Seleccioná el producto de la línea ${sinProducto + 1}`)
      return null
    }
    const sinPasajeros = lineas.findIndex((linea) => !(Number(linea.numPasajeros) > 0))
    if (sinPasajeros >= 0) {
      setDanos(`Los pasajeros de la línea ${sinPasajeros + 1} deben ser mayores a 0`)
      return null
    }
    return buildRequest()
  }

  async function guardarBorrador() {
    const payload = prepararDatos()
    if (!payload) return
    setSaving(true)
    const eraEdicion = Boolean(guardado)
    try {
      await guardar(payload)
      onSaved()
      toast(
        eraEdicion
          ? 'Cotización actualizada correctamente'
          : 'Borrador de cotización creado correctamente',
        'success',
      )
    } catch (err) {
      setDanos(extractErrorMessage(err))
      toast('No se pudo guardar la cotización', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function siguiente() {
    const payload = prepararDatos()
    if (!payload) return
    setSaving(true)
    const eraEdicion = Boolean(guardado)
    try {
      await guardar(payload)
      onSaved()
      toast(
        eraEdicion ? 'Cotización actualizada correctamente' : 'Cotización guardada correctamente',
        'success',
      )
      setPaso(2)
    } catch (err) {
      setDanos(extractErrorMessage(err))
      toast('No se pudo guardar la cotización', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function enviar() {
    const payload = prepararDatos()
    if (!payload) return
    setSaving(true)
    try {
      // Se guarda siempre antes de enviar, y se usa el registro devuelto por
      // `guardar` (antes se leia `guardado`, que seguia en null tras crear).
      const cotizacionGuardada = await guardar(payload)
      await cambiarEstadoCotizacion(cotizacionGuardada.id, 'ENVIADA')
      limpiarFormulario()
      onSaved()
      toast('Cotización enviada correctamente', 'success')
      onClose()
    } catch (err) {
      setDanos(extractErrorMessage(err))
      toast('No se pudo enviar la cotización', 'error')
    } finally {
      setSaving(false)
    }
  }

  function generarPDF() {
    const agencia = agenciaSeleccionada?.nombre ?? ''
    const filas = lineasCalculadas
      .map(({ tarifa, cantidad, subtotal }) => {
        return `<tr><td>${tarifa?.destino ?? '-'}</td><td>${tarifa?.servicio ?? '-'}</td><td>${tarifa?.proveedor ?? '-'}</td><td>${cantidad}</td><td>${formatMonto(tarifa?.precio ?? 0)}</td><td>${formatMonto(subtotal)}</td></tr>`
      })
      .join('')
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

  <h2>Agencia</h2>
  <table>
    <tr><th>Agencia</th><td>${agencia}</td></tr>
    <tr><th>Fecha de viaje</th><td>${formatDateDDMMYYYY(fechaViaje)}</td></tr>
    ${
      serviciosAdicionales.trim()
        ? `<tr><th>Servicios adicionales</th><td>${serviciosAdicionales}</td></tr>`
        : ''
    }
  </table>

  <h2>Productos</h2>
  <table>
    <tr><th>Destino</th><th>Producto</th><th>Proveedor</th><th>Pax</th><th>Precio unit.</th><th>Subtotal</th></tr>
    ${filas}
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

  function descartarBorrador() {
    borrador.reset()
    setGuardado(null)
    setPaso(1)
    setDanos(null)
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
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/45 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="animate-panel-in flex h-full w-[780px] max-w-[96vw] flex-col bg-gray-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <ModalMarca />
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/10">
              <IconHandshake width={22} height={22} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {esEdicion ? `Editar ${cotizacion?.numero}` : 'Nueva cotización'}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Cotización comercial para agencias · {esEdicion ? 'edición' : 'borrador guardable'}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <PasoChip numero={1} titulo="Datos" activo={paso === 1} completado={paso > 1} />
                <span className="h-px w-6 bg-gray-200" />
                <PasoChip numero={2} titulo="Revisión y envío" activo={paso === 2} />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <IconX width={18} height={18} />
          </button>
        </header>

        {danos && (
          <p className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {danos}
          </p>
        )}
        {cargando && (
          <p className="mx-6 mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
            Cargando agencias y tarifas...
          </p>
        )}

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {paso === 1 ? (
              <>
                <section className={TARJETA}>
                  <p className={ETIQUETA_SECCION}>
                    <IconBuilding width={14} height={14} />
                    Agencia
                  </p>
                  <label className="mt-3 flex flex-col gap-1.5 text-[13px] font-medium text-gray-600">
                    <span>
                      Agencia <span className="text-red-500">*</span>
                    </span>
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
                  <p className="mt-2 text-[11px] text-gray-400">
                    La agencia define a quién se enviará la cotización.
                  </p>
                </section>

                <section className={TARJETA}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={ETIQUETA_SECCION}>
                      <IconBriefcase width={14} height={14} />
                      Productos
                    </p>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={agregarLinea}
                      disabled={saving}
                    >
                      + Agregar producto
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-3">
                    {lineasCalculadas.map(({ indice, linea, tarifa, subtotal }) => (
                      <div
                        key={indice}
                        className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-gray-600">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                              {indice + 1}
                            </span>
                            Producto {indice + 1}
                          </span>
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            onClick={() => quitarLinea(indice)}
                            disabled={lineas.length <= 1 || saving}
                            aria-label={`Quitar producto ${indice + 1}`}
                          >
                            <IconTrash width={16} height={16} />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_110px] gap-3">
                          <label className="flex min-w-0 flex-col gap-1 text-[13px] text-gray-500">
                            <span>Producto / tarifa *</span>
                            <select
                              className={SECCION_CAMPO}
                              value={linea.tarifaId}
                              onChange={(e) =>
                                actualizarLinea(indice, { tarifaId: e.target.value })
                              }
                            >
                              <option value="">Seleccionar producto</option>
                              {gruposTarifas.map(([destino, opciones]) => (
                                <optgroup key={destino} label={destino}>
                                  {opciones.map((opcion) => (
                                    <option key={opcion.id} value={opcion.id}>
                                      {opcion.servicio} · {opcion.proveedor} ·{' '}
                                      {formatMonto(opcion.precio)}
                                      {opcion.fechaDesde ? '' : ' (tarifa vencida)'}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </label>
                          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
                            <span>Pasajeros *</span>
                            <input
                              type="number"
                              min={1}
                              className={SECCION_CAMPO}
                              value={linea.numPasajeros}
                              onChange={(e) =>
                                actualizarLinea(indice, { numPasajeros: e.target.value })
                              }
                            />
                          </label>
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200">
                          <span className="text-[11px] text-gray-500">
                            {tarifa
                              ? `${formatMonto(tarifa.precio)} × ${linea.numPasajeros || 0} pax`
                              : 'Selecciona un producto para ver el subtotal'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatMonto(subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={TARJETA}>
                  <p className={ETIQUETA_SECCION}>
                    <IconCalendar width={14} height={14} />
                    Información básica
                  </p>
                  <label className="mt-3 flex flex-col gap-1.5 text-[13px] font-medium text-gray-600">
                    <span>
                      Fecha de viaje <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="date"
                      className={SECCION_CAMPO}
                      value={fechaViaje}
                      onChange={(e) => setCampo('fechaViaje', e.target.value)}
                    />
                  </label>
                  <p className="mt-2 text-[11px] text-gray-400">
                    Puedes dejarla vacía si aún no tienes la fecha confirmada.
                  </p>
                </section>

                <section className={TARJETA}>
                  <p className={ETIQUETA_SECCION}>
                    <IconInfo width={14} height={14} />
                    Servicios adicionales
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Describir los servicios adicionales..."
                    className={`${SECCION_CAMPO} mt-3 resize-none`}
                    value={serviciosAdicionales}
                    onChange={(e) => setCampo('serviciosAdicionales', soloTexto(e.target.value))}
                  />
                </section>
              </>
            ) : (
              <section className={`${TARJETA} flex flex-col gap-4`}>
                <div className="flex items-center justify-between gap-2">
                  <p className={ETIQUETA_SECCION}>
                    <IconCheckCircle width={14} height={14} />
                    Revisión y envío
                  </p>
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                    {guardado?.numero ?? 'Borrador'}
                  </span>
                </div>

                <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                  <Row etiqueta="Cotización" valor={guardado?.numero ?? '-'} />
                  <Row etiqueta="Agencia" valor={agenciaSeleccionada?.nombre ?? '-'} />
                  <Row etiqueta="Fecha de viaje" valor={formatDateDDMMYYYY(fechaViaje)} />
                  {serviciosAdicionales.trim() && (
                    <Row etiqueta="Servicios adicionales" valor={serviciosAdicionales} />
                  )}
                </dl>

                <div className="flex flex-col gap-2">
                  <p className="text-[13px] font-semibold text-gray-700">Productos</p>
                  {lineasCalculadas.map(({ indice, tarifa, cantidad, subtotal }) => (
                    <div
                      key={indice}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-[13px]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800">
                          {tarifa?.servicio ?? '-'}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {tarifa?.destino ?? '-'} · {tarifa?.proveedor ?? '-'} · {cantidad} pax
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-gray-900">
                        {formatMonto(subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-[13px] text-blue-700">
                  <IconInfo width={16} height={16} className="mt-0.5 shrink-0" />
                  <span>
                    Al confirmar, la cotización se marcará como <b>Enviada</b> y quedará
                    registrada la fecha de envío.
                  </span>
                </p>
              </section>
            )}
          </div>

          <aside className="flex shrink-0 flex-col gap-4 lg:w-64">
            <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className={ETIQUETA_SECCION}>
                <IconMoney width={14} height={14} />
                Resumen estimado
              </p>
              <div className="flex flex-col gap-2 text-sm">
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
              </div>
              <div className="rounded-xl bg-brand px-4 py-3 text-white">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/70">
                  Total estimado
                </p>
                <p className="mt-1 text-xl font-bold">{formatMonto(total)}</p>
              </div>
              <label className="mt-1 flex flex-col gap-1.5 text-[13px] font-medium text-gray-600">
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
              <p className="text-[11px] text-gray-400">
                El margen se aplica sobre el costo base de los productos.
              </p>
            </section>
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-5 py-4">
          {!esEdicion && (
            <span className="text-[11px] text-gray-400">
              {guardado
                ? `Borrador ${guardado.numero} guardado`
                : borrador.restaurado
                  ? 'Borrador restaurado'
                  : 'Los datos se guardan al cerrar el modal'}
            </span>
          )}
          <div className="ml-auto flex items-center justify-end gap-2">
          {!esEdicion && (guardado || borrador.restaurado) && (
            <button
              type="button"
              className="cursor-pointer rounded-lg px-3 py-2 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              onClick={descartarBorrador}
              disabled={saving}
            >
              Empezar de cero
            </button>
          )}
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

function PasoChip({
  numero,
  titulo,
  activo,
  completado = false,
}: {
  numero: number
  titulo: string
  activo: boolean
  completado?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
        activo
          ? 'bg-brand text-white'
          : completado
            ? 'bg-brand/10 text-brand'
            : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
          activo ? 'bg-white/20' : completado ? 'bg-brand/15' : 'bg-white text-gray-500'
        }`}
      >
        {completado ? '✓' : numero}
      </span>
      {titulo}
    </span>
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
