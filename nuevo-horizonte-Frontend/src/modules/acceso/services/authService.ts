import { http } from '@/api/http'
import { ENDPOINTS } from '@/api/endpoints'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types'

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