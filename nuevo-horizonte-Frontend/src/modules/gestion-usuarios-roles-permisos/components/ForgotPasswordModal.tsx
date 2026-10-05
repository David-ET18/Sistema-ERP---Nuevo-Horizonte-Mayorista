import { useState } from 'react'
import type { FormEvent } from 'react'

import { extractErrorMessage } from '@/api/http'
import { forgotPassword } from '../services/authService'

interface ForgotPasswordModalProps {
  onClose: () => void
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-10"
    >
      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un email valido')
      return
    }

    setLoading(true)
    try {
      await forgotPassword({ email: email.trim() })
      setSubmitted(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="grid w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Columna izquierda: ilustración */}
        <div className="relative hidden flex-col items-center justify-center gap-5 bg-[#0b1b3a] p-8 text-center text-white md:flex">
          <div className="bg-[radial-gradient(circle,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:22px_22px] absolute inset-0" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600">
            <LockIcon />
          </div>
          <h3 className="relative text-xl font-bold">Recuperar contraseña</h3>
          <p className="relative max-w-[220px] text-[13px] opacity-80">
            Te enviaremos un enlace de recuperación a tu correo institucional.
          </p>
        </div>

        {/* Columna derecha: contenido */}
        <div className="relative p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <XIcon />
          </button>

          {submitted ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center">
              <svg viewBox="0 0 52 52" className="success-pop h-20 w-20">
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
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Solicitud recibida
                </h3>
                <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-gray-500">
                  Si el correo existe en el sistema, se ha enviado un enlace de
                  recuperación. Revisa tu bandeja de entrada.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 cursor-pointer rounded-lg bg-[#0b1b3a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#12305f]"
              >
                Entendido
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Recuperar acceso
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ingresa tu correo institucional
                </p>
              </div>

              <label className="flex flex-col gap-1.5 text-[13px] font-medium text-gray-700">
                <span>Correo institucional</span>
                <input
                  type="email"
                  className="rounded-lg border-0 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="nombre@nuevohorizonte.pe"
                  required
                />
              </label>

              {error && <p className="text-[13px] text-red-700">{error}</p>}

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-[#0b1b3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#12305f] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}