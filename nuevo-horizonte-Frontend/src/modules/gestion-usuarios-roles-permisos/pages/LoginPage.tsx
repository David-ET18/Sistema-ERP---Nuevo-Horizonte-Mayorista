import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { extractErrorMessage } from '@/api/http'
import SuccessOverlay from '@/components/SuccessOverlay'
import { IconSoporte } from '@/components/icons'
import { useAuthStore } from '../store/authStore'
import AuthBranding, { AUTH_INPUT_CLASSES, LocationBox } from '../components/AuthBranding'
import ForgotPasswordModal from '../components/ForgotPasswordModal'

/**
 * URL de la pagina de soporte.
 * EDITAR: pega aca el link que quieras abrir al presionar el icono.
 * Mientras este vacio, el icono se muestra pero no redirige.
 */
const URL_SOPORTE = 'https://aplicaciones-de-solicitud-en-nuevo.onrender.com/login'

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
      <main className="relative flex items-center justify-center bg-white p-6 pb-24">
        <form
          className="flex w-full max-w-md flex-col gap-5"
          onSubmit={handleSubmit}
        >
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

          <LocationBox />

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-[#0b1b3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#12305f] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
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

        {/* Soporte: tooltip al pasar el mouse y al enfocar con el teclado. */}
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-1.5">
          <a
            href={URL_SOPORTE || undefined}
            target={URL_SOPORTE ? '_blank' : undefined}
            rel={URL_SOPORTE ? 'noopener noreferrer' : undefined}
            aria-label="Ir a soporte"
            aria-disabled={!URL_SOPORTE}
            onClick={(e) => {
              if (!URL_SOPORTE) e.preventDefault()
            }}
            className="group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-[#0b1b3a] hover:bg-[#0b1b3a] hover:text-white focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
          >
            <IconSoporte width={22} height={22} />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-lg bg-[#0b1b3a] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              ¿Necesitas ayuda? Contacta a soporte
              <span className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#0b1b3a]" />
            </span>
          </a>
          <span className="text-[11px] text-gray-400">Soporte</span>
        </div>
      </main>

      {forgotOpen && (
        <ForgotPasswordModal onClose={() => setForgotOpen(false)} />
      )}
    </div>
  )
}