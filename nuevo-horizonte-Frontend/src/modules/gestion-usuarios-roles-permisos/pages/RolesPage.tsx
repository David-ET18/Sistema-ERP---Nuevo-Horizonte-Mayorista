import { useEffect, useMemo, useState } from 'react'

import type { Permiso, Rol, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import {
  actualizarRol,
  crearRol,
  eliminarRol,
  listarRoles,
} from '../services/rolService'
import { userCanManage } from '../utils/permissions'
import { getRoleColor } from '../utils/roleColor'
import RolFormModal from '../components/RolFormModal'
import RoleBadge from '../components/RoleBadge'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToastStore } from '@/store/toastStore'
import { IconEdit, IconPlus, IconSearch, IconTrashBin, IconUsers, ShieldIcon } from '@/components/icons'

function permisosDetalle(permisos: Permiso[]): string {
  if (!permisos || permisos.length === 0) return 'Sin permisos asignados'
  return permisos
    .filter((p) => p?.modulo)
    .map((p) => {
      const flags = [
        p?.puedeLeer ? 'Ver' : '',
        p?.puedeCrear ? 'Crear' : '',
        p?.puedeActualizar ? 'Actualizar' : '',
        p?.puedeEliminar ? 'Eliminar' : '',
      ]
        .filter(Boolean)
        .join(', ')
      return `${p?.modulo}: ${flags}`
    })
    .join('\n')
}

function FilaEsqueleto() {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="h-3.5 w-28 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-4"><div className="mx-auto h-5 w-20 animate-pulse rounded-full bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-40 animate-pulse rounded bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="mx-auto h-5 w-24 animate-pulse rounded-full bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-100" /></td>
      <td className="px-4 py-4" />
    </tr>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRol, setEditingRol] = useState<Rol | null>(null)
  const [aEliminar, setAEliminar] = useState<Rol | null>(null)
  const canManage = userCanManage()
  const toast = useToastStore((s) => s.show)

  async function load() {
    try {
      const data = await listarRoles()
      setRoles(data)
      setError(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const rolesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(
      (r) => r.nombre.toLowerCase().includes(q) || (r.descripcion ?? '').toLowerCase().includes(q),
    )
  }, [roles, busqueda])

  const totalSistema = roles.filter((r) => r.esSistema).length
  const totalPersonalizados = roles.length - totalSistema

  async function handleCreate(payload: RolRequest) {
    await crearRol(payload)
    setShowForm(false)
    await load()
    toast('Rol creado correctamente', 'success')
  }

  async function handleEdit(rol: Rol, payload: RolRequest) {
    await actualizarRol(rol.id, payload)
    setEditingRol(null)
    setShowForm(false)
    await load()
    toast('Rol actualizado correctamente', 'success')
  }

  async function confirmarEliminar() {
    if (!aEliminar) return
    try {
      await eliminarRol(aEliminar.id)
      setAEliminar(null)
      await load()
      toast(`Rol "${aEliminar.nombre}" eliminado correctamente`, 'success')
    } catch (err) {
      setAEliminar(null)
      toast(extractErrorMessage(err), 'error')
    }
  }

  function openCreate() {
    setEditingRol(null)
    setShowForm(true)
  }

  function openEdit(rol: Rol) {
    setEditingRol(rol)
    setShowForm(true)
  }

  const sinResultados = !loading && rolesFiltrados.length === 0

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles y permisos</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Define qué puede ver, crear, actualizar o eliminar cada rol, módulo por módulo.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <IconPlus /> Nuevo rol
          </button>
        )}
      </div>

      {/* Resumen rapido: da contexto de un vistazo sin tener que contar filas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <IconUsers className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{roles.length}</p>
            <p className="text-[12.5px] text-gray-500">Roles en total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <ShieldIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{totalSistema}</p>
            <p className="text-[12.5px] text-gray-500">Roles de sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <IconEdit className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{totalPersonalizados}</p>
            <p className="text-[12.5px] text-gray-500">Roles personalizados</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-gray-200/70 bg-white p-3.5 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-64 rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="relative overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-center text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-left font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Permisos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                {canManage && <th className="px-4 py-3 font-semibold">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }).map((_, i) => <FilaEsqueleto key={i} />)}

              {!loading &&
                rolesFiltrados.map((rol) => {
                  const color = getRoleColor(rol)
                  const cantidadModulos = (rol.permisos ?? []).filter((p) => p?.modulo).length
                  return (
                    <tr key={rol.id} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50/70">
                      <td className="px-4 py-3.5">
                        <RoleBadge rol={rol} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset ${
                            rol.esSistema
                              ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/15'
                              : 'bg-gray-100 text-gray-600 ring-gray-400/15'
                          }`}
                        >
                          {rol.esSistema ? 'Sistema' : 'Personalizado'}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-4 py-3.5 text-[13px] text-gray-600">
                        <p className="truncate" title={rol.descripcion || undefined}>
                          {rol.descripcion || 'Sin descripción'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          title={permisosDetalle(rol.permisos)}
                          className="inline-flex cursor-default items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium text-gray-600 ring-1 ring-inset ring-gray-300"
                          style={{ backgroundColor: `${color}0d` }}
                        >
                          {cantidadModulos} {cantidadModulos === 1 ? 'módulo' : 'módulos'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            rol.activo
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
                              : 'bg-gray-100 text-gray-500 ring-gray-400/15'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${rol.activo ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {rol.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center">
                            <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200">
                              <button
                                type="button"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => openEdit(rol)}
                                aria-label={`Editar ${rol.nombre}`}
                                title="Editar"
                              >
                                <IconEdit className="h-4 w-4" />
                              </button>
                              {!rol.esSistema && (
                                <>
                                  <span className="h-8 w-px bg-gray-200" />
                                  <button
                                    type="button"
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setAEliminar(rol)}
                                    aria-label={`Eliminar ${rol.nombre}`}
                                    title="Eliminar"
                                  >
                                    <IconTrashBin className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}

              {sinResultados && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-4 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <ShieldIcon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-700">
                        {busqueda ? 'No hay roles que coincidan con la búsqueda' : 'Todavía no hay roles'}
                      </p>
                      {busqueda ? (
                        <button
                          type="button"
                          onClick={() => setBusqueda('')}
                          className="cursor-pointer text-[13px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          Limpiar búsqueda
                        </button>
                      ) : (
                        canManage && (
                          <button
                            type="button"
                            onClick={openCreate}
                            className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700"
                          >
                            <IconPlus className="h-3.5 w-3.5" /> Crear rol
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
      </div>

      {showForm && (
        <RolFormModal
          rol={editingRol ?? undefined}
          onClose={() => setShowForm(false)}
          onSubmit={editingRol ? (payload) => handleEdit(editingRol, payload) : handleCreate}
        />
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title="Eliminar rol"
        description={
          aEliminar
            ? `¿Seguro que deseas eliminar el rol "${aEliminar.nombre}"? Los usuarios que lo tengan asignado perderán estos permisos.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </section>
  )
}
