import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { etiquetaDeModulo } from '@/config/modulos'
import { primeraRutaAccesible } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'

interface ForbiddenPageProps {
  modulo?: string
}

/** Segundos que se muestra el aviso antes de devolver al usuario a su inicio. */
const SEGUNDOS_REDIRECT = 3

/**
 * Pantalla mostrada cuando el usuario intenta abrir una ruta para la que su rol
 * no tiene permiso de lectura.
 *
 * Redirige sola a `primeraRutaAccesible()` para no dejar al usuario en una URL
 * prohibida; el boton permite adelantar ese redireccion.
 */
export default function ForbiddenPage({ modulo }: ForbiddenPageProps) {
  const navigate = useNavigate()
  const [restante, setRestante] = useState(SEGUNDOS_REDIRECT)
  const nombre = modulo ? etiquetaDeModulo(modulo) : null
  const destino = primeraRutaAccesible()

  useEffect(() => {
    if (restante <= 0) {
      navigate(destino, { replace: true })
      return
    }
    const timer = setTimeout(() => setRestante((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [restante, destino, navigate])

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-5xl font-bold text-red-100">403</p>
        <h2 className="mt-3 text-lg font-semibold text-gray-900">Acceso restringido</h2>
        <p className="mt-2 text-sm text-gray-600">
          {nombre
            ? `Tu rol no tiene permiso para ver ${nombre}.`
            : 'Tu rol no tiene permiso para ver esta sección.'}
          {' '}Si crees que es un error, solicítalo al administrador del sistema.
        </p>
        <p aria-live="polite" className="mt-4 text-sm text-gray-500">
          {restante > 0 ? (
            <>
              Redirigiendo a tu inicio en{' '}
              <span className="font-semibold text-gray-900">{restante}s</span>…
            </>
          ) : (
            'Redirigiendo…'
          )}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(destino, { replace: true })}
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Ir a mi inicio ahora
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Volver atrás
          </button>
        </div>
      </div>
    </section>
  )
}