import { useEffect, useState } from 'react'

import type { Rol, Usuario } from '../types'
import { listarRoles } from '../services/rolService'
import { actualizarUsuario } from '../services/usuarioService'
import { extractErrorMessage } from '@/api/http'
import { getRoleColor } from '../utils/roleColor'
import ModalMarca from '@/components/ModalMarca'
import { useToastStore } from '@/store/toastStore'
import { IconUsers, IconX } from '@/components/icons'

interface Props {
  usuario: Usuario
  onClose: () => void
  onGuardado: () => Promise<void>
}

export default function EditarRolesModal({ usuario, onClose, onGuardado }: Props) {
  const toast = useToastStore((s) => s.show)
  const [roles, setRoles] = useState<Rol[]>([])
  const [seleccionados, setSeleccionados] = useState<number[]>(() => usuario.roles.map((r) => r.id))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listarRoles()
      .then(setRoles)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [])

  function toggleRol(id: number) {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  async function guardar() {
    setSaving(true)
    setError(null)
    try {
      await actualizarUsuario(usuario.id, { rolIds: seleccionados })
      toast(`Roles de "${usuario.username}" actualizados`, 'success')
      await onGuardado()
      onClose()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-roles-titulo"
        className="animate-modal-pop flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <IconUsers className="h-5 w-5" />
              </span>
              <div>
                <h3 id="editar-roles-titulo" className="text-[15px] font-semibold text-gray-900">
                  Roles de {usuario.username}
                </h3>
                <p className="text-xs text-gray-400">
                  Marca o desmarca los roles. El usuario recibirá una notificación por cada rol asignado o retirado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
          )}

          {roles.length === 0 && !error ? (
            <p className="py-6 text-center text-sm text-gray-400">Cargando roles...</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((rol) => {
                const seleccionado = seleccionados.includes(rol.id)
                const color = getRoleColor(rol)
                return (
                  <button
                    key={rol.id}
                    type="button"
                    onClick={() => toggleRol(rol.id)}
                    disabled={!rol.activo && !seleccionado}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      seleccionado
                        ? 'border-transparent font-medium text-gray-900 shadow-sm ring-1 ring-black/10'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={seleccionado ? { backgroundColor: `${color}14` } : undefined}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-md border-2 transition-colors"
                      style={{
                        borderColor: seleccionado ? color : '#d1d5db',
                        backgroundColor: seleccionado ? color : 'transparent',
                      }}
                    />
                    <span>{rol.nombre}</span>
                    {!rol.activo && <span className="ml-auto text-[11px] text-gray-400">Inactivo</span>}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? 'Guardando...' : 'Guardar roles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}