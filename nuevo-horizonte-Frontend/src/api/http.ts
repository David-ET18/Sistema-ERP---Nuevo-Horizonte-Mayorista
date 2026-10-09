import axios from 'axios'

import { API_BASE_URL } from '@/config/env'

export const http = axios.create({
  baseURL: API_BASE_URL,
  // El token de sesion vive en una cookie httpOnly: el navegador la adjunta
  // solo, nunca pasa por este codigo. withCredentials hace que axios la
  // incluya en cada request (y reciba el Set-Cookie del login/logout).
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function leerCookie(nombre: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nombre}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Protege contra CSRF: el backend expone el token en la cookie legible
 * XSRF-TOKEN (ver SecurityConfig), y exige que las peticiones que modifican
 * datos lo repitan en este header ("doble envio"). Un sitio atacante puede
 * hacer que el navegador mande la cookie httpOnly de sesion sin querer, pero
 * no puede leer XSRF-TOKEN de nuestro dominio para copiarlo aqui.
 */
http.interceptors.request.use((config) => {
  const metodo = config.method?.toUpperCase()
  if (metodo && metodo !== 'GET' && metodo !== 'HEAD' && metodo !== 'OPTIONS') {
    const csrfToken = leerCookie('XSRF-TOKEN')
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken
    }
  }
  return config
})

/**
 * Un 403 con cuerpo vacio en una peticion que no sea GET es la firma de un
 * rechazo de CSRF (a diferencia de un 403 de permisos, que siempre trae un
 * mensaje de negocio). Puede pasar con el token recien emitido todavia si el
 * usuario llevaba varias pestañas abiertas o el primer request de la sesion
 * se solapo con la emision de la cookie. Se reintenta una sola vez, pidiendo
 * antes un token fresco con un GET liviano: es el patron recomendado para
 * CSRF por cookie en SPAs, no una tolerancia a fallos silenciosa.
 */
function pareceRechazoCsrf(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  const metodo = error.config?.method?.toUpperCase()
  return (
    error.response?.status === 403 &&
    metodo !== undefined &&
    metodo !== 'GET' &&
    !error.response.data
  )
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const config = error.config as (typeof error.config & { _reintentoCsrf?: boolean }) | undefined
    if (config && !config._reintentoCsrf && pareceRechazoCsrf(error)) {
      config._reintentoCsrf = true
      // Cualquier GET autenticado sirve: solo se usa para que el backend
      // reemita una cookie XSRF-TOKEN fresca antes de reintentar.
      await http.get('/modulos').catch(() => undefined)
      return http(config)
    }

    return Promise.reject(error)
  },
)

/**
 * Cuando un ResponseStatusException (p.ej. 409) queda envuelto por un 500 y el
 * backend serializa el mensaje crudo de la excepcion Java, este patron aisla
 * el texto legible que va entre comillas: `XException: 409 CONFLICT "texto"`.
 * Solo actua sobre ese formato especifico; cualquier otro mensaje se muestra tal cual.
 */
const PATRON_EXCEPCION_ENVUELTA = /^\w*Exception:\s*\d{3}\s+\w+\s*"(.+)"$/

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.length > 0) {
      const envuelto = message.match(PATRON_EXCEPCION_ENVUELTA)
      return envuelto ? envuelto[1] : message
    }
  }
  return 'Ha ocurrido un error inesperado'
}
