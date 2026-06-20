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
  confirmada:     { label: 'Confirmada',     color: 'bg-blue-100 text-blue-700' },
  completada:     { label: 'Completada',     color: 'bg-green-100 text-green-700' },
  cancelada:      { label: 'Cancelada',      color: 'bg-red-100 text-red-700' },
  no_se_presento: { label: 'No se presentó', color: 'bg-amber-100 text-amber-700' },
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
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-3 border border-gray-100">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          {mostrarFecha && (
            <p className="text-xs text-gray-400 mb-0.5 capitalize">{isoAFechaCorta(cita.inicio)}</p>
          )}
          <p className="font-bold text-gray-900">
            {isoAHoraCol(cita.inicio)} · {cita.servicios?.nombre}
          </p>
          <p className="text-sm text-gray-700 font-medium truncate">{cita.cliente_nombre}</p>
          <p className="text-xs text-gray-400">{cita.cliente_telefono}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${est.color}`}>
          {est.label}
        </span>
      </div>

      {/* Info servicio */}
      <p className="text-xs text-gray-400 mt-1">
        {cita.servicios?.duracion_min} min ·{' '}
        ${cita.servicios?.precio?.toLocaleString('es-CO')}
      </p>

      {/* Acciones (solo si está confirmada) */}
      {cita.estado === 'confirmada' && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => cambiar('completada')}
            disabled={guardando}
            className="flex-1 text-xs bg-green-600 text-white py-2 rounded-xl font-semibold
                       hover:bg-green-700 active:scale-95 transition-all disabled:opacity-40"
          >
            ✓ Completada
          </button>
          <button
            onClick={() => cambiar('no_se_presento')}
            disabled={guardando}
            className="flex-1 text-xs bg-amber-500 text-white py-2 rounded-xl font-semibold
                       hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-40"
          >
            No vino
          </button>
          <button
            onClick={() => cambiar('cancelada')}
            disabled={guardando}
            className="flex-1 text-xs bg-red-500 text-white py-2 rounded-xl font-semibold
                       hover:bg-red-600 active:scale-95 transition-all disabled:opacity-40"
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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-gray-900 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold">✂️ Panel del Barbero</h1>
          <p className="text-xs text-gray-400 capitalize">{fechaHoy}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarCitas}
            className="text-xs text-gray-400 hover:text-white transition-colors"
            title="Recargar citas"
          >
            ↻
          </button>
          <button
            onClick={onLogout}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Salir →
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 px-2">
        {[
          ['hoy',      `Hoy${confirmadas > 0 ? ` (${confirmadas})` : ''}`],
          ['proximas', 'Próximas'],
          ['bloquear', 'Bloquear'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <main className="flex-1 px-5 py-5 max-w-md mx-auto w-full">

        {/* Loading */}
        {cargando && (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando citas…</div>
        )}

        {/* Tab: Hoy */}
        {!cargando && tab === 'hoy' && (
          <>
            <p className="text-sm text-gray-500 mb-4">
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
            <p className="text-sm text-gray-500 mb-4">
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
            <h2 className="font-bold text-gray-800 text-lg">Bloquear horario</h2>
            <p className="text-sm text-gray-500">
              Los clientes no podrán agendar en el período bloqueado.
            </p>

            {/* Fecha */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest">Fecha</label>
              <input
                type="date"
                value={bFecha}
                onChange={e => setBFecha(e.target.value)}
                min={hoyCol()}
                required
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Toggle día completo */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setBDiaCompleto(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors ${bDiaCompleto ? 'bg-gray-900' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                  bDiaCompleto ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="text-sm text-gray-700">Día completo</span>
            </label>

            {/* Horas (solo si no es día completo) */}
            {!bDiaCompleto && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-widest">Desde</label>
                  <input
                    type="time"
                    value={bInicio}
                    onChange={e => setBInicio(e.target.value)}
                    required
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-widest">Hasta</label>
                  <input
                    type="time"
                    value={bFin}
                    onChange={e => setBFin(e.target.value)}
                    required
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest">Motivo (opcional)</label>
              <input
                type="text"
                value={bMotivo}
                onChange={e => setBMotivo(e.target.value)}
                placeholder="Ej: almuerzo, médico, vacaciones…"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Mensaje de feedback */}
            {mensajeB && (
              <p className={`text-sm text-center font-semibold ${
                mensajeB.tipo === 'ok' ? 'text-green-600' : 'text-red-500'
              }`}>
                {mensajeB.texto}
              </p>
            )}

            <button
              type="submit"
              disabled={guardandoB}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl
                         hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {guardandoB ? 'Guardando…' : 'Bloquear horario'}
            </button>
          </form>
        )}

      </main>
    </div>
  )
}
