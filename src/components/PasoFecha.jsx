// PasoFecha.jsx — Paso 2: el cliente elige la fecha
// Muestra un calendario simple de 4 semanas hacia adelante.
// Deshabilita domingos y festivos colombianos.

import { useState } from 'react'
import { esFestivoColombia } from '../lib/festivos.js'

// Nombres de los días de la semana (abreviados)
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

// Nombres de los meses
const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function PasoFecha({ servicio, onSeleccionar, onVolver }) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Navegar entre meses
  const [mesBase, setMesBase] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  )

  // Construye el grid del mes actual
  function buildGrid(primero) {
    const dias = []
    // Celda vacía para alinear el primer día con su día de semana
    const primerDiaSemana = primero.getDay()
    for (let i = 0; i < primerDiaSemana; i++) dias.push(null)

    const ultimoDia = new Date(primero.getFullYear(), primero.getMonth() + 1, 0).getDate()
    for (let d = 1; d <= ultimoDia; d++) {
      dias.push(new Date(primero.getFullYear(), primero.getMonth(), d))
    }
    return dias
  }

  function mesAnterior() {
    setMesBase(new Date(mesBase.getFullYear(), mesBase.getMonth() - 1, 1))
  }

  function mesSiguiente() {
    setMesBase(new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1))
  }

  function esDeshabilitada(fecha) {
    if (!fecha) return true
    if (fecha < hoy) return true
    if (fecha.getDay() === 0) return true         // domingo
    if (esFestivoColombia(fecha)) return true     // festivo
    return false
  }

  // No permitir navegar antes del mes actual
  const esMesActual =
    mesBase.getFullYear() === hoy.getFullYear() &&
    mesBase.getMonth() === hoy.getMonth()

  const grid = buildGrid(mesBase)

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">¿Qué día te queda bien?</h2>
      <p className="text-gray-500 text-sm mb-4">
        Servicio: <strong>{servicio.nombre}</strong>
      </p>

      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={mesAnterior}
          disabled={esMesActual}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-700 capitalize">
          {MESES[mesBase.getMonth()]} {mesBase.getFullYear()}
        </span>
        <button
          onClick={mesSiguiente}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Cabecera de días */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((fecha, i) => {
          if (!fecha) return <div key={`v-${i}`} />

          const disabled = esDeshabilitada(fecha)
          const esHoy =
            fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear()

          return (
            <button
              key={fecha.toISOString()}
              disabled={disabled}
              onClick={() => onSeleccionar(fecha)}
              className={`
                aspect-square rounded-xl text-sm font-medium transition-all
                ${disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-800 hover:text-white active:scale-90 cursor-pointer'}
                ${esHoy && !disabled ? 'border-2 border-gray-800 text-gray-800' : ''}
              `}
            >
              {fecha.getDate()}
            </button>
          )
        })}
      </div>

      <button
        onClick={onVolver}
        className="mt-6 text-sm text-gray-400 underline hover:text-gray-700"
      >
        ← Cambiar servicio
      </button>
    </div>
  )
}
