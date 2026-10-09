import { useEffect, useState } from 'react'

import type { Proveedor } from '../types'
import { detalleProveedor } from '../services/proveedorService'
import { extractErrorMessage } from '@/api/http'
import { formatDate } from '@/utils/format'
import DetalleModal from '@/components/DetalleModal'
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconHandshake,
  IconInfo,
  IconMail,
  IconPhone,
  IconStar,
  IconTrendingUp,
  IconUsers,
} from '@/components/icons'

interface Props {
  id: number
  onClose: () => void
}

export default function ProveedorDetalleModal({ id, onClose }: Props) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detalleProveedor(id)
      .then(setProveedor)
      .catch((err) => setError(extractErrorMessage(err)))
  }, [id])

  const filas = proveedor
    ? [
        { etiqueta: 'Razón social', valor: proveedor.razonSocial, icono: <IconBuilding className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Nombre comercial',
          valor: proveedor.nombreComercial || '-',
          icono: <IconStar className="h-3.5 w-3.5" />,
        },
        { etiqueta: 'RUC', valor: proveedor.ruc, icono: <IconBriefcase className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Tipo de servicio',
          valor: proveedor.tipoProveedor || '-',
          icono: <IconInfo className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Persona de contacto',
          valor: proveedor.contactoNombre || '-',
          icono: <IconUsers className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Teléfono',
          valor: proveedor.contactoTelefono || '-',
          icono: <IconPhone className="h-3.5 w-3.5" />,
        },
        { etiqueta: 'Correo', valor: proveedor.contactoEmail || '-', icono: <IconMail className="h-3.5 w-3.5" /> },
        { etiqueta: 'Destino', valor: proveedor.destino || '-', icono: <IconTrendingUp className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Condiciones comerciales',
          valor: proveedor.condicionesComerciales || '-',
          icono: <IconHandshake className="h-3.5 w-3.5" />,
        },
        {
          etiqueta: 'Estado',
          valor: proveedor.activo ? 'Activo' : 'Inactivo',
          icono: <IconCheckCircle className="h-3.5 w-3.5" />,
        },
        { etiqueta: 'Creado', valor: formatDate(proveedor.fechaCreacion), icono: <IconCalendar className="h-3.5 w-3.5" /> },
        {
          etiqueta: 'Última actualización',
          valor: formatDate(proveedor.fechaActualizacion),
          icono: <IconClock className="h-3.5 w-3.5" />,
        },
      ]
    : []

  return (
    <DetalleModal
      titulo={proveedor?.nombreComercial || proveedor?.razonSocial || 'Proveedor'}
      subtitulo={proveedor ? `RUC ${proveedor.ruc}` : undefined}
      filas={filas}
      onClose={onClose}
    >
      {error && <p className="text-[13px] text-red-700">{error}</p>}
      {!proveedor && !error && <p className="text-sm text-gray-500">Cargando proveedor...</p>}
      {proveedor?.observaciones && (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-gray-500">Observaciones</p>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {proveedor.observaciones}
          </p>
        </div>
      )}
    </DetalleModal>
  )
}