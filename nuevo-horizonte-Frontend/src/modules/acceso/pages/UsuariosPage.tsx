import { useEffect, useState } from 'react'

import type { Usuario, UsuarioCreateRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import {
  listarUsuarios,
  crearUsuario,
  desactivarUsuario,
} from '../services/usuarioService'
import { userCanManage } from '../utils/permissions'
import { formatDate } from '@/utils/format'
import UsuarioFormModal from '../components/UsuarioFormModal'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const canManage = userCanManage()

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

  async function handleCreate(payload: UsuarioCreateRequest) {
    await crearUsuario(payload)
    setShowForm(false)
    await load()
  }

  async function handleDeactivate(id: number) {
    if (!window.confirm('¿Desactivar este usuario?')) return
    await desactivarUsuario(id)
    await load()
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Usuarios</h2>
        {canManage && (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            onClick={() => setShowForm(true)}
          >
            Nuevo usuario
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
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Roles</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Creado</th>
              {canManage && <th className="px-4 py-3 font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{usuario.username}</td>
                <td className="px-4 py-3">{usuario.email || '-'}</td>
                <td className="px-4 py-3">
                  {usuario.roles.map((rol) => rol.nombre).join(', ') || '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      usuario.activo
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(usuario.fechaCreacion)}</td>
                {canManage && (
                  <td className="px-4 py-3">
                    {usuario.activo && (
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDeactivate(usuario.id)}
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <UsuarioFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  )
}