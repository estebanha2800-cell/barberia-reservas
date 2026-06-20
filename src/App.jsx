// App.jsx — componente raíz
// Fase 2: routing manual + autenticación Supabase
// Rutas:
//   /         → página pública de reservas
//   /admin    → panel del barbero (requiere sesión)
//              si no hay sesión → muestra Login

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Reservas from './pages/Reservas.jsx'
import Login    from './pages/Login.jsx'
import Panel    from './pages/Panel.jsx'

export default function App() {
  const [ruta, setRuta]           = useState(() => window.location.pathname)
  const [sesion, setSesion]       = useState(null)
  const [authListo, setAuthListo] = useState(false)

  // Escuchar cambios de URL (botón atrás/adelante)
  useEffect(() => {
    const handler = () => setRuta(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // Escuchar estado de autenticación
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setAuthListo(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  function navegar(path) {
    window.history.pushState({}, '', path)
    setRuta(path)
  }

  async function logout() {
    await supabase.auth.signOut()
    navegar('/')
  }

  // Esperar que Supabase confirme si hay sesión activa
  if (!authListo) return null

  // Rutas /admin*
  if (ruta.startsWith('/admin')) {
    if (!sesion) {
      return <Login onLogin={() => navegar('/admin')} />
    }
    return <Panel onLogout={logout} />
  }

  // Ruta pública
  return <Reservas />
}
