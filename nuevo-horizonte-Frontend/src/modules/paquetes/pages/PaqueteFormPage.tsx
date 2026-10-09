import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import type { Destino, PaqueteOpcion, PaquetePayload, PaqueteVuelo } from '../types'
import {
  actualizarPaquete,
  crearPaquete,
  detallePaquete,
  listarAerolineasSugeridas,
  listarCategorias,
  listarDestinos,
  listarMonedas,
  listarOpcionesIncluye,
} from '../services/paqueteService'
import { extractErrorMessage } from '@/api/http'
import { IconPlus, IconSave, IconSend, IconTrash, IconX } from '@/components/icons'
import { useToastStore } from '@/store/toastStore'
import { soloTexto } from '@/utils/validacion'

const VUELO_VACIO: PaqueteVuelo = {
  aerolinea: '',
  origen: '',
  destino: '',
  fechaSalida: '',
  fechaLlegada: '',
}

const OPCION_VACIA: PaqueteOpcion = {
  hotelServicio: '',
  fechaDesde: '',
  fechaHasta: '',
  incluye: '',
  precioSimple: 0,
  precioDoble: 0,
  precioTriple: 0,
  precioNino: 0,
}

const CATEGORIAS_SUGERIDAS = ['Nacional', 'Internacional', 'Aéreo', 'Terrestre', 'Crucero', 'Premium']

export default function PaqueteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const editando = Boolean(id)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [fechaInicioViaje, setFechaInicioViaje] = useState('')
  const [fechaFinViaje, setFechaFinViaje] = useState('')
  const [fechaCierreVenta, setFechaCierreVenta] = useState('')
  const [categoria, setCategoria] = useState('')
  const [moneda, setMoneda] = useState('PEN')
  const [precioDesde, setPrecioDesde] = useState('')
  const [duracionTexto, setDuracionTexto] = useState('')
  const [destacado, setDestacado] = useState(false)
  const [aliados, setAliados] = useState<string[]>([])
  const [vuelos, setVuelos] = useState<PaqueteVuelo[]>([])
  const [opciones, setOpciones] = useState<PaqueteOpcion[]>([])

  const [destinos, setDestinos] = useState<Destino[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [monedas, setMonedas] = useState<string[]>(['PEN', 'USD', 'EUR'])
  const [opcionesIncluye, setOpcionesIncluye] = useState<string[]>([])
  const [aerolineasSugeridas, setAerolineasSugeridas] = useState<string[]>([])

  const [cargando, setCargando] = useState(editando)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    listarDestinos().then(setDestinos).catch(() => undefined)
    listarCategorias().then(setCategorias).catch(() => undefined)
    listarMonedas().then(setMonedas).catch(() => undefined)
    listarOpcionesIncluye().then(setOpcionesIncluye).catch(() => undefined)
    listarAerolineasSugeridas().then(setAerolineasSugeridas).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setCargando(true)
    detallePaquete(Number(id))
      .then((p) => {
        setNombre(p.nombre)
        setDescripcion(p.descripcion ?? '')
        setDestinoId(p.destinoId ? String(p.destinoId) : '')
        setFechaInicioViaje(p.fechaInicioViaje ?? '')
        setFechaFinViaje(p.fechaFinViaje ?? '')
        setFechaCierreVenta(p.fechaCierreVenta ?? '')
        setCategoria(p.categoria ?? '')
        setMoneda(p.moneda ?? 'PEN')
        setPrecioDesde(p.precioDesde != null ? String(p.precioDesde) : '')
        setDuracionTexto(p.duracionTexto ?? '')
        setDestacado(p.destacado)
        setAliados(p.aliados ?? [])
        setVuelos(p.vuelos ?? [])
        setOpciones(p.opciones ?? [])
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false))
  }, [id])

  function toggleAliado(nombreAerolinea: string) {
    setAliados((prev) =>
      prev.includes(nombreAerolinea) ? prev.filter((a) => a !== nombreAerolinea) : [...prev, nombreAerolinea],
    )
  }

  function agregarVuelo() {
    setVuelos((prev) => [...prev, { ...VUELO_VACIO }])
  }

  function actualizarVuelo<K extends keyof PaqueteVuelo>(index: number, campo: K, valor: PaqueteVuelo[K]) {
    setVuelos((prev) => prev.map((v, i) => (i === index ? { ...v, [campo]: valor } : v)))
  }

  function quitarVuelo(index: number) {
    setVuelos((prev) => prev.filter((_, i) => i !== index))
  }

  function agregarOpcion() {
    setOpciones((prev) => [...prev, { ...OPCION_VACIA }])
  }

  function actualizarOpcion<K extends keyof PaqueteOpcion>(index: number, campo: K, valor: PaqueteOpcion[K]) {
    setOpciones((prev) => prev.map((o, i) => (i === index ? { ...o, [campo]: valor } : o)))
  }

  function quitarOpcion(index: number) {
    setOpciones((prev) => prev.filter((_, i) => i !== index))
  }

  function validar(): string | null {
    if (!nombre.trim()) return 'El título del paquete es obligatorio'
    if (!destinoId) return 'Selecciona el destino del paquete'
    return null
  }

  async function guardar(estado: 'BORRADOR' | 'ACTIVO') {
    const problema = validar()
    if (problema) {
      setError(problema)
      return
    }

    setGuardando(true)
    setError(null)
    try {
      const payload: PaquetePayload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        destinoId: Number(destinoId),
        fechaInicioViaje: fechaInicioViaje || null,
        fechaFinViaje: fechaFinViaje || null,
        fechaCierreVenta: fechaCierreVenta || null,
        categoria: categoria || null,
        moneda,
        precioDesde: precioDesde ? Number(precioDesde) : null,
        duracionTexto: duracionTexto.trim() || null,
        destacado,
        estado,
        aliados,
        vuelos,
        opciones,
      }

      if (editando && id) {
        await actualizarPaquete(Number(id), payload)
      } else {
        await crearPaquete(payload)
      }
      toast(
        editando
          ? `Paquete "${nombre.trim()}" actualizado correctamente`
          : `Paquete "${nombre.trim()}" creado correctamente (${estado === 'BORRADOR' ? 'borrador' : 'activo'})`,
        'success',
      )
      navigate('/paquetes')
    } catch (err) {
      setError(extractErrorMessage(err))
      toast('No se pudo guardar el paquete', 'error')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <p className="text-sm text-gray-400">Cargando paquete...</p>
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {editando ? 'Editar Producto Turístico' : 'Crear Nuevo Producto Turístico'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">Crea paquetes combinando servicios y tarifas vigentes</p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {/* ---- Columna principal ---- */}
        <div className="flex flex-col gap-5">
          <Card titulo="Información del paquete">
            <Campo label="Título del paquete" obligatorio>
              <input
                type="text"
                className={inputClase}
                value={nombre}
                onChange={(e) => setNombre(soloTexto(e.target.value))}
                placeholder="Ej: Maravillas de Europa 15 días"
              />
            </Campo>

            <Campo label="Información del destino">
              <textarea
                className={`${inputClase} min-h-[80px] resize-y`}
                value={descripcion}
                onChange={(e) => setDescripcion(soloTexto(e.target.value))}
                placeholder="Resumen atractivo para la tarjeta..."
              />
            </Campo>

            <Campo label="Destino" obligatorio>
              <select className={inputClase} value={destinoId} onChange={(e) => setDestinoId(e.target.value)}>
                <option value="">Seleccionar destino</option>
                {destinos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.pais})
                  </option>
                ))}
              </select>
            </Campo>

            <div className="grid grid-cols-3 gap-3">
              <Campo label="Inicio de Viaje">
                <input
                  type="date"
                  className={inputClase}
                  value={fechaInicioViaje}
                  onChange={(e) => setFechaInicioViaje(e.target.value)}
                />
              </Campo>
              <Campo label="Fin de Viaje">
                <input
                  type="date"
                  className={inputClase}
                  value={fechaFinViaje}
                  onChange={(e) => setFechaFinViaje(e.target.value)}
                />
              </Campo>
              <Campo label="Cierre Venta">
                <input
                  type="date"
                  className={`${inputClase} border-red-300 text-red-700`}
                  value={fechaCierreVenta}
                  onChange={(e) => setFechaCierreVenta(e.target.value)}
                />
              </Campo>
            </div>
          </Card>

          <Card
            titulo="Itinerario de vuelos"
            accion={
              <button type="button" onClick={agregarVuelo} className={botonAccion}>
                <IconPlus /> Agregar vuelo
              </button>
            }
          >
            {vuelos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                No hay vuelos registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                      <th className="px-2 py-2 font-semibold">Aerolínea</th>
                      <th className="px-2 py-2 font-semibold">Origen</th>
                      <th className="px-2 py-2 font-semibold">Destino</th>
                      <th className="px-2 py-2 font-semibold">Salida</th>
                      <th className="px-2 py-2 font-semibold">Llegada</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {vuelos.map((v, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            className={celdaClase}
                            value={v.aerolinea}
                            onChange={(e) => actualizarVuelo(i, 'aerolinea', soloTexto(e.target.value))}
                            placeholder="Ej: LATAM"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            className={celdaClase}
                            value={v.origen}
                            onChange={(e) => actualizarVuelo(i, 'origen', soloTexto(e.target.value))}
                            placeholder="Lima"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            className={celdaClase}
                            value={v.destino}
                            onChange={(e) => actualizarVuelo(i, 'destino', soloTexto(e.target.value))}
                            placeholder="Cusco"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="datetime-local"
                            className={celdaClase}
                            value={v.fechaSalida}
                            onChange={(e) => actualizarVuelo(i, 'fechaSalida', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="datetime-local"
                            className={celdaClase}
                            value={v.fechaLlegada}
                            onChange={(e) => actualizarVuelo(i, 'fechaLlegada', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => quitarVuelo(i)}
                            className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Quitar vuelo"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card
            titulo="Opciones y Tarifas"
            accion={
              <button type="button" onClick={agregarOpcion} className={botonAccion}>
                <IconPlus /> Agregar Opción
              </button>
            }
          >
            {opciones.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                No hay opciones registradas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                      <th className="px-2 py-2 font-semibold">Hotel/Servicio</th>
                      <th className="px-2 py-2 font-semibold">Desde</th>
                      <th className="px-2 py-2 font-semibold">Hasta</th>
                      <th className="px-2 py-2 font-semibold">Incluye</th>
                      <th className="px-2 py-2 font-semibold">Simple</th>
                      <th className="px-2 py-2 font-semibold">Doble</th>
                      <th className="px-2 py-2 font-semibold">Triple</th>
                      <th className="px-2 py-2 font-semibold">Niño</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {opciones.map((o, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            className={`${celdaClase} w-36`}
                            value={o.hotelServicio}
                            onChange={(e) => actualizarOpcion(i, 'hotelServicio', soloTexto(e.target.value))}
                            placeholder="Ej: Hotel Paracas"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="date"
                            className={celdaClase}
                            value={o.fechaDesde}
                            onChange={(e) => actualizarOpcion(i, 'fechaDesde', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="date"
                            className={celdaClase}
                            value={o.fechaHasta}
                            onChange={(e) => actualizarOpcion(i, 'fechaHasta', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            className={celdaClase}
                            value={o.incluye}
                            onChange={(e) => actualizarOpcion(i, 'incluye', e.target.value)}
                          >
                            <option value="">Solo...</option>
                            {opcionesIncluye.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </td>
                        {(['precioSimple', 'precioDoble', 'precioTriple', 'precioNino'] as const).map((campo) => (
                          <td key={campo} className="px-2 py-1.5">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className={`${celdaClase} w-20`}
                              value={o[campo]}
                              onChange={(e) => actualizarOpcion(i, campo, Number(e.target.value))}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => quitarOpcion(i)}
                            className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Quitar opción"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* ---- Columna lateral ---- */}
        <div className="flex flex-col gap-5">
          <Card titulo="Publicación">
            <button
              type="button"
              onClick={() => guardar('BORRADOR')}
              disabled={guardando}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconSave /> Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => guardar('ACTIVO')}
              disabled={guardando}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconSend /> {guardando ? 'Guardando...' : 'Publicar paquete'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/paquetes')}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700"
            >
              <IconX /> Cancelar
            </button>
          </Card>

          <Card titulo="Configuración">
            <Campo label="Categoría">
              <div className="flex flex-col gap-2">
                <select className={inputClase} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="">Selecciona...</option>
                  {[...new Set([...categorias, ...CATEGORIAS_SUGERIDAS])].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Moneda">
                <select className={inputClase} value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                  {monedas.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label='Precio "DESDE"'>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClase}
                  value={precioDesde}
                  onChange={(e) => setPrecioDesde(e.target.value)}
                  placeholder="0.00"
                />
              </Campo>
            </div>

            <Campo label="Duración">
              <input
                type="text"
                className={inputClase}
                value={duracionTexto}
                onChange={(e) => setDuracionTexto(e.target.value)}
                placeholder="Ej: 5 Días / 4 Noches"
              />
            </Campo>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <span className="text-[13px] font-medium text-gray-700">Destacar en inicio</span>
              <button
                type="button"
                role="switch"
                aria-checked={destacado}
                onClick={() => setDestacado((v) => !v)}
                className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  destacado ? 'bg-brand' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    destacado ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </Card>

          <Card titulo="Aliados">
            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
              {aerolineasSugeridas.map((aerolinea) => (
                <label
                  key={aerolinea}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[var(--color-brand)]"
                    checked={aliados.includes(aerolinea)}
                    onChange={() => toggleAliado(aerolinea)}
                  />
                  {aerolinea}
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

const inputClase =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand'

const celdaClase =
  'w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand'

const botonAccion =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700'

function Card({
  titulo,
  accion,
  children,
}: {
  titulo: string
  accion?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
        {accion}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function Campo({
  label,
  obligatorio,
  children,
}: {
  label: string
  obligatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-600">
        {label}
        {obligatorio && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
