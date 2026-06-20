// PasoDatos.jsx — Paso 4: el cliente ingresa nombre y teléfono y confirma

import { useState } from 'react'

// Valida un número de celular colombiano: 10 dígitos que empiezan por 3
function validarTelefono(tel) {
  return /^3\d{9}$/.test(tel.replace(/\s|-/g, ''))
}

// Nombres de los meses
const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function PasoDatos({ servicio, fecha, slot, onConfirmar, onVolver, guardando }) {
  const [nombre,    setNombre]    = useState('')
  const [telefono,  setTelefono]  = useState('')
  const [errores,   setErrores]   = useState({})

  function validar() {
    const errs = {}
    if (!nombre.trim()) errs.nombre = 'Escribe tu nombre completo.'
    if (!validarTelefono(telefono))
      errs.telefono = 'Ingresa un celular colombiano válido (10 dígitos, empieza por 3).'
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

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Tus datos</h2>
      <p className="text-gray-500 text-sm mb-6">
        Casi listo — solo necesitamos tu nombre y celular.
      </p>

      {/* Resumen de la cita */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Servicio</span>
          <strong className="text-gray-800">{servicio.nombre}</strong>
        </div>
        <div className="flex justify-between">
          <span>Fecha y hora</span>
          <strong className="text-gray-800">{fechaTexto}</strong>
        </div>
        <div className="flex justify-between">
          <span>Duración</span>
          <strong className="text-gray-800">{servicio.duracion_min} min</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className={`w-full border rounded-xl px-4 py-3 text-gray-800 text-sm
                        focus:outline-none focus:ring-2 focus:ring-gray-800
                        ${errores.nombre ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.nombre && (
            <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefono">
            Número de celular
          </label>
          <input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 3001234567"
            inputMode="numeric"
            className={`w-full border rounded-xl px-4 py-3 text-gray-800 text-sm
                        focus:outline-none focus:ring-2 focus:ring-gray-800
                        ${errores.telefono ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errores.telefono && (
            <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl
                     hover:bg-gray-700 active:scale-95 transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {guardando ? 'Agendando…' : 'Confirmar cita'}
        </button>
      </form>

      <button
        onClick={onVolver}
        className="mt-4 w-full text-sm text-gray-400 underline hover:text-gray-700"
      >
        ← Cambiar hora
      </button>
    </div>
  )
}
