import { http } from '@/api/http'
import { ENDPOINTS } from './endpoints'
import type {
  CambiarPasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  PerfilUpdateRequest,
  ResetPasswordRequest,
  Usuario,
} from '../types'

/**
 * El backend ya no devuelve el token en el cuerpo: lo entrega como cookie
 * httpOnly (Set-Cookie), invisible para este codigo. Por eso la respuesta es
 * directamente el usuario, no un { token, usuario }.
 */
export async function login(payload: LoginRequest): Promise<Usuario> {
  const { data } = await http.post<Usuario>(ENDPOINTS.auth.login, payload)
  return data
}

/** Pide al backend que borre la cookie de sesion. */
export async function logout(): Promise<void> {
  await http.post(ENDPOINTS.auth.logout)
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>(
    ENDPOINTS.auth.recuperarPassword,
    payload,
  )
  return data
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>(
    ENDPOINTS.auth.resetPassword,
    payload,
  )
  return data
}

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await http.get<Usuario>(ENDPOINTS.auth.me)
  return data
}

export async function actualizarPerfil(
  payload: PerfilUpdateRequest,
): Promise<Usuario> {
  const { data } = await http.put<Usuario>(ENDPOINTS.auth.me, payload)
  return data
}

export async function cambiarPassword(
  payload: CambiarPasswordRequest,
): Promise<MessageResponse> {
  const { data } = await http.post<MessageResponse>(
    ENDPOINTS.auth.cambiarPassword,
    payload,
  )
  return data
}