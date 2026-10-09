import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { extractErrorMessage } from '@/api/http'
import SuccessOverlay from '@/components/SuccessOverlay'
import BrandLogo from '@/components/BrandLogo'
import { useAuthStore } from '../store/authStore'
import AuthBranding, { AUTH_INPUT_CLASSES } from '../components/AuthBranding'
import ForgotPasswordModal from '../components/ForgotPasswordModal'

export default function LoginPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const cargandoSesion = useAuthStore((state) => state.cargandoSesion)
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [welcome, setWelcome] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailOk) {
      setError('Ingresa un email valido')
      return
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      const username = useAuthStore.getState().user?.username ?? ''
      setWelcome(username)
      setSuccess(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <SuccessOverlay
        title="Inicio de sesión exitoso"
        subtitle={`¡Bienvenido, ${welcome}!`}
        onFinish={() => navigate('/', { replace: true })}
      />
    )
  }

  // Si ya hay sesion activa (se entro a /login a mano estando logueado) se
  // redirige directo, sin pasar por el overlay de bienvenida de arriba.
  //
  // El "!loading" es necesario: login() deja el usuario en el store global
  // (useAuthStore) antes de que handleSubmit llegue a su propio setSuccess,
  // y como este componente esta suscrito a ese store, ese cambio dispara un
  // re-render intermedio con user ya presente pero success todavia en false.
  // Sin este resguardo, ese render de paso caia aqui y mandaba derecho a "/"
  // sin pasar nunca por el check de exito ni por SuccessOverlay.
  if (!cargandoSesion && user && !loading) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBranding />

      {/* Panel derecho: formulario */}
      <main className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {/* Solo visible en movil/tablet: AuthBranding (con el logo) esta oculto ahi.
              El logo es blanco, por eso el chip oscuro detras. */}
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex items-center rounded-xl bg-[#0b1b3a] px-5 py-3">
              <BrandLogo height={28} />
            </div>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <header>
              <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ingresa tus credenciales para acceder
              </p>
            </header>

            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-700">
              <span>Correo institucional</span>
              <input
                type="email"
                className={AUTH_INPUT_CLASSES}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="nombre@nuevohorizonte.pe"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-700">
              <span>Contraseña</span>
              <input
                type="password"
                className={AUTH_INPUT_CLASSES}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-[#0b1b3a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#12305f] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            <footer className="text-center">
              <p className="text-[13px] text-gray-500">
                ¿Olvidaste tu contraseña?{' '}
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="cursor-pointer font-medium text-blue-700 hover:underline"
                >
                  Recuperar acceso
                </button>
              </p>
            </footer>
          </form>
        </div>
      </main>

      {forgotOpen && (
        <ForgotPasswordModal onClose={() => setForgotOpen(false)} />
      )}
    </div>
  )
}