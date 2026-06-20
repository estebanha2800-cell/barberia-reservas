// PasoDatos.jsx — Paso 4: el cliente ingresa nombre y teléfono y confirma

import { useState } from 'react'

function validarTelefono(tel) {
  return /^3\d{9}$/.test(tel.replace(/\s|-/g, ''))
}

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function PasoDatos({ servicio, fecha, slot, onConfirmar, onVolver, guardando }) {
  const [nombre,   setNombre]   = useState('')
  const [telefono, setTelefono] = useState('')
  const [errores,  setErrores]  = useState({})

  function validar() {
    const errs = {}
    if (!nombre.trim()) errs.nombre = 'Escribe tu nombre completo.'
    if (!validarTelefono(telefono))
      errs.telefono = 'Celular colombiano válido (10 dígitos, empieza por 3).'
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (validar()) {
      onConfirmar({ nombre: nombre.trim(), telefono: telefono.replace(/\s|-/g, '') })
    }
  }

  const fechaTexto = `${fecha.getDate()} de ${MESES[fecha.getMonth()]} · ${slot.etiqueta}`

  const inputStyle = {
    background:'#151515',
    border:'1px solid #2a2a2a',
    borderRadius:'12px',
    padding:'12px 16px',
    color:'#f0f0f0',
    fontSize:'14px',
    width:'100%',
    outline:'none',
  }

  return (
    <div>
      <h2
        className="text-2xl font-bold text-white mb-1"
        style={{fontFamily:"'Playfair Display', Georgia, serif"}}
      >
        Tus datos
      </h2>
      <p className="text-sm mb-6" style={{color:'#666'}}>Solo necesitamos tu nombre y celular.</p>

      {/* Resumen */}
      <div className="rounded-2xl p-4 mb-6 text-sm space-y-2" style={{background:'#151515', border:'1px solid #252525'}}>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Servicio</span>
          <strong className="text-white">{servicio.nombre}</strong>
        </div>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Fecha y hora</span>
          <strong className="text-white">{fechaTexto}</strong>
        </div>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Duración</span>
          <strong className="text-white">{servicio.duracion_min} min</strong>
        </div>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Precio</span>
          <strong style={{color:'#c41230'}}>${servicio.precio?.toLocaleString('es-CO')}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{color:'#666', letterSpacing:'0.15em'}}>
            Nombre completo
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
            style={{
              ...inputStyle,
              borderColor: errores.nombre ? '#c41230' : '#2a2a2a',
            }}
            onFocus={e => (e.currentTarget.style.borderColor='#888')}
            onBlur={e => (e.currentTarget.style.borderColor=errores.nombre?'#c41230':'#2a2a2a')}
          />
          {errores.nombre && (
            <p className="text-xs mt-1" style={{color:'#c41230'}}>{errores.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{color:'#666', letterSpacing:'0.15em'}}>
            Número de celular
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 3001234567"
            inputMode="numeric"
            style={{
              ...inputStyle,
              borderColor: errores.telefono ? '#c41230' : '#2a2a2a',
            }}
            onFocus={e => (e.currentTarget.style.borderColor='#888')}
            onBlur={e => (e.currentTarget.style.borderColor=errores.telefono?'#c41230':'#2a2a2a')}
          />
          {errores.telefono && (
            <p className="text-xs mt-1" style={{color:'#c41230'}}>{errores.telefono}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95 mt-2"
          style={{
            background: guardando ? '#1a1a1a' : '#c41230',
            color: guardando ? '#555' : '#fff',
            opacity: guardando ? 0.7 : 1,
            fontSize:'15px',
            letterSpacing:'0.05em',
          }}
        >
          {guardando ? 'Agendando…' : 'Confirmar cita'}
        </button>
      </form>

      <button
        onClick={onVolver}
        className="mt-4 w-full text-xs uppercase tracking-widest transition-all py-2"
        style={{color:'#555', letterSpacing:'0.15em'}}
        onMouseEnter={e => (e.currentTarget.style.color='#c41230')}
        onMouseLeave={e => (e.currentTarget.style.color='#555')}
      >
        ← Cambiar hora
      </button>
    </div>
  )
}
