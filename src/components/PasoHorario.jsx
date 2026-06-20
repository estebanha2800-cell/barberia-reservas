// PasoHorario.jsx — Paso 3: el cliente elige la hora disponible

import { useEffect, useState } from 'react'
import { obtenerSlots } from '../lib/disponibilidad.js'
import Cargando from './Cargando.jsx'

// Nombres de los meses para formatear la fecha
const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function PasoHorario({ barberoId, servicio, fecha, onSeleccionar, onVolver }) {
  const [slots, setSlots]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  // Cada vez que cambia la fecha o el servicio, recarga los slots
  useEffect(() => {
    setCargando(true)
    setError(null)

    obtenerSlots(barberoId, fecha, servicio.duracion_min)
      .then((resultado) => setSlots(resultado))
      .catch(() => setError('No pudimos cargar los horarios. Intenta de nuevo.'))
      .finally(() => setCargando(false))
  }, [barberoId, servicio.id, fecha])

  const fechaTexto = `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">¿A qué hora?</h2>
      <p className="text-gray-500 text-sm mb-6">
        {servicio.nombre} · {fechaTexto}
      </p>

      {cargando && <Cargando texto="Consultando disponibilidad…" />}

      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>
      )}

      {!cargando && !error && slots.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-gray-600 font-medium">No hay horas disponibles este día.</p>
          <p className="text-gray-400 text-sm mt-1">Prueba con otra fecha.</p>
        </div>
      )}

      {!cargando && slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.inicioISO}
              onClick={() => onSeleccionar(slot)}
              className="py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold
                         hover:bg-gray-800 hover:text-white hover:border-gray-800
                         active:scale-95 transition-all text-sm"
            >
              {slot.etiqueta}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onVolver}
        className="mt-6 text-sm text-gray-400 underline hover:text-gray-700"
      >
        ← Cambiar fecha
      </button>
    </div>
  )
}
