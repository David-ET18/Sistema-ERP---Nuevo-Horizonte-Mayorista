import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import type { Rol, UsuarioCreateRequest } from '../types'
import { listarRoles } from '../services/rolService'
import { extractErrorMessage } from '@/api/http'
import { getRoleColor } from '../utils/roleColor'
import { useFormDraft } from '@/hooks/useFormDraft'

interface UsuarioFormModalProps {
  onClose: () => void
  onSubmit: (payload: UsuarioCreateRequest) => Promise<void>
}

interface UsuarioFormState {
  username: string
  email: string
  rolIds: number[]
}

const VACIO: UsuarioFormState = { username: '', email: '', rolIds: [] }

export default function UsuarioFormModal({
  onClose,
  onSubmit,
}: UsuarioFormModalProps) {
  const [roles, setRoles] = useState<Rol[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // La contrasena nunca se guarda en sessionStorage: solo vive en memoria.
  const [password, setPassword] = useState('')

  const borrador = useFormDraft<UsuarioFormState>('usuario:nuevo', VACIO)
  const { username, email, rolIds } = borrador.valor

  useEffect(() => {
    listarRoles()
      .then(setRoles)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [])

  function toggleRol(id: number) {
    borrador.setCampo(
      'rolIds',
      rolIds.includes(id) ? rolIds.filter((r) => r !== id) : [...rolIds, id],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un email valido')
      return
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      await onSubmit({ username, password, email: email.trim(), rolIds })
      borrador.reset()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-[480px] max-w-[95vw] flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Nuevo usuario</h3>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
            <span>Username</span>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
              value={username}
              onChange={(e) => borrador.setCampo('username', e.target.value)}
              maxLength={60}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
            <span>Contraseña</span>
            <input
              type="password"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-gray-500">
            <span>Email</span>
            <input
              type="email"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
              value={email}
              onChange={(e) => borrador.setCampo('email', e.target.value)}
              maxLength={100}
              required
            />
          </label>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
            <legend className="px-1 text-[13px] text-gray-500">Roles</legend>
            {roles.map((rol) => (
              <label key={rol.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rolIds.includes(rol.id)}
                  onChange={() => toggleRol(rol.id)}
                />
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getRoleColor(rol) }}
                />
                {rol.nombre}
              </label>
            ))}
            {roles.length === 0 && <span className="text-sm">No hay roles disponibles</span>}
          </fieldset>

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          <p className="text-[11px] text-gray-400">
            {borrador.restaurado
              ? 'Borrador restaurado (sin contrasena)'
              : 'Los datos se guardan al cerrar el modal'}
          </p>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}