import { useEffect, useState } from 'react'

import type { Agencia } from '../types'
import type { AgenciaFichaResumen, HistorialComercialItem, NotaSeguimiento, ResumenComercial } from '../ficha-types'
import {
  detalleAgenciaFicha,
  historialComercial as cargarHistorial,
  listarFicha,
  notasSeguimiento as cargarNotas,
  resumenComercial as cargarResumen,
} from '../services/agenciaFichaService'
import { logoAgenciaUrl } from '../services/agenciaService'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import { IconMail, IconPhone, IconPlus, IconSearch } from '@/components/icons'

export default function AgenciaFichaPage() {
  const [q, setQ] = useState('')
  const [lista, setLista] = useState<AgenciaFichaResumen[]>([])
  const [loadingLista, setLoadingLista] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null)
  const [agencia, setAgencia] = useState<Agencia | null>(null)
  const [resumen, setResumen] = useState<ResumenComercial | null>(null)
  const [historial, setHistorial] = useState<HistorialComercialItem[]>([])
  const [notas, setNotas] = useState<NotaSeguimiento[]>([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  function recargarLista() {
    setLoadingLista(true)
    listarFicha(q)
      .then((data) => {
        setLista(data)
        setError(null)
        if (!seleccionadaId && data.length > 0) {
          setSeleccionadaId(data[0].id)
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoadingLista(false))
  }

  useEffect(() => {
    recargarLista()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!seleccionadaId) return
    setLoadingDetalle(true)
    Promise.all([
      detalleAgenciaFicha(seleccionadaId),
      cargarResumen(seleccionadaId),
      cargarHistorial(seleccionadaId),
      cargarNotas(seleccionadaId),
    ])
      .then(([a, r, h, n]) => {
        setAgencia(a)
        setResumen(r)
        setHistorial(h)
        setNotas(n)
        setError(null)
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoadingDetalle(false))
  }, [seleccionadaId])

  function buscar() {
    recargarLista()
  }

  function limpiarFiltros() {
    setQ('')
    setLoadingLista(true)
    listarFicha('')
      .then((data) => {
        setLista(data)
        setError(null)
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoadingLista(false))
  }

  function formatMoneda(valor: number) {
    return `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Agencias / Clientes B2B</h2>
        <p className="mt-1 text-sm text-gray-500">Panel comercial 360 por agencia</p>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr_340px]">
        {/* ---- Lista de agencias ---- */}
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Buscar agencia..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') buscar()
                }}
              />
            </div>
            {q && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="shrink-0 cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
            {loadingLista && <p className="py-6 text-center text-sm text-gray-400">Cargando agencias...</p>}
            {!loadingLista && lista.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No hay agencias que coincidan</p>
            )}
            {!loadingLista &&
              lista.map((a) => {
                const logo = logoAgenciaUrl(a.logoUrl)
                const activa = seleccionadaId === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSeleccionadaId(a.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      activa ? 'border-brand bg-brand/5' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-900 text-sm font-semibold text-white">
                      {logo ? (
                        <img src={logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        a.nombre.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-gray-900">{a.nombre}</span>
                        {a.esPrioritaria && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Top 10
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        Última interacción: {a.ultimaInteraccion ? formatDate(a.ultimaInteraccion) : 'Sin registros'}
                      </span>
                      <span
                        className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          a.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {a.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>

        {/* ---- Detalle de la agencia ---- */}
        {!agencia || loadingDetalle ? (
          <div className="flex items-center justify-center rounded-xl bg-white p-10 text-sm text-gray-400 shadow-sm lg:col-span-2">
            {loadingDetalle ? 'Cargando ficha...' : 'Selecciona una agencia para ver su ficha'}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
                    {(agencia.contactoNombre || agencia.razonSocial).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {agencia.contactoNombre || agencia.razonSocial}
                    </p>
                    {agencia.contactoEmail && (
                      <a
                        href={`mailto:${agencia.contactoEmail}`}
                        className="flex items-center gap-1.5 text-sm text-brand hover:underline"
                      >
                        <IconMail /> {agencia.contactoEmail}
                      </a>
                    )}
                    {agencia.contactoTelefono && (
                      <p className="flex items-center gap-1.5 text-sm text-gray-500">
                        <IconPhone /> {agencia.contactoTelefono}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
                  <DatoFicha label="RUC" valor={agencia.ruc} />
                  <DatoFicha label="Ciudad" valor={agencia.ciudad || '-'} />
                  <DatoFicha label="Fecha de registro" valor={formatDate(agencia.fechaCreacion)} />
                  <DatoFicha label="Ejecutivo asignado" valor={agencia.ejecutivoAsignado || '-'} />
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-gray-900">Historial comercial</h3>
                {historial.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin cotizaciones ni ventas registradas todavía</p>
                ) : (
                  <ol className="relative flex flex-col gap-5 border-l-2 border-gray-100 pl-4">
                    {historial.map((h, i) => (
                      <li key={`${h.tipo}-${h.numero}-${i}`} className="relative">
                        <span
                          className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                            h.tipo === 'VENTA' ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                        />
                        <p className="text-xs text-gray-400">{formatDate(h.fecha)}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {h.tipo === 'VENTA' ? 'Venta cerrada' : `Cotización ${h.numero}`}
                        </p>
                        <p className="text-sm text-gray-500">{h.titulo}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-gray-900">Resumen comercial</h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatFicha label="Compras acumuladas" valor={formatMoneda(resumen?.comprasAcumuladas ?? 0)} />
                  <StatFicha label="Cotizaciones" valor={String(resumen?.cotizaciones ?? 0)} />
                  <StatFicha label="Ventas Cerradas" valor={String(resumen?.ventasCerradas ?? 0)} />
                  <StatFicha
                    label="Última compra"
                    valor={resumen?.ultimaCompra ? formatDate(resumen.ultimaCompra) : '-'}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Notas de seguimiento</h3>
                  <button
                    type="button"
                    disabled
                    title="Se registran desde el módulo de Seguimiento Comercial"
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400"
                  >
                    <IconPlus /> Agregar Nota
                  </button>
                </div>
                {notas.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Sin notas registradas. Las llamadas, correos y reuniones se registran desde Seguimiento
                    Comercial.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {notas.map((n) => (
                      <div key={n.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium capitalize">{n.tipo.toLowerCase()}</span>
                          {n.notas ? ` - ${n.notas}` : ''}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">{formatDate(n.fecha)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function DatoFicha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="font-medium text-gray-800">{valor}</span>
    </div>
  )
}

function StatFicha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-lg font-bold text-gray-900">{valor}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}
