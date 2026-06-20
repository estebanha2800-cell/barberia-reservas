// lib/festivos.js
// Calcula los festivos colombianos para un año dado.
// Incluye festivos fijos, festivos movibles (Ley Emiliani)
// y los días relativos a Semana Santa.

// ── Algoritmo de Butcher para calcular la fecha de Pascua ──────
function calcularPascua(anio) {
  const a = anio % 19
  const b = Math.floor(anio / 100)
  const c = anio % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31) // 1-indexed
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anio, mes - 1, dia)
}

// ── Mueve una fecha al siguiente lunes (Ley Emiliani) ──────────
function siguienteLunes(fecha) {
  const d = new Date(fecha)
  const diaSemana = d.getDay() // 0=dom, 1=lun
  if (diaSemana !== 1) {
    d.setDate(d.getDate() + ((8 - diaSemana) % 7))
  }
  return d
}

// ── Agrega días a una fecha ────────────────────────────────────
function sumarDias(fecha, dias) {
  const d = new Date(fecha)
  d.setDate(d.getDate() + dias)
  return d
}

// ── Normaliza: solo año, mes, día sin hora ─────────────────────
function soloFecha(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Devuelve true si la fecha (Date) es festivo en Colombia.
 * @param {Date} fecha
 * @returns {boolean}
 */
export function esFestivoColombia(fecha) {
  const anio = fecha.getFullYear()
  const mes  = fecha.getMonth() + 1  // 1-indexed
  const dia  = fecha.getDate()

  // ── Festivos fijos ─────────────────────────────────────────
  const fijos = [
    [1,  1],  // Año Nuevo
    [5,  1],  // Día del Trabajo
    [7,  20], // Grito de Independencia
    [8,  7],  // Batalla de Boyacá
    [12, 8],  // Inmaculada Concepción
    [12, 25], // Navidad
  ]

  for (const [m, d] of fijos) {
    if (mes === m && dia === d) return true
  }

  // ── Festivos movibles (Ley Emiliani) ──────────────────────
  // Se trasladan al siguiente lunes si no caen en lunes.
  const emiliani = [
    new Date(anio, 0,  6),  // Reyes Magos
    new Date(anio, 2,  19), // San José
    new Date(anio, 5,  29), // San Pedro y San Pablo
    new Date(anio, 7,  15), // Asunción de la Virgen
    new Date(anio, 9,  12), // Día de la Raza
    new Date(anio, 10, 1),  // Todos los Santos
    new Date(anio, 10, 11), // Independencia de Cartagena
  ]

  for (const f of emiliani) {
    const lunes = siguienteLunes(f)
    if (lunes.getMonth() + 1 === mes && lunes.getDate() === dia) return true
  }

  // ── Festivos relativos a Pascua ────────────────────────────
  const pascua = calcularPascua(anio)

  // Jueves y Viernes Santo: fijos respecto a Pascua
  const semanaSanta = [
    soloFecha(sumarDias(pascua, -3)), // Jueves Santo
    soloFecha(sumarDias(pascua, -2)), // Viernes Santo
  ]
  for (const f of semanaSanta) {
    if (f.getMonth() + 1 === mes && f.getDate() === dia) return true
  }

  // Ascensión, Corpus Christi y Sagrado Corazón: Ley Emiliani
  const relativosEmiliani = [
    siguienteLunes(sumarDias(pascua, 39)), // Ascensión
    siguienteLunes(sumarDias(pascua, 60)), // Corpus Christi
    siguienteLunes(sumarDias(pascua, 68)), // Sagrado Corazón
  ]
  for (const f of relativosEmiliani) {
    if (f.getMonth() + 1 === mes && f.getDate() === dia) return true
  }

  return false
}
