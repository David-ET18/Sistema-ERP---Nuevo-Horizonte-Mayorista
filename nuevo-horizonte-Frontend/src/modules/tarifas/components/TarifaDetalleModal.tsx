import { useEffect, useState } from 'react'

import type { Tarifa } from '../types'
import { detalleTarifa } from '../services/tarifaService'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import DetalleModal from '@/components/DetalleModal'
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconInfo,
  IconMoney,
  IconStar,
} from '@/components/icons'

interface Props {
  id: number
  onClose: () => void
}

export default function TarifaDetalleModal({ id, onClose }: Props) {
  const [tarifa, setTarifa] = useState<Tarifa | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detalleTarifa(id)
      .then(setTarifa)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [id])

  const filas = tarifa
    ? [
        { etiqueta: 'Proveedor', valor: tarifa.proveedor, icono: <IconBuilding className="h-3.5 w-3.5" /> },
        { etiqueta: 'Servicio', valor: tarifa.servicio, icono: <IconBriefcase className="h-3.5 w-3.5" /> },
        { etiqueta: 'Destino', valor: tarifa.destino, icono: <IconStar className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Tipo de tarifa',
          valor: tarifa.tipoTarifa || '-',
          icono: <IconInfo className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Precio',
          valor: `${tarifa.moneda} ${tarifa.precio.toFixed(2)}`,
          icono: <IconMoney className="h-3.5 w-3.5" />,
        },
        { etiqueta: 'Estado', valor: tarifa.estado, icono: <IconCheckCircle className="h-3.5 w-3.5" /> },
        { etiqueta: 'Desde', valor: formatDate(tarifa.fechaDesde), icono: <IconCalendar className="h-3.5 w-3.5" /> },
        { etiqueta: 'Hasta', valor: formatDate(tarifa.fechaHasta), icono: <IconCalendar className="h-3.5 w-3.5" /> },
        { etiqueta: 'Creado', valor: formatDate(tarifa.fechaCreacion), icono: <IconCalendar className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Última actualización',
          valor: formatDate(tarifa.fechaActualizacion),
          icono: <IconClock className="h-3.5 w-3.5" />,
        },
      ]
    : []

  return (
    <DetalleModal
      titulo={`Tarifa ${tarifa ? `#${tarifa.id}` : ''}`}
      subtitulo={tarifa ? `${tarifa.proveedor} · ${tarifa.servicio}` : undefined}
      filas={filas}
      onClose={onClose}
    >
      {error && <p className="text-[13px] text-red-700">{error}</p>}
      {!tarifa && !error && <p className="text-sm text-gray-500">Cargando tarifa...</p>}

      {tarifa?.condiciones && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Condiciones</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {tarifa.condiciones}
          </p>
        </div>
      )}

      {tarifa?.observaciones && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Observaciones</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {tarifa.observaciones}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-medium text-gray-500">Historial de precios</p>
        {tarifa && tarifa.historial.length === 0 ? (
          <p className="text-sm text-gray-400">Sin cambios de precio registrados</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {tarifa?.historial.map((h, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="text-gray-600">
                  {h.precioAnterior != null ? `${tarifa.moneda} ${h.precioAnterior.toFixed(2)}` : 'Primera versión'}
                  <span className="text-gray-400"> → </span>
                  <span className="font-medium text-gray-900">
                    {tarifa.moneda} {h.precioNuevo.toFixed(2)}
                  </span>
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(h.fechaCambio)}
                  {h.usuarioCambio ? ` · ${h.usuarioCambio}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetalleModal>
  )
}