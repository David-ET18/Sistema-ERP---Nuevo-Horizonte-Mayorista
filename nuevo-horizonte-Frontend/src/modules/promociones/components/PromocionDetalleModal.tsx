import { useEffect, useState } from 'react'

import DetalleModal from '@/components/DetalleModal'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconInfo,
  IconMoney,
  IconStar,
} from '@/components/icons'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import type { Promocion } from '../types'
import { detallePromocion, urlImagenPromocion } from '../services/promocionesService'

interface Props {
  id: number
  onClose: () => void
}

const ESTADO_LABEL: Record<string, string> = {
  VIGENTE: 'Vigente',
  PROGRAMADA: 'Programada',
  VENCIDA: 'Vencida',
  INACTIVA: 'Inactiva',
}

function fechaCorta(valor: string | null): string {
  if (!valor) return 'Sin límite'
  const [anio, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${anio}`
}

function precio(valor: number | null): string {
  return valor != null ? valor.toFixed(2) : '-'
}

export default function PromocionDetalleModal({ id, onClose }: Props) {
  const [promocion, setPromocion] = useState<Promocion | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detallePromocion(id)
      .then(setPromocion)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [id])

  const filas = promocion
    ? [
        {
          etiqueta: 'Servicio',
          valor: promocion.servicioNombre ?? 'Promoción general',
          icono: <IconInfo className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Descuento',
          valor: `-${promocion.descuentoPorcentaje}%`,
          icono: <IconStar className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Precio original',
          valor: precio(promocion.precioOriginal),
          icono: <IconMoney className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Precio promocional',
          valor: precio(promocion.precioPromocional),
          icono: <IconMoney className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Vigencia',
          valor: `${fechaCorta(promocion.fechaInicio)} → ${fechaCorta(promocion.fechaFin)}`,
          icono: <IconCalendar className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Estado',
          valor: ESTADO_LABEL[promocion.estadoVigencia] ?? promocion.estadoVigencia,
          icono: <IconCheckCircle className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Destacada',
          valor: promocion.destacada ? 'Sí' : 'No',
          icono: <IconStar className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Creada',
          valor: formatDate(promocion.fechaCreacion),
          icono: <IconClock className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Última actualización',
          valor: formatDate(promocion.fechaActualizacion),
          icono: <IconClock className="h-3.5 w-3.5" />,
        },
      ]
    : []

  return (
    <DetalleModal
      titulo={promocion?.nombre ?? 'Promoción'}
      subtitulo={promocion?.servicioNombre ?? 'Promoción general'}
      filas={filas}
      onClose={onClose}
    >
      {error && <p className="text-[13px] text-red-700">{error}</p>}
      {!promocion && !error && <p className="text-sm text-gray-500">Cargando promoción...</p>}

      {promocion?.tieneImagen && (
        <img
          src={urlImagenPromocion(promocion.id, promocion.fechaActualizacion)}
          alt={promocion.nombre}
          className="max-h-72 w-full rounded-xl border border-gray-100 object-cover"
        />
      )}

      {promocion?.descripcion && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Descripción</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {promocion.descripcion}
          </p>
        </div>
      )}
    </DetalleModal>
  )
}
