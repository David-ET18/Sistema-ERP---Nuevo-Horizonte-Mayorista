import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import type { Rol, UsuarioCreateRequest } from '../types'
import { listarRoles } from '../services/rolService'
import { extractErrorMessage } from '@/api/http'
import { getRoleColor } from '../utils/roleColor'
import { useFormDraft } from '@/hooks/useFormDraft'
import Alert from '@/components/Alert'
import { IconEye, IconEyeOff, IconX } from '@/components/icons'

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
  const [verPassword, setVerPassword] = useState(false)

  // La contrasena nunca se guarda en sessionStorage: solo vive en memoria.
  const [password, setPassword] = useState('')

  const borrador = useFormDraft<UsuarioFormState>('usuario:nuevo', VACIO)
  const { username, email, rolIds } = borrador.valor

  useEffect(() => {
    listarRoles()
      .then(setRoles)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError('Ingresa un email válido')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
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

  const inputClase =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10'

  const inicial = (username || '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-gray-900/40 backdrop-blur-[1px]"
      onClick={onClose}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="usuario-form-titulo"
        className="animate-panel-in flex h-full w-[480px] max-w-full flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="flex h-full flex-col" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {inicial}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Nuevo usuario</p>
                <h3 id="usuario-form-titulo" className="mt-0.5 text-[17px] font-semibold text-gray-900">
                  {username || 'Usuario sin nombre'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            {error && <Alert type="error">{error}</Alert>}

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">
                Nombre de usuario <span className="text-red-500">*</span>
              </span>
              <input
                className={inputClase}
                value={username}
                onChange={(e) => borrador.setCampo('username', e.target.value)}
                placeholder="Ej. jperez"
                maxLength={60}
                autoComplete="off"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <input
                  type={verPassword ? 'text' : 'password'}
                  className={`${inputClase} pr-10`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {verPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </span>
              <input
                type="email"
                className={inputClase}
                value={email}
                onChange={(e) => borrador.setCampo('email', e.target.value)}
                placeholder="nombre@nuevohorizonte.pe"
                maxLength={100}
                required
              />
            </label>

            <div className="flex flex-col gap-2 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                <p className="text-[13px] font-semibold text-gray-800">Roles</p>
                <span className="text-[11.5px] text-gray-500">
                  {rolIds.length} {rolIds.length === 1 ? 'seleccionado' : 'seleccionados'}
                </span>
              </div>

              {roles.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500">No hay roles disponibles</p>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                  {roles.map((rol) => {
                    const seleccionado = rolIds.includes(rol.id)
                    return (
                      <label
                        key={rol.id}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${
                          seleccionado ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => toggleRol(rol.id)}
                          className="h-4 w-4 cursor-pointer accent-blue-600"
                        />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: getRoleColor(rol) }}
                        />
                        <span className="text-[13.5px] text-gray-800">{rol.nombre}</span>
                        {!rol.activo && (
                          <span className="ml-auto text-[11px] text-gray-400">Inactivo</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400">
              {borrador.restaurado
                ? 'Borrador restaurado (sin contraseña)'
                : 'Los datos se guardan al cerrar el panel'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? 'Guardando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
