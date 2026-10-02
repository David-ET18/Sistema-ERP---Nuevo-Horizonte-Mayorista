import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import ProtectedRoute from './ProtectedRoute'

import LoginPage from '@/modules/gestion-usuarios-roles-permisos/pages/LoginPage'
import RegisterPage from '@/modules/gestion-usuarios-roles-permisos/pages/RegisterPage'
import ResetPasswordPage from '@/modules/gestion-usuarios-roles-permisos/pages/ResetPasswordPage'
import DashboardPage from '@/modules/gestion-usuarios-roles-permisos/pages/DashboardPage'
import UsuariosPage from '@/modules/gestion-usuarios-roles-permisos/pages/UsuariosPage'
import RolesPage from '@/modules/gestion-usuarios-roles-permisos/pages/RolesPage'

import ProveedoresPage from '@/modules/proveedores/pages/ProveedoresPage'
import TarifasPage from '@/modules/tarifas/pages/TarifasPage'
import PaquetesPage from '@/modules/paquetes/pages/PaquetesPage'
import PaqueteFormPage from '@/modules/paquetes/pages/PaqueteFormPage'
import PromocionesPage from '@/modules/promociones/pages/PromocionesPage'
import CotizacionesPage from '@/modules/cotizaciones/pages/CotizacionesPage'
import VentasPage from '@/modules/ventas/pages/VentasPage'
import ReservasPage from '@/modules/reservas/pages/ReservasPage'
import PagosPage from '@/modules/pagos/pages/PagosPage'
import GestionAgenciasPage from '@/modules/gestion-agencias/pages/GestionAgenciasPage'
import AgenciaFichaPage from '@/modules/gestion-agencias/pages/AgenciaFichaPage'
import SeguimientoComercialPage from '@/modules/seguimiento-comercial/pages/SeguimientoComercialPage'
import MarketingPage from '@/modules/marketing/pages/MarketingPage'
import ReportesPage from '@/modules/reportes/pages/ReportesPage'
import DocumentosPage from '@/modules/documentos/pages/DocumentosPage'
import NotificacionesPage from '@/modules/notificaciones/pages/NotificacionesPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="tarifas" element={<TarifasPage />} />
        <Route path="paquetes" element={<PaquetesPage />} />
        <Route path="paquetes/nuevo" element={<PaqueteFormPage />} />
        <Route path="paquetes/:id/editar" element={<PaqueteFormPage />} />
        <Route path="promociones" element={<PromocionesPage />} />
        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="ventas" element={<VentasPage />} />
        <Route path="reservas" element={<ReservasPage />} />
        <Route path="pagos" element={<PagosPage />} />
        <Route path="gestion-agencias" element={<GestionAgenciasPage />} />
        <Route path="gestion-agencias/panel" element={<AgenciaFichaPage />} />
        <Route path="seguimiento-comercial" element={<SeguimientoComercialPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
        <Route path="notificaciones" element={<NotificacionesPage />} />
        <Route
          path="gestion-usuarios-roles-permisos/usuarios"
          element={<UsuariosPage />}
        />
        <Route
          path="gestion-usuarios-roles-permisos/roles"
          element={<RolesPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}