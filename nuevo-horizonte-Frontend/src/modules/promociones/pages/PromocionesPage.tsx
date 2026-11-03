import { useCallback, useEffect, useState } from 'react'

import type {
  FiltrosPromociones,
  KpisPromociones,
  PaginacionPromociones,
  Promocion,
  ServicioOpcion,
} from '../types'
import {
  cambiarEstadoPromocion,
  eliminarPromocion,
  kpisPromociones,
  listarPromociones,
  listarServiciosDisponibles,
  urlImagenPromocion,
} from '../services/promocionesService'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  IconCalendar,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconEye,
  IconPencil,
  IconPlus,
  IconPower,
  IconSearch,
  IconStar,
  IconTrash,
  IconTrendingUp,
} from '@/components/icons'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { useToastStore } from '@/store/toastStore'
import PromocionDetalleModal from '../components/PromocionDetalleModal'
import PromocionFormPanel from '../components/PromocionFormPanel'

const MODULO = 'promociones'
const TAMANOS_PAGINA = [9, 18, 27, 36]

const FILTROS_INICIALES: FiltrosPromociones = {
  q: '',
  estado: '',
  servicioId: '',
  destacada: false,
  activa: '',
}

const ESTADO_ESTILOS: Record<string, string> = {
  VIGENTE: 'bg-emerald-500 text-white',
  PROGRAMADA: 'bg-sky-500 text-white',
  VENCIDA: 'bg-gray-600 text-white',
  INACTIVA: 'bg-rose-500 text-white',
}

const ESTADO_LABEL: Record<string, string> = {
  VIGENTE: 'Vigente',
  PROGRAMADA: 'Programada',
  VENCIDA: 'Vencida',
  INACTIVA: 'Inactiva',
}

function fechaCorta(valor: string | null): string {
  if (!valor) return 'Sin límite'
  const [anio, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${anio}`
}

function precio(valor: number | null): string {
  return valor != null ? `S/ ${valor.toFixed(2)}` : '—'
}

export default function PromocionesPage() {
  const [filtros, setFiltros] = useState<FiltrosPromociones>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(9)
  const [data, setData] = useState<PaginacionPromociones<Promocion> | null>(null)
  const [kpis, setKpis] = useState<KpisPromociones | null>(null)
  const [servicios, setServicios] = useState<ServicioOpcion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Promocion | null>(null)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aEliminar, setAEliminar] = useState<Promocion | null>(null)
  const [accionId, setAccionId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)
  const toast = useToastStore((s) => s.show)
  const refrescarNotifs = useNotificacionesStore((s) => s.refrescar)

  useEffect(() => {
    listarServiciosDisponibles().then(setServicios).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([listarPromociones(filtros, page, size), kpisPromociones()])
      .then(([lista, kpi]) => {
        setData(lista)
        setKpis(kpi)
        setError(null)
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, refreshKey])

  const recargar = useCallback((resetPagina = false) => {
    if (resetPagina) setPage(0)
    setRefreshKey((k) => k + 1)
  }, [])

  function setFiltro<K extends keyof FiltrosPromociones>(campo: K, valor: FiltrosPromociones[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  function aplicar() {
    recargar(true)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    recargar(true)
  }

  function abrirNueva() {
    setEnEdicion(null)
    setFormOpen(true)
  }

  function abrirEdicion(promocion: Promocion) {
    setEnEdicion(promocion)
    setFormOpen(true)
  }

  async function alternarEstado(promocion: Promocion) {
    setAccionId(promocion.id)
    try {
      const actualizada = await cambiarEstadoPromocion(promocion.id, !promocion.activa)
      toast(
        actualizada.activa
          ? `Promoción "${actualizada.nombre}" activada. Se notificó a los usuarios activos.`
          : `Promoción "${actualizada.nombre}" desactivada`,
        'success',
      )
      recargar(false)
      void refrescarNotifs()
    } catch (err) {
      toast(`No se pudo cambiar el estado: ${extractErrorMessage(err)}`, 'error')
    } finally {
      setAccionId(null)
    }
  }

  async function eliminar(promocion: Promocion) {
    try {
      await eliminarPromocion(promocion.id)
      toast(`Promoción "${promocion.nombre}" eliminada`, 'success')
      recargar(true)
    } catch (err) {
      toast(`No se pudo eliminar la promoción: ${extractErrorMessage(err)}`, 'error')
    }
  }

  const hayFiltros =
    Boolean(filtros.q) ||
    Boolean(filtros.estado) ||
    Boolean(filtros.servicioId) ||
    Boolean(filtros.activa) ||
    filtros.destacada

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Promociones',
      valor: kpis?.total ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconTrendingUp,
    },
    {
      etiqueta: 'Activas',
      valor: kpis?.activas ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'Vigentes',
      valor: kpis?.vigentes ?? 0,
      color: 'bg-sky-100 text-sky-600',
      Icon: IconCalendar,
    },
    {
      etiqueta: 'Por vencer (7 días)',
      valor: kpis?.porVencer ?? 0,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconClock,
    },
    {
      etiqueta: 'Destacadas',
      valor: kpis?.destacadas ?? 0,
      color: 'bg-fuchsia-100 text-fuchsia-600',
      Icon: IconStar,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Promociones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Descuentos y ofertas especiales con imagen, vigencia y notificación automática.
          </p>
        </div>
        {puedeCrear && (
          <button
            type="button"
            onClick={abrirNueva}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            <IconPlus />
            Nueva promoción
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight text-gray-900">{card.valor}</p>
              <p className="truncate text-[12px] text-gray-500">{card.etiqueta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar promoción..."
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicar()
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.estado}
          onChange={(e) => {
            setFiltro('estado', e.target.value)
            aplicar()
          }}
        >
          <option value="">Vigencia</option>
          <option value="VIGENTE">Vigente</option>
          <option value="PROGRAMADA">Programada</option>
          <option value="VENCIDA">Vencida</option>
          <option value="INACTIVA">Inactiva</option>
        </select>

        <select
          className="max-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.servicioId}
          onChange={(e) => {
            setFiltro('servicioId', e.target.value)
            aplicar()
          }}
        >
          <option value="">Todos los servicios</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.activa}
          onChange={(e) => {
            setFiltro('activa', e.target.value)
            aplicar()
          }}
        >
          <option value="">Activas e inactivas</option>
          <option value="true">Solo activas</option>
          <option value="false">Solo inactivas</option>
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-[var(--color-brand)]"
            checked={filtros.destacada}
            onChange={(e) => {
              setFiltro('destacada', e.target.checked)
              aplicar()
            }}
          />
          Solo destacadas
        </label>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      )}

      {!loading && (data?.content.length ?? 0) === 0 && (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <IconStar className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-gray-800">No hay promociones para mostrar</p>
          <p className="mt-1 text-[13px] text-gray-500">
            Crea una campaña con imagen y descuento para verla como tarjeta.
          </p>
          {puedeCrear && (
            <button
              type="button"
              onClick={abrirNueva}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <IconPlus /> Nueva promoción
            </button>
          )}
        </div>
      )}

      {!loading && (data?.content.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.content.map((promocion) => (
            <article
              key={promocion.id}
              className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-shadow hover:shadow-md ${
                promocion.destacada ? 'ring-2 ring-amber-300/70' : 'ring-gray-100'
              }`}
            >
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-brand to-sky-500">
                {promocion.tieneImagen ? (
                  <img
                    src={urlImagenPromocion(promocion.id, promocion.fechaActualizacion)}
                    alt={promocion.nombre}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white/80">
                    <IconStar className="h-8 w-8" />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Sin imagen</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                    ESTADO_ESTILOS[promocion.estadoVigencia] ?? 'bg-gray-600 text-white'
                  }`}
                >
                  {ESTADO_LABEL[promocion.estadoVigencia] ?? promocion.estadoVigencia}
                </span>

                {promocion.destacada && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
                    <IconStar className="h-3 w-3" /> Destacada
                  </span>
                )}

                <span className="absolute bottom-3 left-3 rounded-xl bg-white px-3 py-1.5 text-lg font-extrabold text-red-600 shadow-lg">
                  -{promocion.descuentoPorcentaje}%
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 flex-1 text-[15px] font-semibold text-gray-900">
                    {promocion.nombre}
                  </h3>
                </div>

                <span className="w-fit rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {promocion.servicioNombre ?? 'Promoción general'}
                </span>

                <p className="line-clamp-2 min-h-[2.5rem] text-[13px] leading-relaxed text-gray-500">
                  {promocion.descripcion || 'Sin descripción. Edita la promoción para agregar detalles.'}
                </p>

                <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <IconCalendar className="h-3.5 w-3.5 text-gray-400" />
                  {fechaCorta(promocion.fechaInicio)} — {fechaCorta(promocion.fechaFin)}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-gray-900">{precio(promocion.precioPromocional)}</span>
                  {promocion.precioOriginal != null && (
                    <span className="text-[12px] text-gray-400 line-through">
                      {precio(promocion.precioOriginal)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-end gap-1 border-t border-gray-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setDetalleId(promocion.id)}
                  className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={`Ver ${promocion.nombre}`}
                  title="Ver detalle"
                >
                  <IconEye />
                </button>
                {puedeEditar && (
                  <button
                    type="button"
                    onClick={() => abrirEdicion(promocion)}
                    className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <IconPencil />
                  </button>
                )}
                {puedeEditar && (
                  <button
                    type="button"
                    onClick={() => void alternarEstado(promocion)}
                    disabled={accionId === promocion.id}
                    className={`cursor-pointer rounded-lg p-2 disabled:opacity-50 ${
                      promocion.activa
                        ? 'text-amber-500 hover:bg-amber-50'
                        : 'text-emerald-500 hover:bg-emerald-50'
                    }`}
                    aria-label={promocion.activa ? 'Desactivar' : 'Activar'}
                    title={promocion.activa ? 'Desactivar' : 'Activar y notificar'}
                  >
                    <IconPower />
                  </button>
                )}
                {puedeEliminar && (
                  <button
                    type="button"
                    onClick={() => setAEliminar(promocion)}
                    className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar"
                    title="Eliminar"
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {(data?.totalElements ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-[13px] text-gray-500">
            Mostrando {desde}–{hasta} de {data?.totalElements} promociones
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] text-gray-500">
              <span>Tarjetas</span>
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
                disabled={(data?.number ?? 0) <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página anterior"
              >
                <IconChevronLeft />
              </button>
              <span className="text-[13px] text-gray-600">
                Página {(data?.number ?? 0) + 1} de {Math.max(data?.totalPages ?? 1, 1)}
              </span>
              <button
                type="button"
                disabled={(data?.number ?? 0) + 1 >= (data?.totalPages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <PromocionFormPanel
          promocion={enEdicion}
          servicios={servicios}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            recargar(!enEdicion)
            void refrescarNotifs()
          }}
        />
      )}

      {detalleId !== null && (
        <PromocionDetalleModal id={detalleId} onClose={() => setDetalleId(null)} />
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title="Eliminar promoción"
        description={
          aEliminar
            ? `¿Eliminar la promoción "${aEliminar.nombre}"? También se borrará su imagen almacenada.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (aEliminar) await eliminar(aEliminar)
          setAEliminar(null)
        }}
        onCancel={() => setAEliminar(null)}
      />
    </section>
  )
}
