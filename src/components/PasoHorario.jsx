// PasoHorario.jsx — Paso 3: el cliente elige la hora disponible

import { useEffect, useState } from 'react'
import { obtenerSlots } from '../lib/disponibilidad.js'
import Cargando from './Cargando.jsx'

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function PasoHorario({ barberoId, servicio, fecha, onSeleccionar, onVolver }) {
  const [slots, setSlots]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

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
      <h2
        className="text-2xl font-bold text-white mb-1"
        style={{fontFamily:"'Playfair Display', Georgia, serif"}}
      >
        ¿A qué hora?
      </h2>
      <p className="text-sm mb-6" style={{color:'#666'}}>
        {servicio.nombre} · <span style={{color:'#f0f0f0'}}>{fechaTexto}</span>
      </p>

      {cargando && <Cargando texto="Consultando disponibilidad…" />}

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{background:'#1a1a1a', color:'#c41230', border:'1px solid #c41230'}}>
          {error}
        </div>
      )}

      {!cargando && !error && slots.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">—</p>
          <p className="font-medium" style={{color:'#888'}}>Sin horas disponibles este día.</p>
          <p className="text-sm mt-1" style={{color:'#555'}}>Prueba con otra fecha.</p>
        </div>
      )}

      {!cargando && slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.inicioISO}
              onClick={() => onSeleccionar(slot)}
              className="py-3 text-sm font-semibold transition-all active:scale-95"
              style={{
                background:'#151515',
                border:'1px solid #252525',
                borderRadius:'12px',
                color:'#f0f0f0',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background='#c41230'
                e.currentTarget.style.borderColor='#c41230'
                e.currentTarget.style.color='#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background='#151515'
                e.currentTarget.style.borderColor='#252525'
                e.currentTarget.style.color='#f0f0f0'
              }}
            >
              {slot.etiqueta}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onVolver}
        className="mt-6 text-xs uppercase tracking-widest transition-all"
        style={{color:'#555', letterSpacing:'0.15em'}}
        onMouseEnter={e => (e.currentTarget.style.color='#c41230')}
        onMouseLeave={e => (e.currentTarget.style.color='#555')}
      >
        ← Cambiar fecha
      </button>
    </div>
  )
}
