import { useEffect, useState } from 'react'

import DetalleModal from '@/components/DetalleModal'
import { IconAlertTriangle, IconCalendar, IconCheckCircle, IconSend, IconUsers } from '@/components/icons'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import type { MarketingPublicacion } from '../types'
import { detallePublicacion, urlImagenPublicacion } from '../services/marketingService'

interface Props {
  id: number
  onClose: () => void
}

const CANAL_LABEL: Record<string, string> = {
  TELEGRAM: 'Telegram',
}

const ESTADO_LABEL: Record<string, string> = {
  PUBLICADO: 'Publicado',
  ERROR: 'Con error',
}

export default function MarketingPublicacionDetalleModal({ id, onClose }: Props) {
  const [publicacion, setPublicacion] = useState<MarketingPublicacion | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detallePublicacion(id)
      .then(setPublicacion)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [id])

  const filas = publicacion
    ? [
        {
          etiqueta: 'Canal',
          valor: CANAL_LABEL[publicacion.canal] ?? publicacion.canal,
          icono: <IconSend className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Estado',
          valor: ESTADO_LABEL[publicacion.estado] ?? publicacion.estado,
          icono: <IconCheckCircle className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Responsable',
          valor: publicacion.responsableNombre ?? 'Automático',
          icono: <IconUsers className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Fecha de publicación',
          valor: formatDate(publicacion.fechaPublicacion),
          icono: <IconCalendar className="h-3.5 w-3.5" />,
        },
      ]
    : []

  return (
    <DetalleModal
      titulo="Publicación de difusión"
      subtitulo={publicacion ? CANAL_LABEL[publicacion.canal] ?? publicacion.canal : undefined}
      filas={filas}
      onClose={onClose}
    >
      {error && <p className="text-[13px] text-red-700">{error}</p>}
      {!publicacion && !error && <p className="text-sm text-gray-500">Cargando publicación...</p>}

      {publicacion?.estado === 'ERROR' && publicacion.mensajeError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{publicacion.mensajeError}</span>
        </div>
      )}

      {publicacion?.tieneImagen && (
        <img
          src={urlImagenPublicacion(publicacion.id)}
          alt="Imagen publicada"
          className="max-h-72 w-full rounded-xl border border-gray-100 object-cover"
        />
      )}

      {publicacion?.textoPublicado && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Texto publicado (generado por IA)</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {publicacion.textoPublicado}
          </p>
        </div>
      )}

      {publicacion?.textoOriginal && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Descripción original</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {publicacion.textoOriginal}
          </p>
        </div>
      )}
    </DetalleModal>
  )
}
