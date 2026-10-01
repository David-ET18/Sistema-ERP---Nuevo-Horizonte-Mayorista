import { useEffect, useState } from 'react'

import type { Permiso, Rol, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import {
  actualizarRol,
  crearRol,
  eliminarRol,
  listarRoles,
} from '../services/rolService'
import { userCanManage } from '../utils/permissions'
import RolFormModal from '../components/RolFormModal'
import RoleBadge from '../components/RoleBadge'

function formatPermisos(permisos: Permiso[]): string {
  return permisos
    .map((permiso) => {
      const flags = [
        permiso.puedeLeer ? 'V' : '',
        permiso.puedeCrear ? 'C' : '',
        permiso.puedeActualizar ? 'U' : '',
        permiso.puedeEliminar ? 'D' : '',
      ]
        .filter(Boolean)
        .join('·')
      return `${permiso.modulo} (${flags})`
    })
    .join(', ')
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingRol, setEditingRol] = useState<Rol | null>(null)
  const canManage = userCanManage()

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

  async function handleCreate(payload: RolRequest) {
    await crearRol(payload)
    setShowForm(false)
    await load()
  }

  async function handleEdit(rol: Rol, payload: RolRequest) {
    await actualizarRol(rol.id, payload)
    setEditingRol(null)
    setShowForm(false)
    await load()
  }

  async function handleDelete(rol: Rol) {
    if (!window.confirm(`¿Eliminar el rol "${rol.nombre}"?`)) return
    try {
      await eliminarRol(rol.id)
      await load()
    } catch (err) {
      setError(extractErrorMessage(err))
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

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Roles</h2>
        {canManage && (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            onClick={openCreate}
          >
            Nuevo rol
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-[13px] text-red-700">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full overflow-hidden rounded-xl bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Tipo base</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 font-semibold">Permisos</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              {canManage && <th className="px-4 py-3 font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <RoleBadge rol={rol} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    {rol.tipoBase}
                  </span>
                </td>
                <td className="px-4 py-3">{rol.descripcion || '-'}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600">
                  {rol.permisos.length === 0
                    ? '-'
                    : formatPermisos(rol.permisos)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      rol.activo
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {rol.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100"
                        onClick={() => openEdit(rol)}
                      >
                        Editar
                      </button>
                      {!rol.esSistema && (
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-[13px] text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(rol)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <RolFormModal
          rol={editingRol ?? undefined}
          onClose={() => setShowForm(false)}
          onSubmit={editingRol ? (payload) => handleEdit(editingRol, payload) : handleCreate}
        />
      )}
    </section>
  )
}