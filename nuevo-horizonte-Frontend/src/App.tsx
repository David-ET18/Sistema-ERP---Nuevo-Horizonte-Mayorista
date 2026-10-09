import { useEffect } from 'react'

import AppRoutes from '@/routes/AppRoutes'
import Toast from '@/components/Toast'
import { useAuthStore } from '@/modules/gestion-usuarios-roles-permisos/store/authStore'

function App() {
  const cargarSesion = useAuthStore((state) => state.cargarSesion)

  // Unica forma de saber si hay sesion: la cookie httpOnly no se puede leer
  // desde aqui, asi que se le pregunta al backend una vez al cargar la app.
  useEffect(() => {
    cargarSesion()
  }, [cargarSesion])

  return (
    <>
      <AppRoutes />
      <Toast />
    </>
  )
}

export default App