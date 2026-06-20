// pages/Login.jsx — Pantalla de acceso privado para el barbero

import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const inputStyle = {
  background:'#151515',
  border:'1px solid #2a2a2a',
  borderRadius:'12px',
  padding:'12px 16px',
  color:'#f0f0f0',
  fontSize:'14px',
  width:'100%',
  outline:'none',
}

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email o contraseña incorrectos.')
      setCargando(false)
      return
    }
    onLogin()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{background:'#0a0a0a'}}
    >
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1
            className="text-5xl font-bold text-white"
            style={{fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:'0.1em'}}
          >
            Opera
          </h1>
          <p className="text-xs mt-2 uppercase" style={{color:'#c41230', letterSpacing:'0.25em'}}>
            Panel del barbero
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase mb-1.5" style={{color:'#555', letterSpacing:'0.15em'}}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor='#888')}
              onBlur={e => (e.currentTarget.style.borderColor='#2a2a2a')}
            />
          </div>

          <div>
            <label className="block text-xs uppercase mb-1.5" style={{color:'#555', letterSpacing:'0.15em'}}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor='#888')}
              onBlur={e => (e.currentTarget.style.borderColor='#2a2a2a')}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{color:'#c41230'}}>{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full font-bold py-4 rounded-2xl transition-all active:scale-95 mt-2"
            style={{
              background: cargando ? '#1a1a1a' : '#c41230',
              color: cargando ? '#555' : '#fff',
              fontSize:'15px',
            }}
          >
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}
