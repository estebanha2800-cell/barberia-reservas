// lib/supabase.js
// Crea y exporta el cliente de Supabase.
// Las variables VITE_SUPABASE_* se leen del archivo .env
// y Vite las inyecta automáticamente en el build.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
    'Crea el archivo .env basándote en .env.example'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
