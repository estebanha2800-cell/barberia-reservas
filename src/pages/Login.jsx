// pages/Login.jsx — Pantalla de acceso privado para el barbero

import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✂️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Barbero</h1>
          <p className="text-sm text-gray-500 mt-1">Acceso privado</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl
                       hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}
