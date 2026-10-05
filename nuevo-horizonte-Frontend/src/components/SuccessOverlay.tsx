import { useEffect, useState } from 'react'

interface SuccessOverlayProps {
  title: string
  subtitle?: string
  onFinish: () => void
}

/** Pantalla completa de éxito con efecto de carga y animación de check. */
export default function SuccessOverlay({ title, subtitle, onFinish }: SuccessOverlayProps) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    const loadTimer = setTimeout(() => setPhase('done'), 1100)
    const finishTimer = setTimeout(onFinish, 2800)
    return () => {
      clearTimeout(loadTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
      {/* Fondo decorativo */}
      <div className="bg-[radial-gradient(circle,rgba(11,27,58,0.06)_1px,transparent_1px)] bg-[size:30px_30px] absolute inset-0" />

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        {phase === 'loading' ? (
          <>
            <div className="success-pop flex h-28 w-28 items-center justify-center rounded-full bg-gray-100">
              <span className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0b1b3a]">
                Procesando...
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Verificando tus credenciales
              </p>
            </div>
          </>
        ) : (
          <>
            <svg viewBox="0 0 52 52" className="success-pop h-28 w-28">
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
              <h1 className="text-3xl font-bold text-[#0b1b3a]">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 text-[13px] text-gray-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          Redirigiendo al panel...
        </div>
      </div>
    </div>
  )
}