import { create } from 'zustand'

import type { LoginRequest, Usuario } from '../types'
import {
  login as loginRequest,
  logout as logoutRequest,
  obtenerPerfil,
} from '../services/authService'

interface AuthState {
  user: Usuario | null
  /**
   * true mientras se intenta recuperar la sesion al cargar la app. No hay
   * token ni usuario guardados en el navegador (ver cargarSesion): la unica
   * fuente de verdad es la cookie httpOnly, que este codigo no puede leer,
   * asi que hay que preguntarle al backend.
   */
  cargandoSesion: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  cargarSesion: () => Promise<void>
}

/**
 * Numero de la operacion de auth mas reciente (login/logout/cargarSesion).
 * Si una llamada vieja responde despues de una mas nueva (p.ej. un GET
 * /auth/me que tardo mas que el login posterior), su `catch`/`then` no debe
 * pisar el estado que la nueva ya puso. Cada funcion reserva un numero antes
 * de su `await` y solo aplica `set(...)` si sigue siendo la mas reciente.
 */
let operacionActual = 0

/**
 * `App` llama a `cargarSesion()` una sola vez al montar, pero en desarrollo
 * React 18 StrictMode invoca los efectos dos veces a proposito (monta,
 * limpia, vuelve a montar) para detectar efectos impuros. Sin este resguardo
 * eso dispara dos GET /auth/me reales en paralelo; `operacionActual` ya
 * ignora la respuesta de la primera, pero mas simple y a prueba de futuros
 * cambios es que la segunda invocacion ni siquiera dispare el request.
 */
let sesionInicialSolicitada = false

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  cargandoSesion: true,
  login: async (payload) => {
    const miOperacion = ++operacionActual
    const usuario = await loginRequest(payload)
    if (miOperacion !== operacionActual) return
    set({ user: usuario, cargandoSesion: false })
  },
  logout: async () => {
    operacionActual++
    set({ user: null })
    try {
      await logoutRequest()
    } catch {
      // Ya quedamos deslogueados del lado del cliente aunque la llamada falle.
    }
  },
  cargarSesion: async () => {
    if (sesionInicialSolicitada) return
    sesionInicialSolicitada = true

    const miOperacion = ++operacionActual
    try {
      const usuario = await obtenerPerfil()
      if (miOperacion !== operacionActual) return
      set({ user: usuario, cargandoSesion: false })
    } catch {
      if (miOperacion !== operacionActual) return
      set({ user: null, cargandoSesion: false })
    }
  },
}))
