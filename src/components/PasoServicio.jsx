// PasoServicio.jsx — Paso 1: el cliente elige el servicio

function formatPrecio(valor) {
  return '$' + valor.toLocaleString('es-CO')
}

export default function PasoServicio({ servicios, onSeleccionar }) {
  return (
    <div>
      <h2
        className="text-2xl font-bold text-white mb-1"
        style={{fontFamily:"'Playfair Display', Georgia, serif"}}
      >
        ¿Qué servicio?
      </h2>
      <p className="text-sm mb-6" style={{color:'#666'}}>Elige uno para ver disponibilidad.</p>

      <div className="flex flex-col gap-3">
        {servicios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSeleccionar(s)}
            className="w-full flex justify-between items-center px-5 py-4 text-left
                       transition-all active:scale-95"
            style={{
              background:'#151515',
              border:'1px solid #252525',
              borderRadius:'16px',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#c41230'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#252525'}
          >
            <div>
              <p className="font-semibold text-white">{s.nombre}</p>
              <p className="text-xs mt-0.5" style={{color:'#666'}}>{s.duracion_min} min</p>
            </div>
            <span className="font-bold text-lg" style={{color:'#c41230'}}>{formatPrecio(s.precio)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
