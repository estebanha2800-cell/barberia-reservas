// Cargando.jsx — spinner genérico reutilizable

export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{border:'2px solid #2a2a2a', borderTopColor:'#c41230'}}
      />
      <p className="text-sm" style={{color:'#666'}}>{texto}</p>
    </div>
  )
}
