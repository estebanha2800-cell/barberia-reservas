// lib/disponibilidad.js
// Calcula los slots de tiempo disponibles para una fecha, barbero y servicio.
// Lógica:
//  1. Si es domingo o festivo colombiano → no hay slots.
//  2. Se obtienen los bloques horarios del barbero para ese día.
//  3. Se obtienen citas existentes (no canceladas) y bloqueos del día.
//  4. Se generan slots cada INTERVALO_MIN minutos y se filtran los ocupados.

import { supabase } from './supabase.js'
import { esFestivoColombia } from './festivos.js'

// Colombia es UTC-5, sin cambio de horario
const COLOMBIA_UTC_OFFSET_MIN = -5 * 60

// Intervalo mínimo entre slots (duración del servicio más corto)
const INTERVALO_MIN = 20

// ── Conversores de timestamp ───────────────────────────────────

/**
 * Convierte una fecha local de Colombia (año, mes, día + hora, minuto)
 * en un ISO string con offset -05:00 para enviar a Supabase.
 */
export function toColombiaTimestamp(fecha, horas, minutos) {
  const a = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  const h = String(horas).padStart(2, '0')
  const min = String(minutos).padStart(2, '0')
  return `${a}-${m}-${d}T${h}:${min}:00-05:00`
}

/**
 * Extrae los minutos desde medianoche Colombia de un timestamp UTC de Supabase.
 * Ej: "2024-11-15T14:00:00+00:00" → 540 (son las 9:00 en Colombia)
 */
function timestampAMinutosCol(isoStr) {
  const d = new Date(isoStr)
  const minUtc = d.getUTCHours() * 60 + d.getUTCMinutes()
  // Colombia = UTC - 300 min; usar módulo para no salir del rango 0-1439
  return ((minUtc + COLOMBIA_UTC_OFFSET_MIN) % 1440 + 1440) % 1440
}

// ── Helpers ────────────────────────────────────────────────────

/** "09:30" → 570 */
function horaAMin(str) {
  const [h, m] = str.split(':').map(Number)
  return h * 60 + m
}

/** 570 → "09:30" */
function minAHora(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

/**
 * Obtiene los slots de tiempo disponibles.
 *
 * @param {string} barberoId  - UUID del barbero
 * @param {Date}   fecha      - Fecha en hora local (solo año/mes/día importa)
 * @param {number} duracionMin - Duración del servicio en minutos
 * @returns {Promise<Array<{etiqueta: string, inicioISO: string, finISO: string}>>}
 */
export async function obtenerSlots(barberoId, fecha, duracionMin) {
  // ── 1. Domingo o festivo → sin slots ──────────────────────
  const diaSemana = fecha.getDay() // 0 = domingo
  if (diaSemana === 0 || esFestivoColombia(fecha)) {
    return []
  }

  // ── 2. Horarios de atención para ese día ──────────────────
  const { data: horarios, error: errH } = await supabase
    .from('horarios_atencion')
    .select('hora_inicio, hora_fin')
    .eq('barbero_id', barberoId)
    .eq('dia_semana', diaSemana)

  if (errH || !horarios?.length) return []

  // ── 3. Rango del día en UTC para consultas ─────────────────
  // Inicio del día Colombia: 00:00 -05:00  →  05:00 UTC del mismo día
  // Fin del día Colombia: 23:59 -05:00  →  04:59 UTC del día siguiente
  const inicioDiaISO = toColombiaTimestamp(fecha, 0, 0)
  const finDiaISO    = toColombiaTimestamp(fecha, 23, 59)

  // ── 4. Citas existentes del día (sin las canceladas) ──────
  const { data: citas } = await supabase
    .from('citas')
    .select('inicio, fin')
    .eq('barbero_id', barberoId)
    .neq('estado', 'cancelada')
    .gte('inicio', inicioDiaISO)
    .lte('inicio', finDiaISO)

  // ── 5. Bloqueos que se crucen con el día ──────────────────
  const { data: bloqueos } = await supabase
    .from('bloqueos')
    .select('inicio, fin')
    .eq('barbero_id', barberoId)
    .lt('inicio', finDiaISO)
    .gt('fin', inicioDiaISO)

  // ── 6. Construir lista de ocupaciones en minutos Colombia ─
  const ocupadas = []

  for (const c of (citas ?? [])) {
    ocupadas.push({
      inicio: timestampAMinutosCol(c.inicio),
      fin:    timestampAMinutosCol(c.fin),
    })
  }

  for (const b of (bloqueos ?? [])) {
    // Un bloqueo puede abarcar varios días; recortamos al día actual
    const bInicioMin = timestampAMinutosCol(b.inicio)
    const bFinMin    = timestampAMinutosCol(b.fin)
    // Si inicio > fin, el bloqueo cruza medianoche; simplificamos recortando a 0-1439
    ocupadas.push({
      inicio: Math.max(0, bInicioMin),
      fin:    bFinMin < bInicioMin ? 1440 : Math.min(1440, bFinMin),
    })
  }

  // ── 7. Generar slots disponibles ──────────────────────────
  const slots = []

  for (const horario of horarios) {
    const bloqueInicio = horaAMin(horario.hora_inicio)
    const bloqueFin    = horaAMin(horario.hora_fin)

    let slotInicio = bloqueInicio

    while (slotInicio + duracionMin <= bloqueFin) {
      const slotFin = slotInicio + duracionMin

      // ¿Choca con alguna cita o bloqueo?
      const hayConflicto = ocupadas.some(
        (occ) => slotInicio < occ.fin && slotFin > occ.inicio
      )

      if (!hayConflicto) {
        const hIni = Math.floor(slotInicio / 60)
        const mIni = slotInicio % 60
        const hFin = Math.floor(slotFin / 60)
        const mFin = slotFin % 60

        slots.push({
          etiqueta:  minAHora(slotInicio),                           // "09:00"
          inicioISO: toColombiaTimestamp(fecha, hIni, mIni),        // para Supabase
          finISO:    toColombiaTimestamp(fecha, hFin, mFin),
        })
      }

      slotInicio += INTERVALO_MIN
    }
  }

  return slots
}
