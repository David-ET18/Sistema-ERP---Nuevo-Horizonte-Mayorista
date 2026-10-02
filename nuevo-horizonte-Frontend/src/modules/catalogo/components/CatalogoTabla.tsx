import { useEffect, useState } from 'react'

import type { FiltrosCatalogo, Paginacion } from '../types'
import CatalogoFormModal, { type ValoresCatalogo } from './CatalogoFormModal'
import { extractErrorMessage } from '@/api/http'
import {
  canCreateModule,
  canDeleteModule,
  canUpdateModule,
} from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { formatDate } from '@/utils/format'
import { IconChevronLeft, IconChevronRight, IconPencil, IconPlus, IconSearch, IconTrash } from '@/components/icons'

const MODULO = 'catalogo'
const TAMANOS_PAGINA = [5, 10, 25, 50]
const FILTROS_INICIALES: FiltrosCatalogo = { q: '', grupo: '', activo: '' }

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
  obtenerGrupo: (item: T) => string | null
  listar: (filtros: FiltrosCatalogo, page: number, size: number) => Promise<Paginacion<T>>
  listarGrupos: () => Promise<string[]>
  guardar: (valores: ValoresCatalogo, editando: T | null) => Promise<void>
  eliminar: (id: number) => Promise<void>
  onCambio: () => void
}

export default function CatalogoTabla<T extends ItemCatalogo>({
  singular,
  plural,
  etiquetaGrupo,
  grupoObligatorio,
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

  async function borrar(item: T) {
    if (!window.confirm(`¿Eliminar ${singular} "${item.nombre}"?`)) return
    try {
      await eliminar(item.id)
      recargar(true)
      onCambio()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function enviar(valores: ValoresCatalogo) {
    await guardar(valores, editando)
    setFormAbierto(false)
    recargar(true)
    onCambio()
  }

  const hayFiltros = Boolean(filtros.q) || Boolean(filtros.grupo) || Boolean(filtros.activo)
  const desde = data ? data.number * data.size + 1 : 0
  const hasta = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0

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
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder={`Buscar ${singular}...`}
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={filtros.q}
            onChange={(e) => setFiltro('q', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') recargar(true)
            }}
          />
        </div>

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
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

        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          value={filtros.activo}
          onChange={(e) => {
            setFiltro('activo', e.target.value)
            recargar(true)
          }}
        >
          <option value="">Estado</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>

        {hayFiltros && (
          <button
            type="button"
            onClick={() => {
              setFiltros(FILTROS_INICIALES)
              recargar(true)
            }}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar Filtros
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
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <IconPlus /> Nuevo {singular}
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
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">{etiquetaGrupo}</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Registrado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.content.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{obtenerGrupo(item) || '-'}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-500">{item.descripcion || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(item.fechaCreacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {puedeEditar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => {
                              setEditando(item)
                              setFormAbierto(true)
                            }}
                            aria-label="Editar"
                          >
                            <IconPencil />
                          </button>
                        )}
                        {puedeEliminar && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => borrar(item)}
                            aria-label="Eliminar"
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    Cargando {plural}...
                  </td>
                </tr>
              )}
              {!loading && (data?.content.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No hay {plural} que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-[13px] text-gray-500">
              Mostrando {desde}–{hasta} de {data?.totalElements} {plural}
            </p>
            <div className="flex items-center gap-3">
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
        )}
      </div>

      {formAbierto && (
        <CatalogoFormModal
          titulo={editando ? `Editar ${singular}` : `Nuevo ${singular}`}
          etiquetaNombre="Nombre"
          etiquetaGrupo={etiquetaGrupo}
          grupoObligatorio={grupoObligatorio}
          sugerenciasGrupo={grupos}
          inicial={inicialForm}
          onSubmit={enviar}
          onClose={() => setFormAbierto(false)}
        />
      )}
    </div>
  )
}
