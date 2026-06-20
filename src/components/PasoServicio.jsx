// PasoServicio.jsx — Paso 1: el cliente elige el servicio

// Formatea un precio en pesos colombianos: 25000 → "$25.000"
function formatPrecio(valor) {
  return '$' + valor.toLocaleString('es-CO')
}

export default function PasoServicio({ servicios, onSeleccionar }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">¿Qué servicio necesitas?</h2>
      <p className="text-gray-500 text-sm mb-6">Elige uno para ver la disponibilidad.</p>

      <div className="flex flex-col gap-3">
        {servicios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSeleccionar(s)}
            className="w-full flex justify-between items-center px-5 py-4
                       bg-white border border-gray-200 rounded-2xl shadow-sm
                       hover:border-gray-800 hover:shadow-md
                       active:scale-95 transition-all text-left"
          >
            <div>
              <p className="font-semibold text-gray-800">{s.nombre}</p>
              <p className="text-sm text-gray-400 mt-0.5">{s.duracion_min} min</p>
            </div>
            <span className="font-bold text-gray-700 text-lg">{formatPrecio(s.precio)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
