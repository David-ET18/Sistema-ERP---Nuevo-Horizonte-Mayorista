-- ============================================
-- MIGRACIÓN V3: SOLICITUDES Y MARCACIONES
-- Módulos funcionales para TRABAJADOR y GERENCIA
-- ============================================

-- ============================================
-- TABLA: solicitudes
-- ============================================
CREATE TABLE solicitudes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL,
    motivo TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    comentario_gerencia TEXT,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_solicitudes_tipo CHECK (tipo IN ('VACACIONES', 'PERMISO', 'HORAS_EXTRA', 'PEDIDO', 'OTRO')),
    CONSTRAINT chk_solicitudes_estado CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
    CONSTRAINT chk_solicitudes_fechas CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TRIGGER trg_solicitudes_updated_at
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_solicitudes_usuario ON solicitudes(usuario_id, created_at DESC);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado, created_at DESC);
CREATE INDEX idx_solicitudes_codigo ON solicitudes(codigo);

-- ============================================
-- TABLA: marcaciones (entrada/salida)
-- ============================================
CREATE TABLE marcaciones (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora TIME NOT NULL DEFAULT CURRENT_TIME,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_marcaciones_tipo CHECK (tipo IN ('ENTRADA', 'SALIDA'))
);

CREATE TRIGGER trg_marcaciones_updated_at
    BEFORE UPDATE ON marcaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_marcaciones_usuario_fecha ON marcaciones(usuario_id, fecha DESC, hora DESC);
CREATE INDEX idx_marcaciones_fecha ON marcaciones(fecha, tipo);

-- ============================================
-- PERMISOS para los nuevos módulos
-- ============================================
INSERT INTO permisos (nombre, descripcion, recurso, accion) VALUES
    ('solicitud:crear', 'Crear solicitudes', 'solicitud', 'CREATE'),
    ('solicitud:leer', 'Leer solicitudes', 'solicitud', 'READ'),
    ('solicitud:aprobar', 'Aprobar/rechazar solicitudes', 'solicitud', 'APPROVE'),
    ('marcacion:crear', 'Registrar marcaciones', 'marcacion', 'CREATE'),
    ('marcacion:leer', 'Leer marcaciones', 'marcacion', 'READ')
ON CONFLICT (nombre) DO NOTHING;

-- GERENCIA: todos los permisos nuevos
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'GERENCIA'
  AND p.recurso IN ('solicitud', 'marcacion')
ON CONFLICT DO NOTHING;

-- TRABAJADOR: permisos propios (crear/leer)
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'TRABAJADOR'
  AND (
        (p.recurso = 'solicitud' AND p.accion IN ('CREATE', 'READ'))
     OR (p.recurso = 'marcacion' AND p.accion IN ('CREATE', 'READ'))
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- DATOS DEMO (opcionales): se insertan solo si
-- existe al menos un usuario TRABAJADOR
-- ============================================
INSERT INTO solicitudes (codigo, tipo, motivo, fecha_inicio, fecha_fin, estado, usuario_id)
SELECT 'NH-DEMO-0001', 'VACACIONES', 'Ejemplo: solicitud de vacaciones (pendiente)',
       CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '11 days', 'PENDIENTE', u.id
FROM usuarios u
JOIN usuario_rol ur ON ur.usuario_id = u.id
JOIN roles r ON r.id = ur.rol_id
WHERE r.nombre = 'TRABAJADOR'
ORDER BY u.id
LIMIT 1;

INSERT INTO solicitudes (codigo, tipo, motivo, fecha_inicio, fecha_fin, estado, usuario_id)
SELECT 'NH-DEMO-0002', 'PERMISO', 'Ejemplo: permiso aprobado',
       CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 'APROBADA', u.id
FROM usuarios u
JOIN usuario_rol ur ON ur.usuario_id = u.id
JOIN roles r ON r.id = ur.rol_id
WHERE r.nombre = 'TRABAJADOR'
ORDER BY u.id
LIMIT 1;

INSERT INTO marcaciones (tipo, fecha, hora, usuario_id)
SELECT 'ENTRADA', CURRENT_DATE, CURRENT_TIME, u.id
FROM usuarios u
JOIN usuario_rol ur ON ur.usuario_id = u.id
JOIN roles r ON r.id = ur.rol_id
WHERE r.nombre = 'TRABAJADOR'
ORDER BY u.id
LIMIT 1;