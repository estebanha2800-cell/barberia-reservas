// pages/Cancelar.jsx — el cliente busca sus citas por celular y cancela

import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const inputStyle = {
  background: '#151515',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '12px 16px',
  color: '#f0f0f0',
  fontSize: '16px',
  width: '100%',
  outline: 'none',
}

function formatFecha(inicioISO) {
  const d = new Date(inicioISO)
  const fecha = d.toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'America/Bogota',
  })
  const hora = d.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
  })
  return `${fecha} · ${hora}`
}

export default function Cancelar() {
  const [telefono,   setTelefono]   = useState('')
  const [buscando,   setBuscando]   = useState(false)
  const [citas,      setCitas]      = useState(null)
  const [error,      setError]      = useState(null)
  const [cancelando, setCancelando] = useState(null) // id de la cita que se está cancelando
  const [canceladas, setCanceladas] = useState([])   // ids ya canceladas en esta sesión

  async function buscar(e) {
    e.preventDefault()
    const tel = telefono.replace(/\s|-/g, '')
    setBuscando(true)
    setError(null)
    setCitas(null)

    const { data, error: err } = await supabase
      .from('citas')
      .select('*, servicios(nombre, precio, duracion_min)')
      .eq('cliente_telefono', tel)
      .eq('estado', 'confirmada')
      .gte('inicio', new Date().toISOString())
      .order('inicio', { ascending: true })

    setBuscando(false)

    if (err) {
      setError('Error al buscar. Intenta de nuevo.')
      return
    }
    if (!data || data.length === 0) {
      setError('No encontramos citas confirmadas con ese número.')
      return
    }
    setCitas(data)
  }

  async function cancelar(cita) {
    setCancelando(cita.id)
    const { error: err } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', cita.id)
    setCancelando(null)
    if (err) {
      setError('No se pudo cancelar. Intenta de nuevo.')
      return
    }
    setCanceladas(prev => [...prev, cita.id])
    setCitas(prev => prev.filter(c => c.id !== cita.id))
  }

  const todasCanceladas = citas !== null && citas.length === 0 && canceladas.length > 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a', color: '#f0f0f0' }}>

      <header className="text-center px-5 pt-10 pb-6 border-b" style={{ borderColor: '#1e1e1e' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <h1
            className="text-5xl font-bold tracking-wider text-white leading-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.12em' }}
          >
            Opera
          </h1>
        </a>
        <p className="text-xs tracking-widest uppercase mt-2"
           style={{ color: '#c41230', letterSpacing: '0.25em' }}>
          Un concierto para tu cabello
        </p>
      </header>

      <div className="flex-1 px-5 py-8 w-full" style={{ maxWidth: '420px', margin: '0 auto' }}>

        {/* Todas canceladas */}
        {todasCanceladas ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                 style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }}>
              <span style={{ color: '#888', fontSize: '24px' }}>✕</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Cita cancelada
            </h2>
            <p className="mb-8" style={{ color: '#666' }}>Tu cita fue cancelada exitosamente.</p>
            <a href="/"
               className="block w-full font-bold py-4 rounded-2xl text-center"
               style={{ background: '#c41230', color: '#fff', fontSize: '14px', textDecoration: 'none' }}>
              Agendar nueva cita
            </a>
          </div>

        /* Lista de citas encontradas */
        ) : citas !== null ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Tus citas
            </h2>
            <p className="text-sm mb-6" style={{ color: '#666' }}>
              Selecciona la cita que quieres cancelar.
            </p>

            {error && <p className="text-sm mb-4 text-center" style={{ color: '#c41230' }}>{error}</p>}

            <div className="space-y-3">
              {citas.map(cita => (
                <div key={cita.id}
                     className="rounded-2xl p-4"
                     style={{ background: '#151515', border: '1px solid #252525' }}>
                  <div className="text-sm space-y-1 mb-3">
                    <p className="font-semibold text-white">{cita.servicios?.nombre}</p>
                    <p style={{ color: '#888' }} className="capitalize">{formatFecha(cita.inicio)}</p>
                    <p style={{ color: '#666' }}>{cita.cliente_nombre}</p>
                  </div>
                  <button
                    onClick={() => cancelar(cita)}
                    disabled={cancelando === cita.id}
                    className="w-full py-2 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: cancelando === cita.id ? '#1a1a1a' : 'transparent',
                      border: '1px solid #c41230',
                      color: cancelando === cita.id ? '#555' : '#c41230',
                    }}
                  >
                    {cancelando === cita.id ? 'Cancelando…' : 'Cancelar esta cita'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setCitas(null); setError(null) }}
              className="mt-6 w-full text-xs uppercase tracking-widest py-2"
              style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.15em' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c41230')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >
              ← Buscar con otro número
            </button>
          </div>

        /* Formulario de búsqueda */
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Cancelar cita
            </h2>
            <p className="text-sm mb-8" style={{ color: '#666' }}>
              Ingresa el celular con el que agendaste.
            </p>

            <form onSubmit={buscar} className="space-y-4">
              <div>
                <label className="block text-xs uppercase mb-1.5"
                       style={{ color: '#555', letterSpacing: '0.15em' }}>
                  Número de celular
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="Ej: 3001234567"
                  inputMode="numeric"
                  required
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#888')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                />
              </div>

              {error && <p className="text-sm text-center" style={{ color: '#c41230' }}>{error}</p>}

              <button
                type="submit"
                disabled={buscando}
                className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95"
                style={{
                  background: buscando ? '#1a1a1a' : '#c41230',
                  color: buscando ? '#555' : '#fff',
                  fontSize: '15px',
                }}
              >
                {buscando ? 'Buscando…' : 'Buscar mis citas'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <a href="/" className="text-xs uppercase tracking-widest"
                 style={{ color: '#555', letterSpacing: '0.15em', textDecoration: 'none' }}
                 onMouseEnter={e => (e.currentTarget.style.color = '#c41230')}
                 onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                ← Volver al inicio
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
