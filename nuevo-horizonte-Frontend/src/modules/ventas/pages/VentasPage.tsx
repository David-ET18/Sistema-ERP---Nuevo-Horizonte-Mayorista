import { useEffect, useState } from 'react'

import type {
  Agencia,
  EstadoVenta,
  FiltrosVentas,
  KpisVentas,
  PaginacionVentas,
  Venta,
  VentaLista,
} from '../types'
import {
  cambiarEstadoVenta,
  detalleVenta,
  eliminarVenta,
  kpisVentas,
  listarAgencias,
  listarVentas,
} from '../services/ventaService'
import { ESTADOS_VENTA, estadoInfo, formatDateDDMMYYYY, formatMonto } from '../utils'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToastStore } from '@/store/toastStore'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import EstadoBadge from '../components/EstadoBadge'
import VentaFormModal from '../components/VentaFormModal'
import VentaDetailModal from '../components/VentaDetailModal'
import {
  IconBriefcase,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconEye,
  IconMoney,
  IconPencil,
  IconPlus,
  IconSearch,
  IconX,
} from '@/components/icons'

const FILTROS_INICIALES: FiltrosVentas = {
  q: '',
  estado: '',
  agenciaId: '',
  desde: '',
  hasta: '',
}

const TAMANOS_PAGINA = [5, 10, 25, 50]

export default function VentasPage() {
  const [filtros, setFiltros] = useState<FiltrosVentas>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<PaginacionVentas | null>(null)
  const [kpis, setKpis] = useState<KpisVentas | null>(null)
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Venta | null>(null)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aAnular, setAAnular] = useState<VentaLista | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const puedeCrear = canCreateModule('ventas')
  const puedeEditar = canUpdateModule('ventas')
  const puedeEliminar = canDeleteModule('ventas')

  const toast = useToastStore((s) => s.show)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [lista, kpi] = await Promise.all([listarVentas(filtros, page, size), kpisVentas()])
      setData(lista)
      setKpis(kpi)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listarAgencias()
      .then(setAgencias)
      .catch((err) => setError(extractErrorMessage(err)))
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, refreshKey])

  function recargar(resetPagina: boolean) {
    if (resetPagina && page !== 0) setPage(0)
    setRefreshKey((k) => k + 1)
  }

  function setFiltro(campo: keyof FiltrosVentas, valor: string) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicarFiltros() {
    recargar(true)
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  function cambiarPagina(nuevaPagina: number) {
    if (data && nuevaPagina >= 0 && nuevaPagina < data.totalPages) {
      setPage(nuevaPagina)
    }
  }

  async function abrirEdicion(id: number) {
    try {
      const detalle = await detalleVenta(id)
      setEditando(detalle)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function cambioRapidoEstado(id: number, estado: EstadoVenta) {
    try {
      await cambiarEstadoVenta(id, estado)
      recargar(false)
      toast(`Venta actualizada a "${estadoInfo(estado).etiqueta}"`, 'success')
    } catch (err) {
      setError(extractErrorMessage(err))
      toast(`No se pudo actualizar el estado: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function eliminar(id: number) {
    try {
      await eliminarVenta(id)
      recargar(true)
      toast('Venta anulada correctamente', 'success')
    } catch (err) {
      setError(extractErrorMessage(err))
      toast(`No se pudo anular la venta: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function refrescarDespuesDeCambio() {
    recargar(false)
  }

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Ventas del mes',
      valor: kpis?.ventasMes ?? 0,
      colorIcono: 'bg-blue-100 text-blue-600',
      Icon: IconBriefcase,
    },
    {
      etiqueta: 'Monto total vendido',
      valor: formatMonto(kpis?.montoVendidoMes ?? 0),
      colorIcono: 'bg-emerald-100 text-emerald-600',
      Icon: IconMoney,
    },
    {
      etiqueta: 'Pagos pendientes',
      valor: kpis?.pagosPendientes ?? 0,
      colorIcono: 'bg-amber-100 text-amber-600',
      Icon: IconClock,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Ventas</h2>
        <p className="mt-1 text-sm text-gray-500">
          Registra y consulta las ventas confirmadas a partir de cotizaciones cerradas
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.colorIcono}`}>
              <card.Icon width={22} height={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.valor}</p>
              <p className="text-[13px] text-gray-500">{card.etiqueta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch width={15} height={15} />
          </span>
          <input
            type="text"
            placeholder="Buscar venta o agencia..."
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicarFiltros()
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.estado}
          onChange={(e) => {
            setFiltro('estado', e.target.value)
            aplicarFiltros()
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_VENTA.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.agenciaId}
          onChange={(e) => {
            setFiltro('agenciaId', e.target.value)
            aplicarFiltros()
          }}
        >
          <option value="">Agencia: todas</option>
          {agencias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-[13px] text-gray-500">
          <IconCalendar width={14} height={14} />
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.desde}
            onChange={(e) => {
              setFiltro('desde', e.target.value)
              aplicarFiltros()
            }}
          />
          <span>a</span>
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.hasta}
            onChange={(e) => {
              setFiltro('hasta', e.target.value)
              aplicarFiltros()
            }}
          />
        </label>

        {(filtros.q || filtros.estado || filtros.agenciaId || filtros.desde || filtros.hasta) && (
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            onClick={limpiarFiltros}
          >
            Limpiar Filtros
          </button>
        )}

        <div className="ml-auto">
          {puedeCrear && (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              onClick={() => {
                setEditando(null)
                setShowForm(true)
              }}
            >
              <IconPlus width={15} height={15} />
              Registrar venta
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Venta</th>
                <th className="px-4 py-3 font-semibold">Agencia</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Tarifa</th>
                <th className="px-4 py-3 text-right font-semibold">Monto a pagar</th>
                <th className="px-4 py-3 text-right font-semibold">Comisión</th>
                <th className="px-4 py-3 text-right font-semibold">IGV</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.numero}</td>
                    <td className="px-4 py-3 text-gray-700">{v.agencia}</td>
                    <td className="px-4 py-3 text-gray-700">{v.producto}</td>
                    <td className="px-4 py-3 text-gray-600">{v.tarifa}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatMonto(v.montoAPagar)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatMonto(v.comision)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatMonto(v.igv)}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={v.estado} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDateDDMMYYYY(v.fechaVenta)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          onClick={() => setDetalleId(v.id)}
                          aria-label="Ver detalle"
                        >
                          <IconEye width={16} height={16} />
                        </button>
                        {puedeEditar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => abrirEdicion(v.id)}
                            aria-label="Editar"
                          >
                            <IconPencil width={16} height={16} />
                          </button>
                        )}
                        {puedeEditar && (
                          <select
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:outline-none"
                            value=""
                            onChange={(e) => e.target.value && cambioRapidoEstado(v.id, e.target.value as EstadoVenta)}
                            aria-label="Cambiar estado"
                          >
                            <option value="">Estado</option>
                            {ESTADOS_VENTA.filter((e) => e.valor !== v.estado).map((e) => (
                              <option key={e.valor} value={e.valor}>
                                {e.etiqueta}
                              </option>
                            ))}
                          </select>
                        )}
                        {puedeEliminar && v.estado !== 'ANULADA' && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setAAnular(v)}
                            aria-label={`Anular venta ${v.numero}`}
                            title="Anular"
                          >
                            <IconX width={16} height={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando ventas...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay ventas que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} ventas
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] text-gray-500">
                <span>Filas</span>
                <select
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-800 focus:outline-none"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value))
                    setPage(0)
                  }}
                >
                  {TAMANOS_PAGINA.map((t) => (
                    <option key={t} value={t}>
                      {t} por página
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => cambiarPagina(page - 1)}
                  disabled={page === 0 || loading}
                  aria-label="Página anterior"
                >
                  <IconChevronLeft width={15} height={15} />
                </button>
                <span className="text-[13px] text-gray-600">
                  Página {page + 1} de {data?.totalPages || 0}
                </span>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => cambiarPagina(page + 1)}
                  disabled={!data || page + 1 >= data.totalPages || loading}
                  aria-label="Página siguiente"
                >
                  <IconChevronRight width={15} height={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <VentaFormModal
          venta={null}
          onClose={() => setShowForm(false)}
          onSaved={() => recargar(true)}
        />
      )}

      {editando && (
        <VentaFormModal
          venta={editando}
          onClose={() => setEditando(null)}
          onSaved={() => recargar(true)}
        />
      )}

      {detalleId !== null && (
        <VentaDetailModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onEstadoCambiado={refrescarDespuesDeCambio}
          puedeEditar={puedeEditar}
        />
      )}

      <ConfirmDialog
        open={aAnular !== null}
        tono="danger"
        title="Anular venta"
        description={
          aAnular
            ? `¿Anular la venta ${aAnular.numero}? Queda registrada como anulada, no se borra del historial.`
            : ''
        }
        confirmLabel="Anular"
        onConfirm={async () => {
          if (aAnular) await eliminar(aAnular.id)
          setAAnular(null)
        }}
        onCancel={() => setAAnular(null)}
      />
    </section>
  )
}
