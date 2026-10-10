import { useEffect, useState } from 'react'

import type { Paquete } from '../types'
import { detallePaquete } from '../services/paqueteService'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import DetalleModal from '@/components/DetalleModal'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconInfo,
  IconMoney,
  IconStar,
  IconTrendingUp,
} from '@/components/icons'

interface Props {
  id: number
  onClose: () => void
}

export default function PaqueteDetalleModal({ id, onClose }: Props) {
  const [paquete, setPaquete] = useState<Paquete | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detallePaquete(id)
      .then(setPaquete)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [id])

  const filas = paquete
    ? [
        { etiqueta: 'Destino', valor: paquete.destino || '-', icono: <IconStar className="h-3.5 w-3.5" /> },
        { etiqueta: 'Categoría', valor: paquete.categoria || '-', icono: <IconInfo className="h-3.5 w-3.5" /> },
        { etiqueta: 'Duración', valor: paquete.duracionTexto || '-', icono: <IconClock className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Precio desde',
          valor: paquete.precioDesde != null ? `${paquete.moneda} ${paquete.precioDesde.toFixed(2)}` : '-',
          icono: <IconMoney className="h-3.5 w-3.5" />,
        },
        { etiqueta: 'Estado', valor: paquete.estado, icono: <IconCheckCircle className="h-3.5 w-3.5" /> },
        { etiqueta: 'Destacado', valor: paquete.destacado ? 'Sí' : 'No', icono: <IconTrendingUp className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Inicio de viaje',
          valor: paquete.fechaInicioViaje ? formatDate(paquete.fechaInicioViaje) : '-',
          icono: <IconCalendar className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Fin de viaje',
          valor: paquete.fechaFinViaje ? formatDate(paquete.fechaFinViaje) : '-',
          icono: <IconCalendar className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Cierre de venta',
          valor: paquete.fechaCierreVenta ? formatDate(paquete.fechaCierreVenta) : '-',
          icono: <IconClock className="h-3.5 w-3.5" />,
        },
        { etiqueta: 'Creado', valor: formatDate(paquete.fechaCreacion), icono: <IconCalendar className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Última actualización',
          valor: formatDate(paquete.fechaActualizacion),
          icono: <IconClock className="h-3.5 w-3.5" />,
        },
      ]
    : []

  return (
    <DetalleModal
      titulo={paquete?.nombre ?? 'Paquete'}
      subtitulo={paquete?.destino ?? undefined}
      filas={filas}
      onClose={onClose}
    >
      {error && <p className="text-[13px] text-red-700">{error}</p>}
      {!paquete && !error && <p className="text-sm text-gray-500">Cargando paquete...</p>}

      {paquete?.descripcion && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Descripción</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {paquete.descripcion}
          </p>
        </div>
      )}

      {paquete && paquete.aliados.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-medium text-gray-500">Aliados</p>
          <div className="flex flex-wrap gap-1.5">
            {paquete.aliados.map((a) => (
              <span key={a} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {paquete && paquete.vuelos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-gray-500">Vuelos incluidos</p>
          <table className="w-full overflow-hidden rounded-lg border border-gray-100 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2 font-semibold">Aerolínea</th>
                <th className="px-3 py-2 font-semibold">Ruta</th>
                <th className="px-3 py-2 font-semibold">Salida</th>
                <th className="px-3 py-2 font-semibold">Llegada</th>
              </tr>
            </thead>
            <tbody>
              {paquete.vuelos.map((v) => (
                <tr key={v.id ?? `${v.aerolinea}-${v.origen}-${v.destino}`} className="border-t border-gray-100">
                  <td className="px-3 py-2">{v.aerolinea}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {v.origen} → {v.destino}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{formatDate(v.fechaSalida)}</td>
                  <td className="px-3 py-2 text-gray-600">{formatDate(v.fechaLlegada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paquete && paquete.opciones.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-gray-500">Opciones de alojamiento</p>
          <table className="w-full overflow-hidden rounded-lg border border-gray-100 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2 font-semibold">Hotel / Servicio</th>
                <th className="px-3 py-2 font-semibold">Fechas</th>
                <th className="px-3 py-2 text-right font-semibold">P. simple</th>
                <th className="px-3 py-2 text-right font-semibold">P. doble</th>
              </tr>
            </thead>
            <tbody>
              {paquete.opciones.map((o) => (
                <tr key={o.id ?? `${o.hotelServicio}-${o.fechaDesde}`} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <span className="font-medium text-gray-800">{o.hotelServicio}</span>
                    <p className="text-xs text-gray-400">{o.incluye}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {formatDate(o.fechaDesde)} - {formatDate(o.fechaHasta)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">{o.precioSimple.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{o.precioDoble.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DetalleModal>
  )
}