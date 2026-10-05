import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LoginRequest, RegisterRequest, Usuario } from '../types'
import {
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'

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
        set({ token: response.token, user: response.usuario })
      },
      register: async (payload) => {
        const response = await registerRequest(payload)
        set({ token: response.token, user: response.usuario })
      },
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'nh-auth' },
  ),
)