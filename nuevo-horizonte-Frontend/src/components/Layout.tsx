import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { ReactElement, SVGProps } from 'react'

import { useAuthStore } from '@/modules/gestion-usuarios-roles-permisos/store/authStore'
import {
  DEFAULT_ROLE_COLOR,
  getRoleColor,
} from '@/modules/gestion-usuarios-roles-permisos/utils/roleColor'
import { canReadModule } from '@/modules/gestion-usuarios-roles-permisos/utils/permissions'
import { BellIcon, ChevronDownIcon, LogoutIcon, SearchIcon } from '@/components/icons'
import {
  NavAgenciasIcon,
  NavCatalogoIcon,
  NavCotizacionesIcon,
  NavDocumentosIcon,
  NavMarketingIcon,
  NavNotificacionesIcon,
  NavPagosIcon,
  NavPanelIcon,
  NavPaquetesIcon,
  NavPromocionesIcon,
  NavProveedoresIcon,
  NavReportesIcon,
  NavReservasIcon,
  NavRolesIcon,
  NavSeguimientoIcon,
  NavTarifasIcon,
  NavUsuariosIcon,
  NavVentasIcon,
} from '@/components/navIcons'

interface NavItem {
  to: string
  label: string
  module: string
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Principal',
    items: [{ to: '/dashboard', label: 'Panel', module: 'reportes', Icon: NavPanelIcon }],
  },
  {
    label: 'Producto',
    items: [
      { to: '/catalogo', label: 'Catálogo Base', module: 'catalogo', Icon: NavCatalogoIcon },
      { to: '/proveedores', label: 'Proveedores', module: 'proveedores', Icon: NavProveedoresIcon },
      { to: '/tarifas', label: 'Tarifas', module: 'tarifas', Icon: NavTarifasIcon },
      { to: '/paquetes', label: 'Paquetes Turísticos', module: 'paquetes', Icon: NavPaquetesIcon },
      { to: '/promociones', label: 'Promociones', module: 'promociones', Icon: NavPromocionesIcon },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { to: '/cotizaciones', label: 'Cotizaciones', module: 'cotizaciones', Icon: NavCotizacionesIcon },
      { to: '/ventas', label: 'Gestión de Ventas', module: 'ventas', Icon: NavVentasIcon },
      { to: '/reservas', label: 'Reservas', module: 'reservas', Icon: NavReservasIcon },
      { to: '/pagos', label: 'Pagos', module: 'pagos', Icon: NavPagosIcon },
      { to: '/gestion-agencias', label: 'Gestión de Agencias', module: 'gestion-agencias', Icon: NavAgenciasIcon },
      { to: '/seguimiento-comercial', label: 'Seguimiento Comercial', module: 'seguimiento-comercial', Icon: NavSeguimientoIcon },
      { to: '/marketing', label: 'Difusión y Marketing', module: 'marketing', Icon: NavMarketingIcon },
    ],
  },
  {
    label: 'General',
    items: [
      { to: '/reportes', label: 'Dashboard y Reportes', module: 'reportes', Icon: NavReportesIcon },
      { to: '/documentos', label: 'Documentos', module: 'documentos', Icon: NavDocumentosIcon },
      { to: '/notificaciones', label: 'Notificaciones', module: 'notificaciones', Icon: NavNotificacionesIcon },
    ],
  },
  {
    label: 'Gestión',
    items: [
      {
        to: '/gestion-usuarios-roles-permisos/usuarios',
        label: 'Usuarios',
        module: 'gestion-usuarios-roles-permisos',
        Icon: NavUsuariosIcon,
      },
      {
        to: '/gestion-usuarios-roles-permisos/roles',
        label: 'Roles y Permisos',
        module: 'gestion-usuarios-roles-permisos',
        Icon: NavRolesIcon,
      },
    ],
  },
]

/** Azul corporativo del menu lateral (mismo tono que nh-core). */
const SIDEBAR_COLOR = '#143b72'

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const roles = user?.roles ?? []
  const firstName = user?.username ?? 'Usuario'
  const colorPrimario = roles.length > 0 ? getRoleColor(roles[0]) : DEFAULT_ROLE_COLOR
  const colorSidenav = SIDEBAR_COLOR

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canReadModule(item.module)),
  })).filter((section) => section.items.length > 0)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function isActive(to: string) {
    return location.pathname === to
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside
        className="sticky top-0 flex h-screen flex-col text-white"
        style={{ background: colorSidenav }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #2f6fd1, #1b4a98)',
            }}
          >
            NH
          </div>
          <div className="text-[13px] font-semibold uppercase leading-tight">
            Nuevo Horizonte
            <span className="block text-[10px] font-normal uppercase tracking-widest opacity-70">
              Agencia Mayorista
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          {visibleSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-3 text-[11px] uppercase tracking-widest opacity-60">
                {section.label}
              </p>
              {section.items.map(({ to, label, Icon }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className={`relative mb-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive(to)
                      ? 'bg-white/15 font-semibold text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isActive(to) && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-sky-300" />
                  )}
                  <Icon className={`h-5 w-5 shrink-0 ${isActive(to) ? 'text-sky-200' : 'text-white/70'}`} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Perfil */}
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: colorPrimario }}
            >
              {initials(user?.username ?? '')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{firstName}</p>
              <div className="mt-1 flex max-w-full flex-wrap gap-2">
                {roles.length === 0 ? (
                  <span className="text-[11px] text-white/60">Sin rol</span>
                ) : (
                  roles.map((rol) => (
                    <span
                      key={rol.id}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-white/80"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getRoleColor(rol) }}
                      />
                      {rol.nombre}
                    </span>
                  ))
                )}
              </div>
            </div>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
            </span>
          </div>
        </div>
      </aside>

      {/* ===== Zona principal ===== */}
      <div className="min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-8 py-4">
          <h1 className="text-lg font-semibold text-gray-800">
            Hola, {firstName}
          </h1>

          <div className="flex items-center gap-4">
            {/* Búsqueda */}
            <label className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
              <SearchIcon className="h-4 w-4 text-gray-400" />
              <input
                className="w-48 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                placeholder="Buscar..."
              />
            </label>

            {/* Notificaciones */}
            <button
              type="button"
              className="relative cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Notificaciones"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Menú de usuario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ backgroundColor: colorPrimario }}
                >
                  {initials(user?.username ?? '')}
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.username}
                      </p>
                      <p className="truncate text-[12px] text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                    <hr className="my-1 border-gray-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogoutIcon className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}