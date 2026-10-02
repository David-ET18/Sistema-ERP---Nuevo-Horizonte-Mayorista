import { useEffect, useState } from 'react'

import type { Destino, KpisCatalogo, Servicio } from '../types'
import CatalogoTabla from '../components/CatalogoTabla'
import {
  actualizarDestino,
  actualizarServicio,
  crearDestino,
  crearServicio,
  eliminarDestino,
  eliminarServicio,
  kpisCatalogo,
  listarCategorias,
  listarDestinos,
  listarPaises,
  listarServicios,
} from '../services/catalogoService'
import { IconBriefcase, IconBuilding, IconCheckCircle } from '@/components/icons'

type Pestana = 'destinos' | 'servicios'

export default function CatalogoPage() {
  const [pestana, setPestana] = useState<Pestana>('destinos')
  const [kpis, setKpis] = useState<KpisCatalogo | null>(null)

  function cargarKpis() {
    kpisCatalogo().then(setKpis).catch(() => undefined)
  }

  useEffect(cargarKpis, [])

  const cards = [
    { etiqueta: 'Destinos', valor: kpis?.destinos ?? 0, color: 'bg-blue-100 text-blue-600', Icon: IconBuilding },
    {
      etiqueta: 'Destinos activos',
      valor: kpis?.destinosActivos ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
    { etiqueta: 'Servicios', valor: kpis?.servicios ?? 0, color: 'bg-amber-100 text-amber-600', Icon: IconBriefcase },
    {
      etiqueta: 'Servicios activos',
      valor: kpis?.serviciosActivos ?? 0,
      color: 'bg-emerald-100 text-emerald-600',
      Icon: IconCheckCircle,
    },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Catálogo Base</h2>
        <p className="mt-1 text-sm text-gray-500">
          Administra los destinos y servicios que alimentan tarifas, paquetes y cotizaciones
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
              <card.Icon />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.valor}</p>
              <p className="text-[13px] text-gray-500">{card.etiqueta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-fit rounded-lg bg-gray-100 p-1">
        {(['destinos', 'servicios'] as Pestana[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPestana(p)}
            className={`cursor-pointer rounded-md px-5 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              pestana === p ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {pestana === 'destinos' ? (
        <CatalogoTabla<Destino>
          key="destinos"
          singular="destino"
          plural="destinos"
          etiquetaGrupo="País"
          grupoObligatorio
          obtenerGrupo={(d) => d.pais}
          listar={listarDestinos}
          listarGrupos={listarPaises}
          guardar={async (v, editando) => {
            const payload = { nombre: v.nombre.trim(), pais: v.grupo.trim(), descripcion: v.descripcion.trim() || null, activo: v.activo }
            if (editando) await actualizarDestino(editando.id, payload)
            else await crearDestino(payload)
          }}
          eliminar={eliminarDestino}
          onCambio={cargarKpis}
        />
      ) : (
        <CatalogoTabla<Servicio>
          key="servicios"
          singular="servicio"
          plural="servicios"
          etiquetaGrupo="Categoría"
          grupoObligatorio={false}
          obtenerGrupo={(s) => s.categoria}
          listar={listarServicios}
          listarGrupos={listarCategorias}
          guardar={async (v, editando) => {
            const payload = { nombre: v.nombre.trim(), categoria: v.grupo.trim() || null, descripcion: v.descripcion.trim() || null, activo: v.activo }
            if (editando) await actualizarServicio(editando.id, payload)
            else await crearServicio(payload)
          }}
          eliminar={eliminarServicio}
          onCambio={cargarKpis}
        />
      )}
    </section>
  )
}
