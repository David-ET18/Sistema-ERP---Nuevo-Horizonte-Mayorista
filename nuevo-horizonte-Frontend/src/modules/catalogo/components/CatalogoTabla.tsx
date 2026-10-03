import { useEffect, useState } from 'react'
import type { ReactElement, SVGProps } from 'react'

import type { FiltrosCatalogo, Paginacion } from '../types'
import { colorEtiqueta } from '../utils/tagColor'
import CatalogoFormModal, { type ValoresCatalogo } from './CatalogoFormModal'
import { extractErrorMessage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { useToastStore } from '@/store/toastStore'
import { formatDate } from '@/utils/format'
import { IconChevronLeft, IconChevronRight, IconPencil, IconPlus, IconSearch, IconTrash, IconX } from '@/components/icons'

const MODULO = 'catalogo'
const TAMANOS_PAGINA = [5, 10, 25, 50]
const FILTROS_INICIALES: FiltrosCatalogo = { q: '', grupo: '', activo: '' }

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement

interface ItemCatalogo {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
  fechaCreacion: string
}

interface Props<T extends ItemCatalogo> {
  /** Texto en singular y plural para titulos y mensajes. */
  singular: string
  plural: string
  etiquetaGrupo: string
  grupoObligatorio: boolean
  /** Icono que identifica visualmente cada fila (avatar circular). */
  Icon: IconComponent
  obtenerGrupo: (item: T) => string | null
  listar: (filtros: FiltrosCatalogo, page: number, size: number) => Promise<Paginacion<T>>
  listarGrupos: () => Promise<string[]>
  guardar: (valores: ValoresCatalogo, editando: T | null) => Promise<void>
  eliminar: (id: number) => Promise<void>
  onCambio: () => void
}

function FilaEsqueleto() {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
      </td>
      <td className="px-4 py-3.5" />
    </tr>
  )
}

export default function CatalogoTabla<T extends ItemCatalogo>({
  singular,
  plural,
  etiquetaGrupo,
  grupoObligatorio,
  Icon,
  obtenerGrupo,
  listar,
  listarGrupos,
  guardar,
  eliminar,
  onCambio,
}: Props<T>) {
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(FILTROS_INICIALES)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [data, setData] = useState<Paginacion<T> | null>(null)
  const [grupos, setGrupos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<T | null>(null)
  const [aEliminar, setAEliminar] = useState<T | null>(null)
  const toast = useToastStore((s) => s.show)

  const puedeCrear = canCreateModule(MODULO)
  const puedeEditar = canUpdateModule(MODULO)
  const puedeEliminar = canDeleteModule(MODULO)

  useEffect(() => {
    listarGrupos().then(setGrupos).catch(() => undefined)
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true)
    listar(filtros, page, size)
      .then((res) => {
        setData(res)
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

  function setFiltro<K extends keyof FiltrosCatalogo>(campo: K, valor: FiltrosCatalogo[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  async function confirmarEliminar() {
    if (!aEliminar) return
    try {
      await eliminar(aEliminar.id)
      setAEliminar(null)
      recargar(true)
      onCambio()
      toast(`${capitalizar(singular)} "${aEliminar.nombre}" eliminado correctamente`, 'success')
    } catch (err) {
      setAEliminar(null)
      toast(extractErrorMessage(err), 'error')
    }
  }

  async function enviar(valores: ValoresCatalogo) {
    const creando = !editando
    await guardar(valores, editando)
    setFormAbierto(false)
    recargar(true)
    onCambio()
    toast(
      creando ? `${capitalizar(singular)} creado correctamente` : `${capitalizar(singular)} actualizado correctamente`,
      'success',
    )
  }

  const hayFiltros = Boolean(filtros.q) || Boolean(filtros.grupo) || Boolean(filtros.activo)
  const cantidadFiltros = [filtros.q, filtros.grupo, filtros.activo].filter(Boolean).length
  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0
  const sinResultados = !loading && (data?.content.length ?? 0) === 0

  const inicialForm: ValoresCatalogo | null = editando
    ? {
        nombre: editando.nombre,
        grupo: obtenerGrupo(editando) ?? '',
        descripcion: editando.descripcion ?? '',
        activo: editando.activo,
      }
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de filtros y acciones */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder={`Buscar ${singular}...`}
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') recargar(true)
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          value={filtros.grupo}
          onChange={(e) => {
            setFiltro('grupo', e.target.value)
            recargar(true)
          }}
        >
          <option value="">{etiquetaGrupo}</option>
          {grupos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Segmento de estado: mas rapido de operar que un select y comunica el filtro activo de un vistazo */}
        <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-0.5">
          {(
            [
              { valor: '', etiqueta: 'Todos' },
              { valor: 'true', etiqueta: 'Activos' },
              { valor: 'false', etiqueta: 'Inactivos' },
            ] as const
          ).map((op) => (
            <button
              key={op.valor}
              type="button"
              onClick={() => {
                setFiltro('activo', op.valor)
                recargar(true)
              }}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                filtros.activo === op.valor ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {op.etiqueta}
            </button>
          ))}
        </div>

        {hayFiltros && (
          <button
            type="button"
            onClick={() => {
              setFiltros(FILTROS_INICIALES)
              recargar(true)
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <IconX className="h-3.5 w-3.5" />
            Limpiar {cantidadFiltros > 1 ? `(${cantidadFiltros})` : ''}
          </button>
        )}

        <div className="ml-auto">
          {puedeCrear && (
            <button
              type="button"
              onClick={() => {
                setEditando(null)
                setFormAbierto(true)
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <IconPlus /> Nuevo {singular}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">{capitalizar(singular)}</th>
                <th className="px-4 py-3 font-semibold">{etiquetaGrupo}</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Registrado</th>
                <th className="px-4 py-3 text-right font-semibold">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <FilaEsqueleto key={i} />)}

              {!loading &&
                data?.content.map((item) => {
                  const grupo = obtenerGrupo(item)
                  return (
                    <tr key={item.id} className="group border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              item.activo ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{item.nombre}</p>
                            <p className="truncate text-[12px] text-gray-500">{item.descripcion || 'Sin descripción'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {grupo ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-inset ${colorEtiqueta(grupo)}`}
                          >
                            {grupo}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            item.activo
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
                              : 'bg-gray-100 text-gray-500 ring-gray-400/15'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${item.activo ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(item.fechaCreacion)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100">
                          {puedeEditar && (
                            <button
                              type="button"
                              className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              onClick={() => {
                                setEditando(item)
                                setFormAbierto(true)
                              }}
                              aria-label={`Editar ${item.nombre}`}
                            >
                              <IconPencil />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              type="button"
                              className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              onClick={() => setAEliminar(item)}
                              aria-label={`Eliminar ${item.nombre}`}
                            >
                              <IconTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

              {sinResultados && (
                <tr>
                  <td colSpan={5} className="px-4 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-700">
                        {hayFiltros ? `No hay ${plural} que coincidan con los filtros` : `Todavía no hay ${plural}`}
                      </p>
                      {hayFiltros ? (
                        <button
                          type="button"
                          onClick={() => {
                            setFiltros(FILTROS_INICIALES)
                            recargar(true)
                          }}
                          className="cursor-pointer text-[13px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          Limpiar filtros
                        </button>
                      ) : (
                        puedeCrear && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditando(null)
                              setFormAbierto(true)
                            }}
                            className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700"
                          >
                            <IconPlus className="h-3.5 w-3.5" /> Crear {singular}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando <span className="font-medium text-gray-700">{desde}–{hasta}</span> de{' '}
              <span className="font-medium text-gray-700">{data?.totalElements}</span> {plural}
            </p>
            <div className="flex items-center gap-3">
              <select
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
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
              <button
                type="button"
                disabled={(data?.number ?? 0) <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="cursor-pointer rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {formAbierto && (
        <CatalogoFormModal
          titulo={editando ? `Editar ${singular}` : `Nuevo ${singular}`}
          subtitulo={editando ? `Actualiza los datos de este ${singular}` : `Completa los datos del nuevo ${singular}`}
          etiquetaNombre="Nombre"
          etiquetaGrupo={etiquetaGrupo}
          grupoObligatorio={grupoObligatorio}
          sugerenciasGrupo={grupos}
          inicial={inicialForm}
          onSubmit={enviar}
          onClose={() => setFormAbierto(false)}
        />
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title={`Eliminar ${singular}`}
        description={
          aEliminar
            ? `¿Seguro que deseas eliminar "${aEliminar.nombre}"? Si está en uso por tarifas o paquetes, se te pedirá desactivarlo en su lugar.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
