# Guía: Desplegar en Netlify

## Requisitos previos
- Haber completado la configuración de Supabase (ver `GUIA-SUPABASE.md`)
- Tener Node.js instalado en tu computador (descárgalo en https://nodejs.org — versión LTS)
- (Opcional pero recomendado) Tener una cuenta en GitHub para subir el código

---

## Opción A — Despliegue directo desde tu computador (más fácil)

### Paso 1 — Instalar dependencias y hacer el build

Abre la terminal (PowerShell o CMD) dentro de la carpeta `barberia-reservas` y ejecuta:

```bash
npm install
```

Luego crea el archivo `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Después genera el build (carpeta `dist`):

```bash
npm run build
```

### Paso 2 — Subir a Netlify con drag & drop

1. Ve a **https://app.netlify.com** y crea una cuenta gratuita.
2. En el dashboard haz clic en **Add new site** → **Deploy manually**.
3. **Arrastra y suelta** la carpeta `dist` (que se creó en el paso anterior) al área indicada.
4. Netlify desplegará el sitio en segundos y te dará una URL como `https://nombre-random.netlify.app`.

> ⚠️ Con este método las variables de entorno están incluidas dentro del build.  
> Para producción es mejor usar la Opción B (con GitHub) donde las variables se guardan en Netlify.

---

## Opción B — Despliegue continuo con GitHub (recomendado)

Con este método, cada vez que hagas un cambio en el código y lo subas a GitHub, Netlify actualiza el sitio automáticamente.

### Paso 1 — Subir el código a GitHub

1. Crea un repositorio en https://github.com/new (puede ser privado).
2. Sube el código:

```bash
git init
git add .
git commit -m "Primer commit: barbería reservas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

> Asegúrate de que el archivo `.env` esté en `.gitignore` (ya está configurado) — nunca lo subas.

### Paso 2 — Conectar el repositorio en Netlify

1. Ve a **https://app.netlify.com** → **Add new site** → **Import an existing project**.
2. Elige **GitHub** y autoriza el acceso.
3. Selecciona el repositorio que acabas de crear.
4. Configura el build:

   | Campo | Valor |
   |---|---|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

5. Haz clic en **Deploy site**.

### Paso 3 — Agregar las variables de entorno en Netlify ⚠️ IMPORTANTE

Las variables de Supabase **no están en el repositorio** (para mayor seguridad), así que hay que agregarlas en Netlify:

1. En tu sitio en Netlify, ve a **Site configuration** → **Environment variables**.
2. Haz clic en **Add a variable** y agrega las dos variables:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://TU_PROYECTO.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

3. Ve a **Deploys** → **Trigger deploy** → **Deploy site** para que el build use las nuevas variables.

---

## Paso 4 — (Opcional) Cambiar el nombre del sitio

Por defecto Netlify asigna un nombre como `magical-einstein-abc123`.

Para cambiarlo:
1. Ve a **Site configuration** → **Site details** → **Change site name**.
2. Escribe el nombre que quieras (ej: `barberia-reservas`) y guarda.
3. Tu sitio quedará en `https://barberia-reservas.netlify.app`.

---

## Verificación final

Abre la URL de tu sitio. Deberías ver:
- [ ] La pantalla de reservas carga y muestra los servicios
- [ ] Puedes seleccionar fecha (domingos y festivos deshabilitados)
- [ ] Los horarios disponibles aparecen correctamente
- [ ] Puedes completar una reserva y ver la pantalla de confirmación con el código
- [ ] La cita aparece en Supabase → Table Editor → citas
