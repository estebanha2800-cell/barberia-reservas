// Confirmacion.jsx — Pantalla final después de agendar exitosamente

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function Confirmacion({ cita, onNueva }) {
  // cita contiene: id, cliente_nombre, servicio (objeto), fecha (Date), slot (objeto)
  const { id, cliente_nombre, servicio, fecha, slot } = cita

  // El código que ve el cliente: primeros 8 caracteres del UUID en mayúsculas
  const codigo = id.replace(/-/g, '').substring(0, 8).toUpperCase()

  const fechaTexto = `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`

  return (
    <div className="text-center py-4">
      {/* Ícono de éxito */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">✅</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cita confirmada!</h2>
      <p className="text-gray-500 mb-8">
        Listo, {cliente_nombre.split(' ')[0]}. Te esperamos.
      </p>

      {/* Código de cita */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Código de cita</p>
        <p className="text-3xl font-mono font-bold tracking-widest">{codigo}</p>
        <p className="text-xs text-gray-400 mt-2">Guarda este código por si necesitas cancelar</p>
      </div>

      {/* Detalle */}
      <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm text-gray-600 space-y-2 mb-8">
        <div className="flex justify-between">
          <span>Servicio</span>
          <strong className="text-gray-800">{servicio.nombre}</strong>
        </div>
        <div className="flex justify-between">
          <span>Fecha</span>
          <strong className="text-gray-800">{fechaTexto}</strong>
        </div>
        <div className="flex justify-between">
          <span>Hora</span>
          <strong className="text-gray-800">{slot.etiqueta}</strong>
        </div>
        <div className="flex justify-between">
          <span>Duración</span>
          <strong className="text-gray-800">{servicio.duracion_min} min</strong>
        </div>
      </div>

      <button
        onClick={onNueva}
        className="w-full border-2 border-gray-900 text-gray-900 font-bold py-4 rounded-2xl
                   hover:bg-gray-900 hover:text-white active:scale-95 transition-all"
      >
        Agendar otra cita
      </button>
    </div>
  )
}
