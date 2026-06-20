// pages/Cancelar.jsx — el cliente cancela su cita con el código de 8 caracteres

import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const inputStyle = {
  background: '#151515',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '12px 16px',
  color: '#f0f0f0',
  fontSize: '18px',
  width: '100%',
  outline: 'none',
  textAlign: 'center',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
}

function formatFecha(inicioISO) {
  const d = new Date(inicioISO)
  const fecha = d.toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'America/Bogota',
  })
  const hora = d.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
  })
  return { fecha, hora }
}

export default function Cancelar() {
  const [codigo,    setCodigo]    = useState('')
  const [buscando,  setBuscando]  = useState(false)
  const [cita,      setCita]      = useState(null)
  const [error,     setError]     = useState(null)
  const [cancelando,setCancelando]= useState(false)
  const [cancelada, setCancelada] = useState(false)

  async function buscar(e) {
    e.preventDefault()
    const code = codigo.trim().toUpperCase()
    setBuscando(true)
    setError(null)
    setCita(null)

    const { data, error: err } = await supabase
      .from('citas')
      .select('*, servicios(nombre, precio, duracion_min)')
      .filter('id::text', 'ilike', `${code.toLowerCase()}%`)
      .single()

    setBuscando(false)

    if (err || !data) {
      setError('No encontramos una cita con ese código.')
      return
    }
    if (data.estado === 'cancelada') {
      setError('Esa cita ya fue cancelada.')
      return
    }
    if (data.estado === 'completada') {
      setError('Esa cita ya está completada y no se puede cancelar.')
      return
    }
    setCita(data)
  }

  async function cancelar() {
    setCancelando(true)
    const { error: err } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', cita.id)
    setCancelando(false)
    if (err) {
      setError('No se pudo cancelar. Intenta de nuevo.')
      return
    }
    setCancelada(true)
  }

  const { fecha, hora } = cita ? formatFecha(cita.inicio) : {}

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

        {/* ── Estado: cita cancelada exitosamente ── */}
        {cancelada ? (
          <div className="text-center py-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }}
            >
              <span style={{ color: '#888', fontSize: '24px' }}>✕</span>
            </div>
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Cita cancelada
            </h2>
            <p className="mb-8" style={{ color: '#666' }}>Tu cita fue cancelada exitosamente.</p>
            <a
              href="/"
              className="block w-full font-bold py-4 rounded-2xl text-center"
              style={{ background: '#c41230', color: '#fff', fontSize: '14px', textDecoration: 'none' }}
            >
              Agendar nueva cita
            </a>
          </div>

        /* ── Estado: confirmar cancelación ── */
        ) : cita ? (
          <div>
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ¿Cancelar esta cita?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#666' }}>
              Esta acción no se puede deshacer.
            </p>

            <div
              className="rounded-2xl p-4 mb-6 text-sm space-y-2"
              style={{ background: '#151515', border: '1px solid #252525' }}
            >
              <div className="flex justify-between">
                <span style={{ color: '#666' }}>Servicio</span>
                <strong className="text-white">{cita.servicios?.nombre}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#666' }}>Fecha</span>
                <strong className="text-white capitalize">{fecha}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#666' }}>Hora</span>
                <strong className="text-white">{hora}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#666' }}>Cliente</span>
                <strong className="text-white">{cita.cliente_nombre}</strong>
              </div>
            </div>

            {error && (
              <p className="text-sm text-center mb-4" style={{ color: '#c41230' }}>{error}</p>
            )}

            <button
              onClick={cancelar}
              disabled={cancelando}
              className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95"
              style={{
                background: cancelando ? '#1a1a1a' : '#c41230',
                color: cancelando ? '#555' : '#fff',
                fontSize: '15px',
              }}
            >
              {cancelando ? 'Cancelando…' : 'Sí, cancelar cita'}
            </button>

            <button
              onClick={() => { setCita(null); setError(null) }}
              className="mt-3 w-full text-xs uppercase tracking-widest py-2 transition-all"
              style={{ color: '#555', letterSpacing: '0.15em', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c41230')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >
              ← Volver
            </button>
          </div>

        /* ── Estado: ingresar código ── */
        ) : (
          <div>
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Cancelar cita
            </h2>
            <p className="text-sm mb-8" style={{ color: '#666' }}>
              Ingresa el código de 8 caracteres que recibiste al agendar.
            </p>

            <form onSubmit={buscar} className="space-y-4">
              <div>
                <label
                  className="block text-xs uppercase mb-1.5"
                  style={{ color: '#555', letterSpacing: '0.15em' }}
                >
                  Código de cita
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={e =>
                    setCodigo(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8))
                  }
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#888')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                />
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: '#c41230' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={buscando || codigo.length !== 8}
                className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95"
                style={{
                  background: (buscando || codigo.length !== 8) ? '#1a1a1a' : '#c41230',
                  color: (buscando || codigo.length !== 8) ? '#555' : '#fff',
                  fontSize: '15px',
                  cursor: codigo.length !== 8 ? 'not-allowed' : 'pointer',
                }}
              >
                {buscando ? 'Buscando…' : 'Buscar cita'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <a
                href="/"
                className="text-xs uppercase tracking-widest"
                style={{ color: '#555', letterSpacing: '0.15em', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c41230')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              >
                ← Volver al inicio
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
