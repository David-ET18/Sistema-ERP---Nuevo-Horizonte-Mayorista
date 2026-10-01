import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { extractErrorMessage } from '@/api/http'
import SuccessOverlay from '@/components/SuccessOverlay'
import { useAuthStore } from '../store/authStore'
import AuthBranding, { AUTH_INPUT_CLASSES, LocationBox } from '../components/AuthBranding'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [startedAuthenticated] = useState(() => Boolean(useAuthStore.getState().token))
  const token = useAuthStore((state) => state.token)
  const register = useAuthStore((state) => state.register)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [welcome, setWelcome] = useState('')

  if (token && startedAuthenticated) {
    return <Navigate to="/" replace />
  }

  function validate(): string | null {
    if (username.trim().length < 3) {
      return 'El username debe tener al menos 3 caracteres'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Ingresa un email valido'
    }
    if (password.length < 6) {
      return 'La contrasena debe tener al menos 6 caracteres'
    }
    if (password !== confirmPassword) {
      return 'Las contrasenas no coinciden'
    }
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    setLoading(true)
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      })
      const usernameRegistrado = useAuthStore.getState().user?.username ?? ''
      setWelcome(usernameRegistrado)
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
        title="Cuenta creada con éxito"
        subtitle={`¡Bienvenido, ${welcome}!`}
        onFinish={() => navigate('/', { replace: true })}
      />
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBranding />

      {/* Panel derecho: formulario */}
      <main className="flex items-center justify-center bg-white p-6">
        <form
          className="flex w-full max-w-md flex-col gap-5"
          onSubmit={handleSubmit}
        >
          <header>
            <h2 className="text-3xl font-bold text-gray-900">Crear cuenta</h2>
            <p className="mt-1 text-sm text-gray-500">
              Regístrate para acceder al sistema
            </p>
          </header>

          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-700">
            <span>Usuario</span>
            <input
              className={AUTH_INPUT_CLASSES}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="juan.perez"
              minLength={3}
              required
            />
          </label>

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

          <LocationBox />

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-[#0b1b3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#12305f] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <footer className="text-center">
            <p className="text-[13px] text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-blue-700 hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </footer>
        </form>
      </main>
    </div>
  )
}