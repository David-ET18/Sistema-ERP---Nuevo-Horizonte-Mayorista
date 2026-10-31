import { useEffect, useState } from 'react'

import type {
  FiltrosPromociones,
  KpisPromociones,
  PaginacionPromociones,
  Promocion,
  ServicioOpcion,
} from '../types'
import {
  cambiarActivoPromocion,
  eliminarPromocion,
  kpisPromociones,
  listarPromociones,
  listarServiciosPromocion,
  promocionImagenUrl,
} from '../services/promocionService'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToastStore } from '@/store/toastStore'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import PromocionFormModal from '../components/PromocionFormModal'
import PromocionDetalleModal from '../components/PromocionDetalleModal'
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconPencil,
  IconPlus,
  IconPower,
  IconSearch,
  IconStar,
  IconTrash,
} from '@/components/icons'

const MODULO = 'promociones'

const FILTROS_INICIALES: FiltrosPromociones = {
  q: '',
  servicioId: '',
  estado: '',
  destacada: false,
}

const TAMANOS_PAGINA = [6, 9, 12, 24]

const ESTADO_ESTILOS: Record<string, string> = {
  VIGENTE: 'bg-emerald-100 text-emerald-700',
  PROGRAMADA: 'bg-amber-100 text-amber-700',
  VENCIDA: 'bg-gray-100 text-gray-600',
  INACTIVA: 'bg-red-100 text-red-700',
}

const ESTADO_LABEL: Record<string, string> = {
  VIGENTE: 'Vigente',
  PROGRAMADA: 'Programada',
  VENCIDA: 'Vencida',
  INACTIVA: 'Inactiva',
}

function formatFechaCorta(fecha: string): string {
  if (!fecha) return '-'
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function vigenciaTexto(promocion: Promocion): string {
  if (promocion.estado === 'VENCIDA') return 'Vencida'
  if (promocion.estado === 'INACTIVA') return 'Inactiva'
  if (promocion.estado === 'PROGRAMADA') return `Inicia ${formatFechaCorta(promocion.fechaInicio)}`
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fin = new Date(`${promocion.fechaFin}T00:00:00`)
  const dias = Math.ceil((fin.getTime() - hoy.getTime()) / 86_400_000)
  if (dias <= 0) return 'Último día'
  if (dias === 1) return 'Vence mañana'
  if (dias <= 7) return `Vence en ${dias} días`
  return `Hasta ${formatFechaCorta(promocion.fechaFin)}`
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
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Promocion | null>(null)
  const [detalle, setDetalle] = useState<Promocion | null>(null)
  const [aEliminar, setAEliminar] = useState<Promocion | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)
  const toast = useToastStore((s) => s.show)

  useEffect(() => {
    listarServiciosPromocion().then(setServicios).catch(() => undefined)
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

  function recargar(resetPagina: boolean) {
    if (resetPagina && page !== 0) setPage(0)
    setRefreshKey((k) => k + 1)
  }

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
    setEditando(null)
    setShowForm(true)
  }

  function abrirEdicion(promocion: Promocion) {
    setEditando(promocion)
    setShowForm(true)
  }

  async function alternarActivo(promocion: Promocion) {
    try {
      const actualizada = await cambiarActivoPromocion(promocion.id, !promocion.activo)
      recargar(false)
      toast(
        `Promoción "${promocion.titulo}" ${actualizada.activo ? 'activada' : 'desactivada'}`,
        'success',
      )
    } catch (err) {
      toast(`No se pudo cambiar el estado: ${extractErrorMessage(err)}`, 'error')
    }
  }

  async function eliminar(id: number) {
    try {
      await eliminarPromocion(id)
      recargar(true)
      toast(aEliminar ? `Promoción "${aEliminar.titulo}" eliminada` : 'Promoción eliminada', 'success')
    } catch (err) {
      toast(`No se pudo eliminar: ${extractErrorMessage(err)}`, 'error')
    }
  }

  const hayFiltros =
    Boolean(filtros.q) ||
    Boolean(filtros.servicioId) ||
    Boolean(filtros.estado) ||
    filtros.destacada

  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

  const cards = [
    {
      etiqueta: 'Promociones',
      valor: kpis?.total ?? 0,
      color: 'bg-blue-100 text-blue-600',
      Icon: IconStar,
    },
    {
      etiqueta: 'Vigentes',
      valor: kpis?.vigentes ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    {
      etiqueta: 'Programadas',
      valor: kpis?.programadas ?? 0,
      color: 'bg-amber-100 text-amber-600',
      Icon: IconCalendar,
    },
    {
      etiqueta: 'Vencidas',
      valor: kpis?.vencidas ?? 0,
      color: 'bg-red-100 text-red-600',
      Icon: IconAlertTriangle,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Promociones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ofertas visuales asociadas a servicios, con imagen, vigencia y aviso automático
          </p>
        </div>
        {puedeCrear && (
          <button
            type="button"
            onClick={abrirNueva}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            <IconPlus className="h-4 w-4" />
            Nueva promoción
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
              <card.Icon />
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
          value={filtros.servicioId}
          onChange={(e) => {
            setFiltro('servicioId', e.target.value)
            aplicar()
          }}
        >
          <option value="">Todos los servicios</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.estado}
          onChange={(e) => {
            setFiltro('estado', e.target.value)
            aplicar()
          }}
        >
          <option value="">Todos los estados</option>
          <option value="VIGENTE">Vigentes</option>
          <option value="PROGRAMADA">Programadas</option>
          <option value="VENCIDA">Vencidas</option>
          <option value="INACTIVA">Inactivas</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setFiltro('destacada', !filtros.destacada)
            aplicar()
          }}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
            filtros.destacada
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <IconStar className="h-4 w-4" />
          Destacadas
        </button>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar filtros
          </button>
        )}

        <span className="ml-auto text-[13px] text-gray-500">
          {kpis?.activas ?? 0} activas · {kpis?.destacadas ?? 0} destacadas
        </span>
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-40 animate-pulse bg-gray-200" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (data?.content.length ?? 0) === 0 && (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <IconStar className="h-7 w-7" />
          </span>
          <p className="mt-4 text-base font-semibold text-gray-800">No hay promociones para mostrar</p>
          <p className="mt-1 text-sm text-gray-500">
            {hayFiltros
              ? 'Prueba con otros filtros o limpia la búsqueda.'
              : 'Crea la primera promoción y aparecerá aquí como una tarjeta.'}
          </p>
          {puedeCrear && !hayFiltros && (
            <button
              type="button"
              onClick={abrirNueva}
              className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <IconPlus className="h-4 w-4" />
              Crear promoción
            </button>
          )}
        </div>
      )}

      {!loading && (data?.content.length ?? 0) > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data?.content.map((promocion) => (
              <TarjetaPromocion
                key={promocion.id}
                promocion={promocion}
                puedeEditar={puedeEditar}
                puedeEliminar={puedeEliminar}
                onVer={() => setDetalle(promocion)}
                onEditar={() => abrirEdicion(promocion)}
                onAlternar={() => void alternarActivo(promocion)}
                onEliminar={() => setAEliminar(promocion)}
              />
            ))}
          </div>

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
        </>
      )}

      {showForm && (
        <PromocionFormModal
          promocion={editando}
          servicios={servicios}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            recargar(true)
          }}
        />
      )}

      {detalle && <PromocionDetalleModal promocion={detalle} onClose={() => setDetalle(null)} />}

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title="Eliminar promoción"
        description={
          aEliminar
            ? `¿Eliminar la promoción "${aEliminar.titulo}"? La imagen y la tarjeta dejarán de estar disponibles.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (aEliminar) await eliminar(aEliminar.id)
          setAEliminar(null)
        }}
        onCancel={() => setAEliminar(null)}
      />
    </section>
  )
}

function TarjetaPromocion({
  promocion,
  puedeEditar,
  puedeEliminar,
  onVer,
  onEditar,
  onAlternar,
  onEliminar,
}: {
  promocion: Promocion
  puedeEditar: boolean
  puedeEliminar: boolean
  onVer: () => void
  onEditar: () => void
  onAlternar: () => void
  onEliminar: () => void
}) {
  const imagen = promocionImagenUrl(promocion.imagenUrl)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand to-brand-dark">
        {imagen ? (
          <img
            src={imagen}
            alt={promocion.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/70">
            <IconStar className="h-8 w-8" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
              ESTADO_ESTILOS[promocion.estado] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {ESTADO_LABEL[promocion.estado] ?? promocion.estado}
          </span>
          <span className="rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-brand shadow-sm">
            -{Number(promocion.descuento)}%
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/65 to-transparent p-3 pt-8">
          <div className="flex items-center gap-2">
            {promocion.destacada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                <IconStar className="h-3 w-3" /> Destacada
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/35 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            <IconCalendar className="h-3 w-3" />
            {vigenciaTexto(promocion)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">
          {promocion.titulo}
        </h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-500">
          {promocion.descripcion || 'Sin descripción'}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
            {promocion.servicioNombre ?? 'General'}
          </span>
          {promocion.servicioCategoria && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
              {promocion.servicioCategoria}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-[11px] text-gray-400">
            {formatFechaCorta(promocion.fechaInicio)} — {formatFechaCorta(promocion.fechaFin)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onVer}
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label={`Ver ${promocion.titulo}`}
              title="Ver detalle"
            >
              <IconEye />
            </button>
            {puedeEditar && (
              <button
                type="button"
                onClick={onEditar}
                className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label={`Editar ${promocion.titulo}`}
                title="Editar"
              >
                <IconPencil />
              </button>
            )}
            {puedeEditar && (
              <button
                type="button"
                onClick={onAlternar}
                className={`cursor-pointer rounded-lg p-2 hover:bg-gray-100 ${
                  promocion.activo
                    ? 'text-gray-400 hover:text-amber-600'
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
                aria-label={promocion.activo ? 'Desactivar' : 'Activar'}
                title={promocion.activo ? 'Desactivar' : 'Activar'}
              >
                <IconPower />
              </button>
            )}
            {puedeEliminar && (
              <button
                type="button"
                onClick={onEliminar}
                className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Eliminar ${promocion.titulo}`}
                title="Eliminar"
              >
                <IconTrash />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
