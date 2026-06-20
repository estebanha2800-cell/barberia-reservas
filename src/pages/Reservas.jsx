// pages/Reservas.jsx — Página principal de reservas
// Maneja el flujo de 4 pasos: Servicio → Fecha → Hora → Datos → Confirmación

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Cargando        from '../components/Cargando.jsx'
import PasoServicio    from '../components/PasoServicio.jsx'
import PasoFecha       from '../components/PasoFecha.jsx'
import PasoHorario     from '../components/PasoHorario.jsx'
import PasoDatos       from '../components/PasoDatos.jsx'
import Confirmacion    from '../components/Confirmacion.jsx'

// Los pasos del flujo
const PASOS = ['servicio', 'fecha', 'horario', 'datos', 'confirmacion']

export default function Reservas() {
  // ── Estado global de la app ──────────────────────────────
  const [paso,      setPaso]      = useState('servicio')
  const [servicios, setServicios] = useState([])
  const [barbero,   setBarbero]   = useState(null)
  const [cargandoInit, setCargandoInit] = useState(true)
  const [errorInit, setErrorInit] = useState(null)

  // Selecciones del cliente
  const [servicioSel, setServicioSel] = useState(null)
  const [fechaSel,    setFechaSel]    = useState(null)
  const [slotSel,     setSlotSel]     = useState(null)

  // Estado del envío
  const [guardando,  setGuardando]  = useState(false)
  const [errorGuard, setErrorGuard] = useState(null)
  const [citaGuardada, setCitaGuardada] = useState(null)

  // ── Carga inicial: servicios y barbero ───────────────────
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [{ data: svcs, error: eS }, { data: barbs, error: eB }] = await Promise.all([
          supabase.from('servicios').select('*').eq('activo', true).order('precio'),
          supabase.from('barberos').select('*').eq('activo', true).limit(1),
        ])

        if (eS || eB) throw new Error('Error al cargar los datos.')
        if (!barbs?.length) throw new Error('No hay barbero disponible.')

        setServicios(svcs)
        setBarbero(barbs[0])
      } catch (err) {
        setErrorInit(err.message)
      } finally {
        setCargandoInit(false)
      }
    }

    cargarDatos()
  }, [])

  // ── Guarda la cita en Supabase ───────────────────────────
  async function confirmarCita({ nombre, telefono }) {
    setGuardando(true)
    setErrorGuard(null)

    try {
      const { data, error } = await supabase
        .from('citas')
        .insert({
          cliente_nombre:   nombre,
          cliente_telefono: telefono,
          servicio_id:      servicioSel.id,
          barbero_id:       barbero.id,
          inicio:           slotSel.inicioISO,
          fin:              slotSel.finISO,
          estado:           'confirmada',
        })
        .select()
        .single()

      if (error) {
        // Si hay conflicto de horario (choque de citas en Supabase), informamos
        if (error.code === '23P01' || error.message?.includes('overlap')) {
          setErrorGuard('Esa hora ya fue tomada. Por favor elige otra.')
        } else {
          setErrorGuard('Ocurrió un error al agendar. Intenta de nuevo.')
        }
        return
      }

      setCitaGuardada({
        id:             data.id,
        cliente_nombre: nombre,
        servicio:       servicioSel,
        fecha:          fechaSel,
        slot:           slotSel,
      })
      setPaso('confirmacion')

    } catch {
      setErrorGuard('Error de conexión. Revisa tu internet e intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  // ── Reiniciar para nueva cita ────────────────────────────
  function reiniciar() {
    setServicioSel(null)
    setFechaSel(null)
    setSlotSel(null)
    setCitaGuardada(null)
    setErrorGuard(null)
    setPaso('servicio')
  }

  // ── Índice del paso actual (para la barra de progreso) ───
  const indicePaso = PASOS.indexOf(paso)

  // ── Renderizado ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Encabezado */}
      <header className="bg-gray-900 text-white px-5 py-5">
        <h1 className="text-lg font-bold tracking-wide">✂️ Barbería</h1>
        <p className="text-xs text-gray-400 mt-0.5">Agenda tu cita en segundos</p>
      </header>

      {/* Barra de progreso (solo en los 4 pasos de reserva) */}
      {paso !== 'confirmacion' && !cargandoInit && !errorInit && (
        <div className="flex gap-1 px-5 pt-4">
          {['servicio','fecha','horario','datos'].map((p, i) => (
            <div
              key={p}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300
                ${i <= indicePaso ? 'bg-gray-900' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 px-5 py-6 max-w-md mx-auto w-full">

        {/* Cargando datos iniciales */}
        {cargandoInit && <Cargando texto="Cargando servicios…" />}

        {/* Error inicial */}
        {errorInit && (
          <div className="bg-red-50 text-red-600 rounded-2xl p-5 text-center">
            <p className="font-semibold mb-1">Algo salió mal</p>
            <p className="text-sm">{errorInit}</p>
          </div>
        )}

        {/* ── Paso 1: Elegir servicio ── */}
        {!cargandoInit && !errorInit && paso === 'servicio' && (
          <PasoServicio
            servicios={servicios}
            onSeleccionar={(s) => { setServicioSel(s); setPaso('fecha') }}
          />
        )}

        {/* ── Paso 2: Elegir fecha ── */}
        {paso === 'fecha' && (
          <PasoFecha
            servicio={servicioSel}
            onSeleccionar={(f) => { setFechaSel(f); setPaso('horario') }}
            onVolver={() => setPaso('servicio')}
          />
        )}

        {/* ── Paso 3: Elegir hora ── */}
        {paso === 'horario' && (
          <PasoHorario
            barberoId={barbero.id}
            servicio={servicioSel}
            fecha={fechaSel}
            onSeleccionar={(s) => { setSlotSel(s); setPaso('datos') }}
            onVolver={() => setPaso('fecha')}
          />
        )}

        {/* ── Paso 4: Datos del cliente ── */}
        {paso === 'datos' && (
          <>
            <PasoDatos
              servicio={servicioSel}
              fecha={fechaSel}
              slot={slotSel}
              onConfirmar={confirmarCita}
              onVolver={() => setPaso('horario')}
              guardando={guardando}
            />
            {errorGuard && (
              <div className="mt-3 bg-red-50 text-red-600 rounded-xl p-3 text-sm text-center">
                {errorGuard}
              </div>
            )}
          </>
        )}

        {/* ── Confirmación ── */}
        {paso === 'confirmacion' && citaGuardada && (
          <Confirmacion
            cita={citaGuardada}
            onNueva={reiniciar}
          />
        )}

      </main>
    </div>
  )
}
