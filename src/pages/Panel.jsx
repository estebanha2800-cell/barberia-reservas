// pages/Panel.jsx — Panel privado del barbero
// Tabs: Hoy | Próximas | Bloquear
// Acceso: solo usuarios autenticados (controlado en App.jsx)

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

// ── Helpers de fecha Colombia (UTC-5, sin DST) ────────────────────

/** Retorna la fecha de hoy en Colombia como string YYYY-MM-DD */
function hoyCol() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

/** Formatea ISO timestamp a hora Colombia "09:30" */
function isoAHoraCol(iso) {
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
  })
}

/** Formatea ISO timestamp a fecha Colombia "lun. 23 jun." */
function isoAFechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Bogota',
  })
}

/** Suma N días a una fecha YYYY-MM-DD */
function sumarDias(fechaStr, n) {
  const d = new Date(fechaStr + 'T12:00:00-05:00')
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

// ── Config de estados ─────────────────────────────────────────────

const ESTADOS = {
  confirmada:     { label: 'Confirmada',     style: {background:'#1a2a3a', color:'#60a5fa'} },
  completada:     { label: 'Completada',     style: {background:'#0f2a1a', color:'#4ade80'} },
  cancelada:      { label: 'Cancelada',      style: {background:'#2a0f0f', color:'#f87171'} },
  no_se_presento: { label: 'No se presentó', style: {background:'#2a1f0a', color:'#fbbf24'} },
}

// ── Componente tarjeta de cita ────────────────────────────────────

function CitaCard({ cita, mostrarFecha, onCambiarEstado }) {
  const [guardando, setGuardando] = useState(false)
  const est = ESTADOS[cita.estado] ?? ESTADOS.confirmada

  async function cambiar(nuevoEstado) {
    setGuardando(true)
    await onCambiarEstado(cita.id, nuevoEstado)
    setGuardando(false)
  }

  return (
    <div
      className="rounded-2xl p-4 mb-3"
      style={{background:'#151515', border:'1px solid #252525'}}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          {mostrarFecha && (
            <p className="text-xs mb-0.5 capitalize" style={{color:'#555'}}>{isoAFechaCorta(cita.inicio)}</p>
          )}
          <p className="font-bold text-white">
            {isoAHoraCol(cita.inicio)} · {cita.servicios?.nombre}
          </p>
          <p className="text-sm font-medium truncate" style={{color:'#f0f0f0'}}>{cita.cliente_nombre}</p>
          <p className="text-xs" style={{color:'#555'}}>{cita.cliente_telefono}</p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
          style={est.style}
        >
          {est.label}
        </span>
      </div>

      <p className="text-xs mt-1" style={{color:'#555'}}>
        {cita.servicios?.duracion_min} min · ${cita.servicios?.precio?.toLocaleString('es-CO')}
      </p>

      {cita.estado === 'confirmada' && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => cambiar('completada')}
            disabled={guardando}
            className="flex-1 text-xs py-2 rounded-xl font-semibold active:scale-95 transition-all disabled:opacity-40"
            style={{background:'#0f2a1a', color:'#4ade80', border:'1px solid #1a3a2a'}}
          >
            ✓ Completada
          </button>
          <button
            onClick={() => cambiar('no_se_presento')}
            disabled={guardando}
            className="flex-1 text-xs py-2 rounded-xl font-semibold active:scale-95 transition-all disabled:opacity-40"
            style={{background:'#2a1f0a', color:'#fbbf24', border:'1px solid #3a2f1a'}}
          >
            No vino
          </button>
          <button
            onClick={() => cambiar('cancelada')}
            disabled={guardando}
            className="flex-1 text-xs py-2 rounded-xl font-semibold active:scale-95 transition-all disabled:opacity-40"
            style={{background:'#2a0f0f', color:'#f87171', border:'1px solid #3a1f1f'}}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

// ── Componente principal Panel ────────────────────────────────────

export default function Panel({ onLogout }) {
  const [tab,       setTab]       = useState('hoy')
  const [citasHoy,  setCitasHoy]  = useState([])
  const [citasProx, setCitasProx] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [barberoId, setBarberoId] = useState(null)

  // Estado formulario bloqueo
  const [bFecha,    setBFecha]    = useState(hoyCol())
  const [bInicio,   setBInicio]   = useState('09:00')
  const [bFin,      setBFin]      = useState('10:00')
  const [bMotivo,   setBMotivo]   = useState('')
  const [bDiaCompleto, setBDiaCompleto] = useState(false)
  const [guardandoB, setGuardandoB] = useState(false)
  const [mensajeB,   setMensajeB]   = useState(null) // {tipo: 'ok'|'error', texto}

  // Cargar barbero ID una sola vez
  useEffect(() => {
    supabase.from('barberos').select('id').eq('activo', true).limit(1).single()
      .then(({ data }) => { if (data) setBarberoId(data.id) })
  }, [])

  // ── Cargar citas ────────────────────────────────────────────────
  const cargarCitas = useCallback(async () => {
    setCargando(true)
    const hoy      = hoyCol()
    const manana   = sumarDias(hoy, 1)
    const en7dias  = sumarDias(hoy, 7)

    const [{ data: dHoy }, { data: dProx }] = await Promise.all([
      supabase.from('citas')
        .select('*, servicios(nombre, duracion_min, precio)')
        .gte('inicio', `${hoy}T00:00:00-05:00`)
        .lte('inicio', `${hoy}T23:59:59-05:00`)
        .order('inicio'),
      supabase.from('citas')
        .select('*, servicios(nombre, duracion_min, precio)')
        .gte('inicio', `${manana}T00:00:00-05:00`)
        .lte('inicio', `${en7dias}T23:59:59-05:00`)
        .order('inicio'),
    ])

    setCitasHoy(dHoy   ?? [])
    setCitasProx(dProx ?? [])
    setCargando(false)
  }, [])

  useEffect(() => { cargarCitas() }, [cargarCitas])

  // ── Cambiar estado de cita ──────────────────────────────────────
  async function cambiarEstado(citaId, nuevoEstado) {
    await supabase.from('citas').update({ estado: nuevoEstado }).eq('id', citaId)
    await cargarCitas()
  }

  // ── Crear bloqueo ───────────────────────────────────────────────
  async function crearBloqueo(e) {
    e.preventDefault()
    if (!barberoId) return
    setGuardandoB(true)
    setMensajeB(null)

    const inicioISO = bDiaCompleto
      ? `${bFecha}T00:00:00-05:00`
      : `${bFecha}T${bInicio}:00-05:00`
    const finISO = bDiaCompleto
      ? `${bFecha}T23:59:00-05:00`
      : `${bFecha}T${bFin}:00-05:00`

    // Validar que fin > inicio
    if (new Date(finISO) <= new Date(inicioISO)) {
      setMensajeB({ tipo: 'error', texto: 'La hora de fin debe ser posterior al inicio.' })
      setGuardandoB(false)
      return
    }

    const { error } = await supabase.from('bloqueos').insert({
      barbero_id: barberoId,
      inicio:     inicioISO,
      fin:        finISO,
      motivo:     bMotivo.trim() || null,
    })

    setGuardandoB(false)

    if (error) {
      setMensajeB({ tipo: 'error', texto: 'Error al guardar el bloqueo. Intenta de nuevo.' })
    } else {
      setMensajeB({ tipo: 'ok', texto: '✓ Horario bloqueado exitosamente.' })
      setBMotivo('')
      setBDiaCompleto(false)
      setTimeout(() => setMensajeB(null), 4000)
    }
  }

  // ── Fecha y hora de hoy para el header ─────────────────────────
  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota',
  })

  // Contar confirmadas hoy
  const confirmadas = citasHoy.filter(c => c.estado === 'confirmada').length

  // ── Render ──────────────────────────────────────────────────────
  const panelInput = {
    background:'#151515',
    border:'1px solid #2a2a2a',
    borderRadius:'12px',
    padding:'10px 14px',
    color:'#f0f0f0',
    fontSize:'14px',
    width:'100%',
    outline:'none',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background:'#0a0a0a', color:'#f0f0f0'}}>

      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between" style={{borderBottom:'1px solid #1e1e1e'}}>
        <div>
          <h1
            className="font-bold text-white"
            style={{fontFamily:"'Playfair Display', Georgia, serif", fontSize:'20px', letterSpacing:'0.08em'}}
          >
            Opera
          </h1>
          <p className="text-xs capitalize mt-0.5" style={{color:'#555'}}>{fechaHoy}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={cargarCitas}
            className="transition-colors text-lg"
            style={{color:'#555'}}
            onMouseEnter={e => (e.currentTarget.style.color='#fff')}
            onMouseLeave={e => (e.currentTarget.style.color='#555')}
            title="Recargar"
          >
            ↻
          </button>
          <button
            onClick={onLogout}
            className="text-xs uppercase transition-colors"
            style={{color:'#555', letterSpacing:'0.12em'}}
            onMouseEnter={e => (e.currentTarget.style.color='#c41230')}
            onMouseLeave={e => (e.currentTarget.style.color='#555')}
          >
            Salir →
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-2" style={{borderBottom:'1px solid #1e1e1e'}}>
        {[
          ['hoy',      `Hoy${confirmadas > 0 ? ` (${confirmadas})` : ''}`],
          ['proximas', 'Próximas'],
          ['bloquear', 'Bloquear'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="py-3 px-4 text-sm font-semibold transition-colors"
            style={{
              borderBottom: tab === key ? '2px solid #c41230' : '2px solid transparent',
              color: tab === key ? '#fff' : '#555',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <main className="flex-1 px-5 py-5 max-w-md mx-auto w-full">

        {cargando && (
          <div className="text-center py-12 text-sm" style={{color:'#555'}}>Cargando citas…</div>
        )}

        {/* Tab: Hoy */}
        {!cargando && tab === 'hoy' && (
          <>
            <p className="text-sm mb-4" style={{color:'#555'}}>
              {citasHoy.length === 0
                ? 'Sin citas para hoy'
                : `${citasHoy.length} cita${citasHoy.length !== 1 ? 's' : ''} hoy`}
            </p>
            {citasHoy.map(c => (
              <CitaCard key={c.id} cita={c} onCambiarEstado={cambiarEstado} />
            ))}
          </>
        )}

        {/* Tab: Próximas */}
        {!cargando && tab === 'proximas' && (
          <>
            <p className="text-sm mb-4" style={{color:'#555'}}>
              {citasProx.length === 0
                ? 'Sin citas en los próximos 7 días'
                : `${citasProx.length} cita${citasProx.length !== 1 ? 's' : ''} próximas`}
            </p>
            {citasProx.map(c => (
              <CitaCard key={c.id} cita={c} mostrarFecha onCambiarEstado={cambiarEstado} />
            ))}
          </>
        )}

        {/* Tab: Bloquear */}
        {tab === 'bloquear' && (
          <form onSubmit={crearBloqueo} className="space-y-4">
            <h2
              className="font-bold text-white text-xl"
              style={{fontFamily:"'Playfair Display', Georgia, serif"}}
            >
              Bloquear horario
            </h2>
            <p className="text-sm" style={{color:'#555'}}>
              Los clientes no podrán agendar en el período bloqueado.
            </p>

            <div>
              <label className="text-xs uppercase mb-1.5 block" style={{color:'#555', letterSpacing:'0.15em'}}>Fecha</label>
              <input
                type="date"
                value={bFecha}
                onChange={e => setBFecha(e.target.value)}
                min={hoyCol()}
                required
                style={panelInput}
                onFocus={e => (e.currentTarget.style.borderColor='#888')}
                onBlur={e => (e.currentTarget.style.borderColor='#2a2a2a')}
              />
            </div>

            {/* Toggle día completo */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setBDiaCompleto(v => !v)}
                className="w-10 h-6 rounded-full transition-colors"
                style={{background: bDiaCompleto ? '#c41230' : '#2a2a2a'}}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform"
                  style={{transform: bDiaCompleto ? 'translateX(18px)' : 'translateX(2px)'}}
                />
              </div>
              <span className="text-sm" style={{color:'#f0f0f0'}}>Día completo</span>
            </label>

            {!bDiaCompleto && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs uppercase mb-1.5 block" style={{color:'#555', letterSpacing:'0.15em'}}>Desde</label>
                  <input
                    type="time"
                    value={bInicio}
                    onChange={e => setBInicio(e.target.value)}
                    required
                    style={panelInput}
                    onFocus={e => (e.currentTarget.style.borderColor='#888')}
                    onBlur={e => (e.currentTarget.style.borderColor='#2a2a2a')}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase mb-1.5 block" style={{color:'#555', letterSpacing:'0.15em'}}>Hasta</label>
                  <input
                    type="time"
                    value={bFin}
                    onChange={e => setBFin(e.target.value)}
                    required
                    style={panelInput}
                    onFocus={e => (e.currentTarget.style.borderColor='#888')}
                    onBlur={e => (e.currentTarget.style.borderColor='#2a2a2a')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs uppercase mb-1.5 block" style={{color:'#555', letterSpacing:'0.15em'}}>Motivo (opcional)</label>
              <input
                type="text"
                value={bMotivo}
                onChange={e => setBMotivo(e.target.value)}
                placeholder="Ej: almuerzo, médico, vacaciones…"
                style={panelInput}
                onFocus={e => (e.currentTarget.style.borderColor='#888')}
                onBlur={e => (e.currentTarget.style.borderColor='#2a2a2a')}
              />
            </div>

            {mensajeB && (
              <p className="text-sm text-center font-semibold" style={{color: mensajeB.tipo === 'ok' ? '#4ade80' : '#c41230'}}>
                {mensajeB.texto}
              </p>
            )}

            <button
              type="submit"
              disabled={guardandoB}
              className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95"
              style={{
                background: guardandoB ? '#1a1a1a' : '#c41230',
                color: guardandoB ? '#555' : '#fff',
                fontSize:'15px',
              }}
            >
              {guardandoB ? 'Guardando…' : 'Bloquear horario'}
            </button>
          </form>
        )}

      </main>
    </div>
  )
}
