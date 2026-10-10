import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { APP_NAME } from '@/config/constants'
import { extractErrorMessage } from '@/api/http'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const register = useAuthStore((state) => state.register)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (token) {
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
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark to-brand">
      <form
        className="flex w-[360px] flex-col gap-4 rounded-xl bg-white p-8 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl font-bold text-brand">
          {APP_NAME}
        </h1>
        <p className="text-center text-sm text-gray-500">Crea tu cuenta</p>

        <label className="flex flex-col gap-1 text-[13px] text-gray-500">
          <span>Username</span>
          <input
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            minLength={3}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-[13px] text-gray-500">
          <span>Email</span>
          <input
            type="email"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-[13px] text-gray-500">
          <span>Contraseña</span>
          <input
            type="password"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-[13px] text-gray-500">
          <span>Confirmar contraseña</span>
          <input
            type="password"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <p className="text-[13px] text-red-700">{error}</p>}

        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>

        <p className="text-center text-[13px] text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  )
}