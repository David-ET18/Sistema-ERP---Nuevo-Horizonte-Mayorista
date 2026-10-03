import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { ReactElement, SVGProps } from 'react'

import BrandLogo from '@/components/BrandLogo'
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
  const rolPrincipal = roles[0]?.nombre ?? 'Sin rol'

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canReadModule(item.module)),
  })).filter((section) => section.items.length > 0)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function isActive(to: string) {
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  return (
    <div className="grid min-h-screen grid-cols-[264px_1fr] bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside
        className="sticky top-0 flex h-screen flex-col text-white"
        style={{ background: SIDEBAR_COLOR }}
        aria-label="Menú principal"
      >
        {/* Marca */}
        <div className="flex items-center justify-center border-b border-white/10 px-4 py-7">
          <BrandLogo height={48} />
        </div>

        {/* Navegación */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-3 pt-6">
          {visibleSections.map((section, index) => (
            <div key={section.label} className={index === 0 ? '' : 'mt-5'}>
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
                {section.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map(({ to, label, Icon }) => {
                  const active = isActive(to)
                  return (
                    <li key={to}>
                      <button
                        type="button"
                        onClick={() => navigate(to)}
                        aria-current={active ? 'page' : undefined}
                        className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                          active ? 'bg-white/[0.16] font-semibold' : 'font-normal hover:bg-white/10'
                        }`}
                      >
                        {active && (
                          <span className="absolute -left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sky-300" />
                        )}
                        <Icon
                          className={`h-[19px] w-[19px] shrink-0 transition-opacity ${
                            active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                          }`}
                        />
                        <span className="truncate">{label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Perfil */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.08] p-2.5">
            <div className="relative shrink-0">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white ring-2 ring-white/25"
                style={{ backgroundColor: colorPrimario }}
              >
                {initials(user?.username ?? '')}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#143b72] bg-sky-300" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-semibold text-white">{firstName}</p>
              <p className="truncate text-[11px] text-white/70">
                {rolPrincipal}
                {roles.length > 1 ? ` +${roles.length - 1}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogoutIcon className="h-[18px] w-[18px]" />
            </button>
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