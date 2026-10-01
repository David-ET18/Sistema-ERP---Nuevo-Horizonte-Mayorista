import { http } from '@/api/http'
import { ENDPOINTS } from './endpoints'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(ENDPOINTS.auth.login, payload)
  return data
}

export async function register(
  payload: RegisterRequest,
): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(
    ENDPOINTS.auth.register,
    payload,
  )
  return data
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