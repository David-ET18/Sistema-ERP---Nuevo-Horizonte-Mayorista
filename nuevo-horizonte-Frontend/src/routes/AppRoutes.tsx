import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import ProtectedRoute, { PermisoRequerido } from './ProtectedRoute'
import { CLAVES_MODULOS_DESARROLLADOS } from '@/config/modulos'
import { primeraRutaAccesible } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'

/** Envoltura de permisos por clave de modulo (ver src/config/modulos.ts). */
function ConPermiso({ modulo, children }: { modulo: string; children: ReactNode }) {
  if (!CLAVES_MODULOS_DESARROLLADOS.includes(modulo)) return <SinDesarrollar />
  return <PermisoRequerido modulo={modulo}>{children}</PermisoRequerido>
}

function SinDesarrollar() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl bg-white px-8 py-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Módulo en construcción</h2>
        <p className="mt-2 text-sm text-gray-600">
          Las funcionalidades de este módulo se implementarán próximamente.
        </p>
      </div>
    </section>
  )
}

import LoginPage from '@/modules/gestion-usuarios-roles-permisos/pages/LoginPage'
import ResetPasswordPage from '@/modules/gestion-usuarios-roles-permisos/pages/ResetPasswordPage'
import DashboardPage from '@/modules/gestion-usuarios-roles-permisos/pages/DashboardPage'
import UsuariosPage from '@/modules/gestion-usuarios-roles-permisos/pages/UsuariosPage'
import RolesPage from '@/modules/gestion-usuarios-roles-permisos/pages/RolesPage'
import { PerfilPage } from '@/modules/gestion-usuarios-roles-permisos/pages/PerfilPage'

import CatalogoPage from '@/modules/catalogo/pages/CatalogoPage'
import ProveedoresPage from '@/modules/proveedores/pages/ProveedoresPage'
import TarifasPage from '@/modules/tarifas/pages/TarifasPage'
import PaquetesPage from '@/modules/paquetes/pages/PaquetesPage'
import PaqueteFormPage from '@/modules/paquetes/pages/PaqueteFormPage'
import CotizacionesPage from '@/modules/cotizaciones/pages/CotizacionesPage'
import VentasPage from '@/modules/ventas/pages/VentasPage'
import GestionAgenciasPage from '@/modules/gestion-agencias/pages/GestionAgenciasPage'
import AgenciaFichaPage from '@/modules/gestion-agencias/pages/AgenciaFichaPage'
import ReportesPage from '@/modules/reportes/pages/ReportesPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* La raiz entra a la primera pantalla que el usuario puede ver. */}
        <Route index element={<Navigate to={primeraRutaAccesible()} replace />} />
        <Route
          path="dashboard"
          element={
            <ConPermiso modulo="reportes">
              <DashboardPage />
            </ConPermiso>
          }
        />
        <Route
          path="catalogo"
          element={
            <ConPermiso modulo="catalogo">
              <CatalogoPage />
            </ConPermiso>
          }
        />
        <Route
          path="proveedores"
          element={
            <ConPermiso modulo="proveedores">
              <ProveedoresPage />
            </ConPermiso>
          }
        />
        <Route
          path="tarifas"
          element={
            <ConPermiso modulo="tarifas">
              <TarifasPage />
            </ConPermiso>
          }
        />
        <Route
          path="paquetes"
          element={
            <ConPermiso modulo="paquetes">
              <PaquetesPage />
            </ConPermiso>
          }
        />
        <Route
          path="paquetes/nuevo"
          element={
            <ConPermiso modulo="paquetes">
              <PaqueteFormPage />
            </ConPermiso>
          }
        />
        <Route
          path="paquetes/:id/editar"
          element={
            <ConPermiso modulo="paquetes">
              <PaqueteFormPage />
            </ConPermiso>
          }
        />
        <Route path="promociones" element={<SinDesarrollar />} />
        <Route
          path="cotizaciones"
          element={
            <ConPermiso modulo="cotizaciones">
              <CotizacionesPage />
            </ConPermiso>
          }
        />
        <Route
          path="ventas"
          element={
            <ConPermiso modulo="ventas">
              <VentasPage />
            </ConPermiso>
          }
        />
        <Route path="reservas" element={<SinDesarrollar />} />
        <Route path="pagos" element={<SinDesarrollar />} />
        <Route
          path="gestion-agencias"
          element={
            <ConPermiso modulo="gestion-agencias">
              <GestionAgenciasPage />
            </ConPermiso>
          }
        />
        <Route
          path="gestion-agencias/panel"
          element={
            <ConPermiso modulo="gestion-agencias">
              <AgenciaFichaPage />
            </ConPermiso>
          }
        />
        <Route path="seguimiento-comercial" element={<SinDesarrollar />} />
        <Route path="marketing" element={<SinDesarrollar />} />
        <Route
          path="reportes"
          element={
            <ConPermiso modulo="reportes">
              <ReportesPage />
            </ConPermiso>
          }
        />
        <Route path="documentos" element={<SinDesarrollar />} />
        <Route path="notificaciones" element={<SinDesarrollar />} />
        <Route
          path="gestion-usuarios-roles-permisos/usuarios"
          element={
            <ConPermiso modulo="gestion-usuarios-roles-permisos">
              <UsuariosPage />
            </ConPermiso>
          }
        />
        <Route
          path="gestion-usuarios-roles-permisos/roles"
          element={
            <ConPermiso modulo="gestion-usuarios-roles-permisos">
              <RolesPage />
            </ConPermiso>
          }
        />
        <Route
          path="gestion-usuarios-roles-permisos/perfil"
          element={
            <PermisoRequerido>
              <PerfilPage />
            </PermisoRequerido>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
