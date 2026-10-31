import type { Promocion } from '../types'
import { promocionImagenUrl } from '../services/promocionService'
import { formatDate } from '@/utils/format'
import ModalMarca from '@/components/ModalMarca'
import { IconCalendar, IconStar, IconX } from '@/components/icons'

const ESTADO_ESTILOS: Record<string, string> = {
  VIGENTE: 'bg-emerald-100 text-emerald-700',
  PROGRAMADA: 'bg-amber-100 text-amber-700',
  VENCIDA: 'bg-gray-100 text-gray-500',
  INACTIVA: 'bg-red-100 text-red-700',
}

const ESTADO_LABEL: Record<string, string> = {
  VIGENTE: 'Vigente',
  PROGRAMADA: 'Programada',
  VENCIDA: 'Vencida',
  INACTIVA: 'Inactiva',
}

function formatFechaCorta(fecha: string): string {
  if (!fecha) return '-'
  const date = new Date(`${fecha}T00:00:00`)
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PromocionDetalleModal({
  promocion,
  onClose,
}: {
  promocion: Promocion
  onClose: () => void
}) {
  const imagen = promocionImagenUrl(promocion.imagenUrl)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        className="animate-modal-pop flex max-h-[90vh] w-[620px] max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalMarca />
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{promocion.titulo}</h3>
            <p className="text-xs text-gray-400">Detalle de la promoción</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="relative overflow-hidden rounded-xl bg-gray-100">
            {imagen ? (
              <img src={imagen} alt={promocion.titulo} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand to-brand-dark text-white/80">
                <IconStar className="h-8 w-8" />
                <span className="text-sm">Sin imagen cargada</span>
              </div>
            )}
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_ESTILOS[promocion.estado]}`}>
                {ESTADO_LABEL[promocion.estado] ?? promocion.estado}
              </span>
              {promocion.destacada && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <IconStar className="h-3.5 w-3.5" /> Destacada
                </span>
              )}
            </div>
            <div className="absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-1.5 text-right shadow-sm">
              <p className="text-xl font-bold leading-none text-brand">{Number(promocion.descuento)}%</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">descuento</p>
            </div>
          </div>

          {promocion.descripcion && (
            <p className="text-sm leading-relaxed text-gray-600">{promocion.descripcion}</p>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <Dato etiqueta="Servicio / producto" valor={promocion.servicioNombre ?? 'General'} />
            <Dato etiqueta="Categoría" valor={promocion.servicioCategoria ?? '-'} />
            <Dato
              etiqueta="Vigencia"
              valor={`${formatFechaCorta(promocion.fechaInicio)} → ${formatFechaCorta(promocion.fechaFin)}`}
              icono={<IconCalendar className="h-4 w-4" />}
            />
            <Dato etiqueta="Última actualización" valor={formatDate(promocion.fechaActualizacion)} />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function Dato({ etiqueta, valor, icono }: { etiqueta: string; valor: string; icono?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      {icono && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-black/5">
          {icono}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">{etiqueta}</span>
        <span className="break-words font-medium text-gray-800">{valor}</span>
      </div>
    </div>
  )
}
