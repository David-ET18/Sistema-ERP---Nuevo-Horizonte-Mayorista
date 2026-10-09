import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { extractErrorMessage } from '@/api/http'
import { useAuthStore } from '../store/authStore'
import { resetPassword } from '../services/authService'
import AuthBranding, { AUTH_INPUT_CLASSES } from '../components/AuthBranding'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const loggedIn = useAuthStore((state) => state.user)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (loggedIn) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ token, nuevaContrasena: password })
      setSuccess(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBranding />

      <main className="flex items-center justify-center bg-white p-6">
        {!token ? (
          <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Enlace no valido
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              El enlace de recuperacion no contiene un token valido.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block cursor-pointer rounded-lg bg-[#0b1b3a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#12305f]"
            >
              Volver al inicio de sesion
            </Link>
          </div>
        ) : success ? (
          <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <svg viewBox="0 0 52 52" className="success-pop mx-auto h-20 w-20">
              <circle
                cx="26"
                cy="26"
                r="24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                className="success-circle"
              />
              <path
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l7 7 16-16"
                className="success-check"
              />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Contrasena actualizada
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Tu contrasena se restablecio correctamente. Ya puedes iniciar
              sesion con tu nueva contrasena.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block cursor-pointer rounded-lg bg-[#0b1b3a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#12305f]"
            >
              Iniciar sesion
            </Link>
          </div>
        ) : (
          <form
            className="flex w-full max-w-md flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <header>
              <h2 className="text-3xl font-bold text-gray-900">
                Nueva contraseña
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Ingresa tu nueva contraseña
              </p>
            </header>

            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-700">
              <span>Contraseña</span>
              <input
                type="password"
                className={AUTH_INPUT_CLASSES}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-700">
              <span>Confirmar contraseña</span>
              <input
                type="password"
                className={AUTH_INPUT_CLASSES}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </label>

            {error && <p className="text-[13px] text-red-700">{error}</p>}

            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-[#0b1b3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#12305f] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>

            <footer className="text-center">
              <p className="text-[13px] text-gray-500">
                ¿Recordaste tu contraseña?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-700 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </footer>
          </form>
        )}
      </main>
    </div>
  )
}