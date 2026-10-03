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
import { IconBriefcase, IconBuilding, IconInfo } from '@/components/icons'
import { NavCatalogoIcon } from '@/components/navIcons'

type Pestana = 'destinos' | 'servicios'

/** Porcentaje de `parte` sobre `total`, redondeado; null si no hay base para calcularlo. */
function porcentaje(parte: number, total: number): number | null {
  if (total <= 0) return null
  return Math.round((parte / total) * 100)
}

export default function CatalogoPage() {
  const [pestana, setPestana] = useState<Pestana>('destinos')
  const [kpis, setKpis] = useState<KpisCatalogo | null>(null)

  function cargarKpis() {
    kpisCatalogo().then(setKpis).catch(() => undefined)
  }

  useEffect(cargarKpis, [])

  const pctDestinosActivos = kpis ? porcentaje(kpis.destinosActivos, kpis.destinos) : null
  const pctServiciosActivos = kpis ? porcentaje(kpis.serviciosActivos, kpis.servicios) : null

  const cards = [
    { etiqueta: 'Destinos', valor: kpis?.destinos ?? 0, nota: 'Total registrados', pct: null },
    { etiqueta: 'Destinos activos', valor: kpis?.destinosActivos ?? 0, nota: 'vs. total', pct: pctDestinosActivos },
    { etiqueta: 'Servicios', valor: kpis?.servicios ?? 0, nota: 'Total registrados', pct: null },
    { etiqueta: 'Servicios activos', valor: kpis?.serviciosActivos ?? 0, nota: 'vs. total', pct: pctServiciosActivos },
  ]

  const TABS: { id: Pestana; etiqueta: string; Icon: typeof IconBuilding; total: number | undefined }[] = [
    { id: 'destinos', etiqueta: 'Destinos', Icon: IconBuilding, total: kpis?.destinos },
    { id: 'servicios', etiqueta: 'Servicios', Icon: IconBriefcase, total: kpis?.servicios },
  ]

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <NavCatalogoIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Catálogo Base</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Administra los destinos y servicios que alimentan tarifas, paquetes y cotizaciones
          </p>
        </div>
      </div>

      <div className="flex divide-x divide-gray-100 overflow-x-auto rounded-xl border border-gray-200/70 bg-white shadow-sm">
        {cards.map((card) => (
          <div key={card.etiqueta} className="flex min-w-[160px] flex-1 flex-col gap-2.5 px-5 py-4">
            <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
              {card.etiqueta}
              <IconInfo className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <p className="text-2xl font-bold leading-none text-gray-900">{card.valor}</p>
            <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400">
              {card.nota}
              {card.pct !== null && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-600">
                  ↑ {card.pct}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-fit rounded-lg bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPestana(t.id)}
            aria-current={pestana === t.id ? 'page' : undefined}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
              pestana === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.Icon className="h-4 w-4" />
            {t.etiqueta}
            {typeof t.total === 'number' && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  pestana === t.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {t.total}
              </span>
            )}
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
          Icon={IconBuilding}
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
          Icon={IconBriefcase}
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
