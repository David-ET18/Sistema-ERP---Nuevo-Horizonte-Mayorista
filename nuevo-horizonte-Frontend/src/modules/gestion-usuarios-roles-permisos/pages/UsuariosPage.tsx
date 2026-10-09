import { useEffect, useMemo, useState } from 'react'

import type { Usuario, UsuarioCreateRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import {
  actualizarUsuario,
  listarUsuarios,
  crearUsuario,
  desactivarUsuario,
  eliminarUsuarioDefinitivo,
  anonimizarUsuario,
} from '../services/usuarioService'
import { userCanManage } from '../utils/permissions'
import { formatDate } from '@/utils/format'
import UsuarioFormModal from '../components/UsuarioFormModal'
import EditarRolesModal from '../components/EditarRolesModal'
import RoleBadge from '../components/RoleBadge'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToastStore } from '@/store/toastStore'
import {
  IconCheckCircle,
  IconEdit,
  IconEyeOff,
  IconPlus,
  IconPower,
  IconSearch,
  IconTrash,
  IconUsers,
} from '@/components/icons'

function avatarColor(username: string): string {
  const paleta = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0ea5e9', '#dc2626', '#6366f1']
  const hash = [...username].reduce((suma, c) => suma + c.charCodeAt(0), 0)
  return paleta[hash % paleta.length]
}

function FilaEsqueleto() {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-3 w-36 animate-pulse rounded bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="mx-auto h-5 w-16 animate-pulse rounded-full bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-20 animate-pulse rounded bg-gray-100" /></td>
      <td className="px-4 py-4" />
    </tr>
  )
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [aEditarRoles, setAEditarRoles] = useState<Usuario | null>(null)
  const [aDesactivar, setADesactivar] = useState<Usuario | null>(null)
  const [aEliminar, setAEliminar] = useState<Usuario | null>(null)
  const [aAnonimizar, setAAnonimizar] = useState<Usuario | null>(null)
  const canManage = userCanManage()
  const toast = useToastStore((s) => s.show)

  async function load() {
    try {
      const data = await listarUsuarios()
      setUsuarios(data)
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

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter(
      (u) => u.username.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
    )
  }, [usuarios, busqueda])

  const totalActivos = usuarios.filter((u) => u.activo).length
  const totalInactivos = usuarios.length - totalActivos

  async function handleCreate(payload: UsuarioCreateRequest) {
    await crearUsuario(payload)
    setShowForm(false)
    await load()
    toast('Usuario creado correctamente', 'success')
  }

  async function handleRolesGuardados() {
    await load()
  }

  async function confirmarDesactivar() {
    if (!aDesactivar) return
    try {
      await desactivarUsuario(aDesactivar.id)
      setADesactivar(null)
      await load()
      toast(`Usuario "${aDesactivar.username}" desactivado`, 'success')
    } catch (err) {
      setADesactivar(null)
      toast(extractErrorMessage(err), 'error')
    }
  }

  async function reactivar(usuario: Usuario) {
    try {
      await actualizarUsuario(usuario.id, { activo: true })
      await load()
      toast(`Usuario "${usuario.username}" reactivado`, 'success')
    } catch (err) {
      toast(extractErrorMessage(err), 'error')
    }
  }

  async function confirmarAnonimizar() {
    if (!aAnonimizar) return
    try {
      await anonimizarUsuario(aAnonimizar.id)
      setAAnonimizar(null)
      await load()
      toast(`Usuario "${aAnonimizar.username}" anonimizado`, 'success')
    } catch (err) {
      setAAnonimizar(null)
      toast(extractErrorMessage(err), 'error')
    }
  }

  async function confirmarEliminarDefinitivo() {
    if (!aEliminar) return
    try {
      await eliminarUsuarioDefinitivo(aEliminar.id)
      setAEliminar(null)
      await load()
      toast(`Usuario "${aEliminar.username}" eliminado definitivamente`, 'success')
    } catch (err) {
      setAEliminar(null)
      toast(extractErrorMessage(err), 'error')
    }
  }

  const sinResultados = !loading && usuariosFiltrados.length === 0

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Usuarios</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Cuentas del sistema y los roles que tiene asignados cada una.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <IconPlus /> Nuevo usuario
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <IconUsers className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{usuarios.length}</p>
            <p className="text-[12.5px] text-gray-500">Usuarios en total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{totalActivos}</p>
            <p className="text-[12.5px] text-gray-500">Activos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{totalInactivos}</p>
            <p className="text-[12.5px] text-gray-500">Inactivos</p>
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
            placeholder="Buscar por usuario o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-72 rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
              <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Roles</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Creado</th>
                {canManage && <th className="px-4 py-3 text-center font-semibold">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }).map((_, i) => <FilaEsqueleto key={i} />)}

              {!loading &&
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50/70">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                          style={{ backgroundColor: avatarColor(usuario.username) }}
                        >
                          {usuario.username.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900">{usuario.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{usuario.email || '—'}</td>
                    <td className="px-4 py-3.5">
                      {usuario.roles.length === 0 ? (
                        <span className="text-gray-400">Sin rol</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {usuario.roles.map((rol) => (
                            <RoleBadge key={rol.id} rol={rol} />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          usuario.anonimizado
                            ? 'bg-gray-100 text-gray-400 ring-gray-300/40'
                            : usuario.activo
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
                              : 'bg-gray-100 text-gray-500 ring-gray-400/15'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            usuario.anonimizado ? 'bg-gray-300' : usuario.activo ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {usuario.anonimizado ? 'Anonimizado' : usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-500">{formatDate(usuario.fechaCreacion)}</td>
                    {canManage && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center">
                          {usuario.anonimizado ? (
                            <span className="text-[12px] text-gray-400">Sin acciones</span>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-brand/10 hover:text-brand"
                                onClick={() => setAEditarRoles(usuario)}
                                aria-label={`Editar roles de ${usuario.username}`}
                                title="Editar roles"
                              >
                                <IconEdit className="h-4 w-4" />
                              </button>
                              {usuario.activo ? (
                                <button
                                  type="button"
                                  className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                  onClick={() => setADesactivar(usuario)}
                                  aria-label={`Desactivar ${usuario.username}`}
                                  title="Desactivar"
                                >
                                  <IconPower className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                  onClick={() => reactivar(usuario)}
                                  aria-label={`Reactivar ${usuario.username}`}
                                  title="Reactivar"
                                >
                                  <IconCheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                onClick={() => setAAnonimizar(usuario)}
                                aria-label={`Anonimizar ${usuario.username}`}
                                title="Anonimizar"
                              >
                                <IconEyeOff className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                onClick={() => setAEliminar(usuario)}
                                aria-label={`Eliminar definitivamente ${usuario.username}`}
                                title="Eliminar definitivamente"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

              {sinResultados && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-4 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <IconUsers className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-700">
                        {busqueda ? 'No hay usuarios que coincidan con la búsqueda' : 'Todavía no hay usuarios'}
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
                            onClick={() => setShowForm(true)}
                            className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700"
                          >
                            <IconPlus className="h-3.5 w-3.5" /> Crear usuario
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
        <UsuarioFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {aEditarRoles && (
        <EditarRolesModal
          usuario={aEditarRoles}
          onClose={() => setAEditarRoles(null)}
          onGuardado={handleRolesGuardados}
        />
      )}

      <ConfirmDialog
        open={aDesactivar !== null}
        tono="danger"
        title="Desactivar usuario"
        description={
          aDesactivar
            ? `¿Seguro que deseas desactivar a "${aDesactivar.username}"? No podrá iniciar sesión hasta que lo reactives.`
            : ''
        }
        confirmLabel="Desactivar"
        onConfirm={confirmarDesactivar}
        onCancel={() => setADesactivar(null)}
      />

      <ConfirmDialog
        open={aAnonimizar !== null}
        tono="danger"
        title="Anonimizar usuario"
        description={
          aAnonimizar
            ? `¿Anonimizar a "${aAnonimizar.username}"? Su nombre de usuario y correo se reemplazan por un valor genérico y no podrá volver a iniciar sesión. Su historial de ventas y cotizaciones se conserva, pero ya no se podrá identificar quién fue. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Anonimizar"
        onConfirm={confirmarAnonimizar}
        onCancel={() => setAAnonimizar(null)}
      />

      <ConfirmDialog
        open={aEliminar !== null}
        tono="danger"
        title="Eliminar usuario definitivamente"
        description={
          aEliminar
            ? `¿Eliminar a "${aEliminar.username}" para siempre? Esta acción no se puede deshacer. Si tiene ventas, cotizaciones u otro historial asociado, no se podrá eliminar y deberá permanecer desactivado.`
            : ''
        }
        confirmLabel="Eliminar definitivamente"
        onConfirm={confirmarEliminarDefinitivo}
        onCancel={() => setAEliminar(null)}
      />
    </section>
  )
}
