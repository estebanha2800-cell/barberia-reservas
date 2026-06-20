# Guía: Configurar Supabase

## Paso 1 — Crear cuenta y proyecto

1. Ve a **https://supabase.com** y haz clic en **Start your project**.
2. Regístrate con tu correo o con GitHub.
3. En el dashboard haz clic en **New project**.
4. Rellena:
   - **Name**: `barberia-reservas` (o el nombre que quieras)
   - **Database Password**: pon una contraseña fuerte y guárdala en un lugar seguro
   - **Region**: elige **South America (São Paulo)** — es el más cercano a Colombia
5. Haz clic en **Create new project** y espera ~1 minuto mientras se crea.

---

## Paso 2 — Crear las tablas (pegar el SQL)

1. En el menú izquierdo abre **SQL Editor**.
2. Haz clic en **New query**.
3. Abre el archivo `sql/schema.sql` de este proyecto, copia **todo el contenido** y pégalo en el editor.
4. Haz clic en el botón **Run** (arriba a la derecha).
5. Si ves el mensaje `Success. No rows returned`, todo salió bien.
6. Para verificar, ve a **Table Editor** — deberías ver las tablas: `servicios`, `barberos`, `horarios_atencion`, `bloqueos`, `citas`.

---

## Paso 3 — Obtener las credenciales

Necesitas dos valores para conectar la app:

1. En el menú izquierdo ve a **Project Settings** → **API**.
2. Copia y guarda:

| Variable | Dónde está | Ejemplo |
|---|---|---|
| `VITE_SUPABASE_URL` | Sección **Project URL** | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sección **Project API keys** → `anon public` | `eyJhbGci...` (token largo) |

> ⚠️ **Nunca uses la `service_role` key en el frontend.** Solo la `anon` key.

---

## Paso 4 — Crear el usuario del barbero (para el panel — Fase 2)

> Puedes hacer esto ahora para tenerlo listo.

1. Ve a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Ingresa el correo y contraseña con los que el barbero iniciará sesión.
3. Haz clic en **Create user**.

---

## Paso 5 — Configurar el archivo .env

En la carpeta raíz del proyecto crea un archivo llamado `.env` con este contenido:

```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...TU_ANON_KEY
```

Reemplaza los valores con los que copiaste en el Paso 3.

> El archivo `.env` ya está en `.gitignore` — nunca lo subas a GitHub.
