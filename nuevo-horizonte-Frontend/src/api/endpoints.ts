export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
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