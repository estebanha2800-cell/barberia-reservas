// Cargando.jsx — spinner genérico reutilizable

export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{texto}</p>
    </div>
  )
}
