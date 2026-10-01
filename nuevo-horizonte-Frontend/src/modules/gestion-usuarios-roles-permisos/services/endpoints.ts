export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    recuperarPassword: '/auth/recuperar-password',
    resetPassword: '/auth/reset-password',
  },
  usuarios: {
    base: '/usuarios',
    byId: (id: number) => `/usuarios/${id}`,
  },
  roles: {
    base: '/roles',
    byId: (id: number) => `/roles/${id}`,
  },
} as const
