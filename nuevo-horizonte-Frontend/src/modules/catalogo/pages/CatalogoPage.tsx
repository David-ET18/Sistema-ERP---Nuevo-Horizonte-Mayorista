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
import { NavCatalogoIcon } from '@/components/navIcons'

type Pestana = 'destinos' | 'servicios'

export default function CatalogoPage() {
  const [pestana, setPestana] = useState<Pestana>('destinos')
  const [kpis, setKpis] = useState<KpisCatalogo | null>(null)

  function cargarKpis() {
    kpisCatalogo().then(setKpis).catch(() => undefined)
  }

  useEffect(cargarKpis, [])

  // Solo los 2 KPIs relevantes a la pestaña activa: total y activos de eso mismo.
  const IconPestana = pestana === 'destinos' ? IconBuilding : IconBriefcase
  const cards =
    pestana === 'destinos'
      ? [
          { etiqueta: 'Destinos', valor: kpis?.destinos ?? 0, nota: 'Registrados en total', Icon: IconPestana, color: 'bg-blue-50 text-blue-600' },
          {
            etiqueta: 'Destinos activos',
            valor: kpis?.destinosActivos ?? 0,
            nota: 'Disponibles en los formularios',
            Icon: IconCheckCircle,
            color: 'bg-emerald-50 text-emerald-600',
          },
        ]
      : [
          { etiqueta: 'Servicios', valor: kpis?.servicios ?? 0, nota: 'Registrados en total', Icon: IconPestana, color: 'bg-amber-50 text-amber-600' },
          {
            etiqueta: 'Servicios activos',
            valor: kpis?.serviciosActivos ?? 0,
            nota: 'Disponibles en los formularios',
            Icon: IconCheckCircle,
            color: 'bg-emerald-50 text-emerald-600',
          },
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

      <div className="flex items-center gap-4">
        <div className="grid grid-cols-2 gap-4 sm:w-fit sm:grid-cols-[repeat(2,220px)]">
          {cards.map((card) => (
            <div
              key={card.etiqueta}
              className="flex items-center gap-3.5 rounded-xl border border-gray-200/70 bg-white px-4 py-3.5 shadow-sm"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                <card.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-gray-900">{card.valor}</p>
                <p className="mt-1.5 truncate text-[13px] font-medium text-gray-600">{card.etiqueta}</p>
                <p className="truncate text-[11.5px] text-gray-400">{card.nota}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ilustracion decorativa: llena el espacio libre a la derecha de los KPIs */}
        <img
          src="/brand/ilustracion-multitasking.svg"
          alt=""
          className="ml-auto hidden h-28 w-auto shrink-0 opacity-90 xl:block"
        />
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
