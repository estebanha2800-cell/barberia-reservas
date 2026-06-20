// PasoFecha.jsx — Paso 2: el cliente elige la fecha

import { useState } from 'react'
import { esFestivoColombia } from '../lib/festivos.js'

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function PasoFecha({ servicio, onSeleccionar, onVolver }) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const [mesBase, setMesBase] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  )

  function buildGrid(primero) {
    const dias = []
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
    if (fecha.getDay() === 0) return true
    if (esFestivoColombia(fecha)) return true
    return false
  }

  const esMesActual =
    mesBase.getFullYear() === hoy.getFullYear() &&
    mesBase.getMonth() === hoy.getMonth()

  const grid = buildGrid(mesBase)

  return (
    <div>
      <h2
        className="text-2xl font-bold text-white mb-1"
        style={{fontFamily:"'Playfair Display', Georgia, serif"}}
      >
        ¿Qué día?
      </h2>
      <p className="text-sm mb-5" style={{color:'#666'}}>
        Servicio: <span style={{color:'#f0f0f0'}}>{servicio.nombre}</span>
      </p>

      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={mesAnterior}
          disabled={esMesActual}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-20"
          style={{color:'#888', fontSize:'18px'}}
          onMouseEnter={e => !esMesActual && (e.currentTarget.style.color='#fff')}
          onMouseLeave={e => (e.currentTarget.style.color='#888')}
        >
          ‹
        </button>
        <span className="font-semibold capitalize text-white" style={{fontSize:'15px'}}>
          {MESES[mesBase.getMonth()]} {mesBase.getFullYear()}
        </span>
        <button
          onClick={mesSiguiente}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
          style={{color:'#888', fontSize:'18px'}}
          onMouseEnter={e => (e.currentTarget.style.color='#fff')}
          onMouseLeave={e => (e.currentTarget.style.color='#888')}
        >
          ›
        </button>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs py-1" style={{color:'#555'}}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid días */}
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
              className="aspect-square rounded-lg text-sm font-medium transition-all active:scale-90"
              style={{
                color: disabled ? '#333' : '#f0f0f0',
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: esHoy && !disabled ? '1px solid #c41230' : '1px solid transparent',
                background: 'transparent',
              }}
              onMouseEnter={e => !disabled && (e.currentTarget.style.background='#c41230', e.currentTarget.style.color='#fff')}
              onMouseLeave={e => !disabled && (e.currentTarget.style.background='transparent', e.currentTarget.style.color=esHoy?'#f0f0f0':'#f0f0f0')}
            >
              {fecha.getDate()}
            </button>
          )
        })}
      </div>

      <button
        onClick={onVolver}
        className="mt-6 text-xs uppercase tracking-widest transition-all"
        style={{color:'#555', letterSpacing:'0.15em'}}
        onMouseEnter={e => (e.currentTarget.style.color='#c41230')}
        onMouseLeave={e => (e.currentTarget.style.color='#555')}
      >
        ← Cambiar servicio
      </button>
    </div>
  )
}
