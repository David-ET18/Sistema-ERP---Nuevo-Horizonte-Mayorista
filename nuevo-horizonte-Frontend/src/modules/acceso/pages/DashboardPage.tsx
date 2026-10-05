import { useState } from 'react'

const KPIS = [
  { label: 'Productos activos', value: '1,248', delta: '+12%' },
  { label: 'Ventas del mes', value: 'S/ 86,420', delta: '+8%' },
  { label: 'Reservas activas', value: '312', delta: '+5%' },
]

const RENDIMIENTO = [
  { label: 'Paquetes turísticos', value: 82 },
  { label: 'Hoteles', value: 64 },
  { label: 'Vuelos', value: 48 },
]

const COMPARATIVA = [
  { month: 'Ene', value: 42 },
  { month: 'Feb', value: 58 },
  { month: 'Mar', value: 50 },
  { month: 'Abr', value: 72 },
  { month: 'May', value: 65 },
  { month: 'Jun', value: 88 },
]

const AVISOS = [
  { title: 'Pago recibido', detail: 'Reserva #1024 · hace 5 min' },
  { title: 'Nuevo cliente registrado', detail: 'hace 2 h' },
  { title: 'Precio de vuelo actualizado', detail: 'hace 6 h' },
]

const TABS = ['Semanal', 'Mensual', 'Anual']

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Mensual')

  return (
    <div className="flex flex-col gap-6">
      {/* Fila 1: KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {KPIS.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-[13px] text-gray-500">{kpi.label}</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {kpi.value}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[12px] font-semibold text-emerald-700">
                {kpi.delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* Fila 2: panel ancho con pestañas */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-gray-900">
            Panel de ventas
          </h2>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico de barras simulado */}
        <div className="flex h-44 items-end justify-between gap-6 border-b border-gray-200 pb-2 px-1">
          {[28, 45, 38, 62, 50, 76, 68, 84, 60, 72, 90, 66].map(
            (height, index) => (
              <div
                key={index}
                style={{ height: `${height}%` }}
                className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-sky-400"
              />
            ),
          )}
        </div>
      </section>

      {/* Fila 3: tres columnas */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Columna izquierda: rendimiento en lista/barras */}
        <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Rendimiento por categoría
          </h3>
          <div className="flex flex-col gap-4">
            {RENDIMIENTO.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Columna centro: comparativa vertical */}
        <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Comparativa de reservas
          </h3>
          <div className="flex h-36 items-end justify-between gap-2">
            {COMPARATIVA.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-7 rounded-t bg-gradient-to-t from-indigo-600 to-sky-400"
                  style={{ height: `${item.value * 1.2}px` }}
                />
                <span className="text-[11px] text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Columna derecha: avisos */}
        <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Avisos</h3>
          <ul className="flex flex-col gap-3">
            {AVISOS.map((aviso) => (
              <li
                key={aviso.title}
                className="rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <p className="text-[13px] font-medium text-gray-800">
                  {aviso.title}
                </p>
                <p className="text-[12px] text-gray-500">{aviso.detail}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}