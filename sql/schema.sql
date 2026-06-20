-- ================================================================
-- BARBERÍA RESERVAS — Schema MVP
-- Pega este archivo completo en el Editor SQL de Supabase
-- y haz clic en "Run"
-- ================================================================


-- ----------------------------------------------------------------
-- 1. TABLAS
-- ----------------------------------------------------------------

-- Lista de servicios que ofrece la barbería
CREATE TABLE servicios (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT    NOT NULL,
  duracion_min INTEGER NOT NULL CHECK (duracion_min > 0),
  precio       INTEGER NOT NULL CHECK (precio >= 0), -- en pesos colombianos
  activo       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Barberos (por ahora uno; la tabla está lista para crecer)
CREATE TABLE barberos (
  id     UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT    NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Horarios de atención por día de semana
-- dia_semana: 0 = domingo, 1 = lunes, …, 6 = sábado
-- Se pueden tener varios bloques por día (ej: mañana y tarde)
CREATE TABLE horarios_atencion (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id  UUID    NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
  dia_semana  INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME    NOT NULL,
  hora_fin    TIME    NOT NULL,
  CONSTRAINT horarios_validos CHECK (hora_fin > hora_inicio)
);

-- Bloqueos: descansos puntuales, días libres, vacaciones
CREATE TABLE bloqueos (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id UUID        NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
  inicio     TIMESTAMPTZ NOT NULL,
  fin        TIMESTAMPTZ NOT NULL,
  motivo     TEXT,
  CONSTRAINT bloqueos_validos CHECK (fin > inicio)
);

-- Citas agendadas por los clientes
CREATE TABLE citas (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre   TEXT        NOT NULL,
  cliente_telefono TEXT        NOT NULL,
  servicio_id      UUID        REFERENCES servicios(id),
  barbero_id       UUID        REFERENCES barberos(id),
  inicio           TIMESTAMPTZ NOT NULL,
  fin              TIMESTAMPTZ NOT NULL,
  estado           TEXT        NOT NULL DEFAULT 'confirmada'
                   CHECK (estado IN ('confirmada','completada','cancelada','no_se_presento')),
  notas            TEXT,
  creada_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT citas_validas CHECK (fin > inicio)
);


-- ----------------------------------------------------------------
-- 2. ÍNDICES
-- ----------------------------------------------------------------

-- Búsquedas de citas por fecha (la más frecuente)
CREATE INDEX idx_citas_inicio      ON citas(inicio);

-- Búsquedas de citas por barbero + fecha (para disponibilidad)
CREATE INDEX idx_citas_barbero_dia ON citas(barbero_id, inicio);

-- Búsquedas de bloqueos por barbero (para disponibilidad)
CREATE INDEX idx_bloqueos_barbero  ON bloqueos(barbero_id, inicio, fin);


-- ----------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------
-- RLS bloquea TODA operación por defecto; las políticas abren
-- exactamente lo que necesitamos. Nunca expongas la service_role
-- key en el frontend: solo usa la anon key con estas políticas.

ALTER TABLE servicios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE barberos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_atencion ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas             ENABLE ROW LEVEL SECURITY;

-- SERVICIOS
-- Cualquier visitante puede ver los servicios activos (para mostrar el menú)
CREATE POLICY "publico_leer_servicios"
  ON servicios FOR SELECT
  USING (activo = TRUE);

-- Solo el barbero autenticado puede crear / editar / borrar servicios
CREATE POLICY "barbero_gestionar_servicios"
  ON servicios FOR ALL
  USING (auth.role() = 'authenticated');

-- BARBEROS
-- Cualquiera puede ver los barberos activos (para saber a quién reservar)
CREATE POLICY "publico_leer_barberos"
  ON barberos FOR SELECT
  USING (activo = TRUE);

-- Solo autenticado puede gestionar barberos
CREATE POLICY "barbero_gestionar_barberos"
  ON barberos FOR ALL
  USING (auth.role() = 'authenticated');

-- HORARIOS DE ATENCIÓN
-- Cualquiera los necesita para calcular disponibilidad
CREATE POLICY "publico_leer_horarios"
  ON horarios_atencion FOR SELECT
  USING (TRUE);

-- Solo autenticado puede cambiar horarios
CREATE POLICY "barbero_gestionar_horarios"
  ON horarios_atencion FOR ALL
  USING (auth.role() = 'authenticated');

-- BLOQUEOS
-- Cualquiera puede leer inicio/fin para saber qué horas están bloqueadas.
-- El motivo ("almuerzo", "médico"…) solo lo verá el barbero en su panel,
-- pero tenerlos visibles no es un riesgo grave para el MVP.
CREATE POLICY "publico_leer_bloqueos"
  ON bloqueos FOR SELECT
  USING (TRUE);

-- Solo autenticado puede crear / editar / borrar bloqueos
CREATE POLICY "barbero_gestionar_bloqueos"
  ON bloqueos FOR ALL
  USING (auth.role() = 'authenticated');

-- CITAS
-- Cualquier visitante puede insertar una cita nueva (reservar)
CREATE POLICY "publico_insertar_cita"
  ON citas FOR INSERT
  WITH CHECK (TRUE);

-- Cualquiera puede leer citas para verificar disponibilidad.
-- Nota: los datos del cliente (nombre, teléfono) también son visibles
-- con la anon key. Para el MVP es aceptable; en producción podrías
-- crear una vista que solo exponga inicio, fin y barbero_id.
CREATE POLICY "publico_leer_citas"
  ON citas FOR SELECT
  USING (TRUE);

-- Solo el barbero autenticado puede cambiar el estado (confirmar, cancelar…)
CREATE POLICY "barbero_actualizar_citas"
  ON citas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Solo autenticado puede eliminar citas
CREATE POLICY "barbero_eliminar_citas"
  ON citas FOR DELETE
  USING (auth.role() = 'authenticated');


-- ----------------------------------------------------------------
-- 4. DATOS INICIALES
-- ----------------------------------------------------------------

-- Barbero
INSERT INTO barberos (nombre, activo)
VALUES ('El Barbero', TRUE);

-- Servicios
INSERT INTO servicios (nombre, duracion_min, precio, activo) VALUES
  ('Corte',         40, 25000, TRUE),
  ('Barba',         20, 15000, TRUE),
  ('Corte y Barba', 60, 35000, TRUE);

-- Horarios: lunes (1) a sábado (6), dos bloques por día
-- Bloque mañana : 09:00 – 12:00
-- Bloque tarde  : 12:40 – 19:00
-- (los 40 min de pausa quedan automáticamente sin slots entre 12:00 y 12:40)
DO $$
DECLARE
  v_barbero_id UUID;
  dia INTEGER;
BEGIN
  SELECT id INTO v_barbero_id FROM barberos LIMIT 1;

  FOR dia IN 1..6 LOOP
    INSERT INTO horarios_atencion (barbero_id, dia_semana, hora_inicio, hora_fin)
    VALUES
      (v_barbero_id, dia, '09:00', '12:00'),
      (v_barbero_id, dia, '12:40', '19:00');
  END LOOP;
END $$;
