import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import type { Rol, UsuarioCreateRequest } from '../types'
import { listarRoles } from '../services/rolService'
import { extractErrorMessage } from '@/api/http'
import { getRoleColor } from '../utils/roleColor'

interface UsuarioFormModalProps {
  onClose: () => void
  onSubmit: (payload: UsuarioCreateRequest) => Promise<void>
}

export default function UsuarioFormModal({
  onClose,
  onSubmit,
}: UsuarioFormModalProps) {
  const [roles, setRoles] = useState<Rol[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [rolIds, setRolIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listarRoles()
      .then(setRoles)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [])

  function toggleRol(id: number) {
    setRolIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
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
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
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