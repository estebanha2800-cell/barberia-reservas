// Confirmacion.jsx — Pantalla final después de agendar exitosamente

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

export default function Confirmacion({ cita, onNueva }) {
  const { cliente_nombre, servicio, fecha, slot } = cita
  const fechaTexto = `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`
  const primerNombre = cliente_nombre.split(' ')[0]

  return (
    <div className="text-center py-4">

      {/* Ícono */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{background:'#1a1a1a', border:'1px solid #c41230'}}
      >
        <span style={{color:'#c41230', fontSize:'24px'}}>✓</span>
      </div>

      <h2
        className="text-3xl font-bold text-white mb-2"
        style={{fontFamily:"'Playfair Display', Georgia, serif"}}
      >
        ¡Cita confirmada!
      </h2>
      <p className="mb-8" style={{color:'#666'}}>
        Listo, {primerNombre}. Te esperamos.
      </p>

      {/* Detalle */}
      <div
        className="rounded-2xl p-4 text-left text-sm space-y-2 mb-8"
        style={{background:'#151515', border:'1px solid #252525'}}
      >
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Servicio</span>
          <strong className="text-white">{servicio.nombre}</strong>
        </div>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Fecha</span>
          <strong className="text-white">{fechaTexto}</strong>
        </div>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Hora</span>
          <strong className="text-white">{slot.etiqueta}</strong>
        </div>
        <div className="flex justify-between">
          <span style={{color:'#666'}}>Duración</span>
          <strong className="text-white">{servicio.duracion_min} min</strong>
        </div>
      </div>

      <button
        onClick={onNueva}
        className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95 mb-3"
        style={{
          background:'transparent',
          border:'1px solid #c41230',
          color:'#c41230',
          fontSize:'14px',
          letterSpacing:'0.05em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background='#c41230'
          e.currentTarget.style.color='#fff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background='transparent'
          e.currentTarget.style.color='#c41230'
        }}
      >
        Agendar otra cita
      </button>

    </div>
  )
}
