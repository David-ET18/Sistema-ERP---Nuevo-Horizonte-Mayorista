import { create } from 'zustand'
import { contarNoLeidas } from '@/modules/notificaciones/services/notificacionService'

interface NotificacionesState {
  noLeidas: number
  setNoLeidas: (cantidad: number) => void
  refrescar: () => Promise<void>
}

export const useNotificacionesStore = create<NotificacionesState>()((set) => ({
  noLeidas: 0,
  setNoLeidas: (cantidad) => set({ noLeidas: cantidad }),
  refrescar: async () => {
    try {
      set({ noLeidas: await contarNoLeidas() })
    } catch {
      set({ noLeidas: 0 })
    }
  },
}))