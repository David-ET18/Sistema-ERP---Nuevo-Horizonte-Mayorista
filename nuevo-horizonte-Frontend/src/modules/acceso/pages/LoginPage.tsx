import { useState } from 'react'
import type { SVGProps } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { extractErrorMessage } from '@/api/http'
import { useAuthStore } from '../store/authStore'

function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

function PackageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6.75-3h4.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75Z" />
      <path d="M12 12v6m0-6a1.5 1.5 0 1 0-1.5-1.5" />
    </svg>
  )
}

function HotelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.75 21V4.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V8.25h6V6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21" />
      <path d="M3.75 13.5h18M2.25 21h19.5" />
    </svg>
  )
}

function PlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9.75 15 4-4m-4 4L9 21l2.25-3.75L15 15l6-6" />
      <path d="M4.5 9.75 9 14.25 3 21l6.75-6" />
      <path d="M14.25 3 12 8.25 5.25 15l8.25-2.25L21 9.75 14.25 3Z" />
    </svg>
  )
}

function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5" />
      <path d="M21 3h-5.25M21 3v5.25M21 3l-9.75 9.75" />
    </svg>
  )
}

const SERVICE_CATEGORIES = [
  { label: 'Paquetes', Icon: PackageIcon },
  { label: 'Hoteles', Icon: HotelIcon },
  { label: 'Vuelos', Icon: PlaneIcon },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

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
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel izquierdo: branding */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1b3a] p-10 text-white lg:flex">
        <div className="bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:26px_26px] absolute inset-0" />

        {/* Encabezado: logo */}
        <header className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 font-bold">
            NH
          </div>
          <div className="text-[13px] font-semibold tracking-wide uppercase">
            Nuevo Horizonte
            <span className="block text-[10px] font-normal uppercase tracking-widest opacity-70">
              Agencia Mayorista
            </span>
          </div>
        </header>

        {/* Centro: isotipo + título */}
        <section className="relative max-w-md">
          <span className="font-extrabold text-[120px] leading-none text-transparent bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 bg-clip-text">
            NH
          </span>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            Sistema de Gestión de Productos y Ventas
          </h1>
          <p className="mt-3 text-sm opacity-80">
            Gestiona productos, reservas y ventas de viajes.
          </p>
        </section>

        {/* Pie: categorías de servicio */}
        <footer className="relative flex gap-8">
          {SERVICE_CATEGORIES.map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-2 text-[13px] opacity-90">
              <Icon className="h-5 w-5" />
              {label}
            </div>
          ))}
        </footer>
      </aside>

      {/* Panel derecho: formulario */}
      <main className="flex items-center justify-center bg-white p-6">
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
              className="rounded-lg border-0 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-700"
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
              className="rounded-lg border-0 bg-gray-100 px-4 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>

          {/* Ubicación */}
          <div className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 p-3">
            <div className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div className="text-[13px] leading-snug text-gray-600">
                Universidad Tecnológica del Perú - Sede Ica
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[12px] text-blue-700">
              <a href="#detalle" className="font-medium hover:underline">
                Ver detalle
              </a>
              <span className="text-gray-300">|</span>
              <a href="#mapa" className="flex items-center gap-0.5 font-medium hover:underline">
                Mapa <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
          </div>

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
              <a href="#recuperar" className="font-medium text-blue-700 hover:underline">
                Recuperar acceso
              </a>
            </p>
            <p className="mt-3 text-[13px] text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-700 hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </footer>
        </form>
      </main>
    </div>
  )
}