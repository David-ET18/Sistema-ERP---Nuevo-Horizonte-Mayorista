import { useEffect, useState } from 'react'

import type { Rol, RolRequest } from '../types'
import { extractErrorMessage } from '@/api/http'
import { crearRol, listarRoles } from '../services/rolService'
import { userCanManage } from '../utils/permissions'
import RolFormModal from '../components/RolFormModal'

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
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

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Roles</h2>
        {canManage && (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            onClick={() => setShowForm(true)}
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
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 font-semibold">Permisos</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{rol.nombre}</td>
                <td className="px-4 py-3">{rol.descripcion || '-'}</td>
                <td className="px-4 py-3">
                  {rol.permisos.length === 0
                    ? '-'
                    : rol.permisos
                        .map(
                          (permiso) =>
                            `${permiso.modulo} (${permiso.puedeLeer ? 'L' : ''}${permiso.puedeEscribir ? 'W' : ''})`,
                        )
                        .join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <RolFormModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </section>
  )
}