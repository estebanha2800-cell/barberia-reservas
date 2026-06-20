// App.jsx — componente raíz
// Rutas:
//   /       → página pública de reservas
//   /admin  → panel del barbero (requiere sesión); si no hay sesión → Login

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Reservas from './pages/Reservas.jsx'
import Login   from './pages/Login.jsx'
import Panel   from './pages/Panel.jsx'
import Cargando from './components/Cargando.jsx'

function ruta() {
  return window.location.pathname.replace(/\/$/, '') || '/'
}

export default function App() {
  const [pagina,   setPagina]   = useState(ruta())
  const [sesion,   setSesion]   = useState(null)
  const [chequeando, setChequeando] = useState(true)

  // Detectar cambios de URL (botón atrás / adelante)
  useEffect(() => {
    const handler = () => setPagina(ruta())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // Escuchar sesión de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setChequeando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  function irA(path) {
    window.history.pushState({}, '', path)
    setPagina(path)
  }

  if (chequeando) return <Cargando />

  if (pagina === '/admin') {
    if (!sesion) return <Login onLogin={() => setPagina('/admin')} />
    return <Panel onCerrarSesion={() => { supabase.auth.signOut(); irA('/') }} />
  }

  return <Reservas />
}
