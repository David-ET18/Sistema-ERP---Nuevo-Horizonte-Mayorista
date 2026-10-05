import axios from 'axios'

import { API_BASE_URL } from '@/config/env'
import { getToken, clearSessionStorage } from '@/utils/storage'
import { useAuthStore } from '@/modules/gestion-usuarios-roles-permisos/store/authStore'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token ?? getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSessionStorage()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
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