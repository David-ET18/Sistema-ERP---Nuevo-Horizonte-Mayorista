import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LoginRequest, RegisterRequest, Usuario } from '../types'
import {
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'
import { clearSessionStorage, setToken } from '@/utils/storage'

interface AuthState {
  token: string | null
  user: Usuario | null
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (payload) => {
        const response = await loginRequest(payload)
        setToken(response.token)
        set({ token: response.token, user: response.usuario })
      },
      register: async (payload) => {
        const response = await registerRequest(payload)
        setToken(response.token)
        set({ token: response.token, user: response.usuario })
      },
      logout: () => {
        clearSessionStorage()
        set({ token: null, user: null })
      },
    }),
    { name: 'nh-auth' },
  ),
)