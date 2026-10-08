export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    recuperarPassword: '/auth/recuperar-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    cambiarPassword: '/auth/cambiar-password',
  },
  usuarios: {
    base: '/usuarios',
    byId: (id: number) => `/usuarios/${id}`,
  },
  roles: {
    base: '/roles',
    byId: (id: number) => `/roles/${id}`,
  },
  modulos: {
    base: '/modulos',
  },
} as const
