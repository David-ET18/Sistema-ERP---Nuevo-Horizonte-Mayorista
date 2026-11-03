export const ENDPOINTS = {
  notificaciones: {
    base: '/notificaciones',
    paginado: '/notificaciones/paginado',
    noLeidas: '/notificaciones/no-leidas',
    kpis: '/notificaciones/kpis',
    leidas: '/notificaciones/leidas',
    marcarTodas: '/notificaciones/marcar-todas',
    byId: (id: number) => `/notificaciones/${id}`,
    marcarUna: (id: number) => `/notificaciones/${id}/leida`,
  },
} as const
