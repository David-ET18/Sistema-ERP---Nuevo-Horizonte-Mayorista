export const ENDPOINTS = {
  notificaciones: {
    base: '/notificaciones',
    noLeidas: '/notificaciones/no-leidas',
    leidas: '/notificaciones/leidas',
    leidasTodas: '/notificaciones/leidas-todas',
    porId: (id: number) => `/notificaciones/${id}`,
    leida: (id: number) => `/notificaciones/${id}/leida`,
  },
} as const
