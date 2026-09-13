-- ============================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TABLA: roles
-- ============================================
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_roles_nombre CHECK (nombre IN ('GERENCIA', 'PROVEEDOR'))
);

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: permisos
-- ============================================
CREATE TABLE permisos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    recurso VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_permisos_recurso_accion UNIQUE (recurso, accion)
);

CREATE TRIGGER trg_permisos_updated_at
    BEFORE UPDATE ON permisos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: rol_permiso (Many-to-Many)
-- ============================================
CREATE TABLE rol_permiso (
    rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id BIGINT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_acceso TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuarios_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usuarios_telefono CHECK (telefono IS NULL OR telefono ~ '^\+?[0-9\s\-\(\)]{7,20}$')
);

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_usuarios_email ON usuarios(email) WHERE activo = TRUE;
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_email_verificado ON usuarios(email_verificado) WHERE email_verificado = FALSE;

-- ============================================
-- TABLA: usuario_rol (Many-to-Many)
-- ============================================
CREATE TABLE usuario_rol (
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id)
);

-- ============================================
-- TABLA: direcciones
-- ============================================
CREATE TABLE direcciones (
    id BIGSERIAL PRIMARY KEY,
    calle VARCHAR(255) NOT NULL,
    numero_exterior VARCHAR(20),
    numero_interior VARCHAR(20),
    colonia VARCHAR(100),
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(100) NOT NULL DEFAULT 'Mexico',
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    referencias VARCHAR(500),
    tipo VARCHAR(20),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_direcciones_cp CHECK (codigo_postal ~ '^[0-9]{5}$'),
    CONSTRAINT chk_direcciones_tipo CHECK (tipo IS NULL OR tipo IN ('FACTURACION', 'ENVIO', 'AMBAS'))
);

CREATE TRIGGER trg_direcciones_updated_at
    BEFORE UPDATE ON direcciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX uq_direcciones_principal_por_usuario
    ON direcciones(usuario_id) WHERE principal = TRUE;

CREATE INDEX idx_direcciones_usuario ON direcciones(usuario_id);
CREATE INDEX idx_direcciones_tipo ON direcciones(tipo);

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE proveedores (
    id BIGSERIAL PRIMARY KEY,
    rfc VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(255),
    nombre_comercial VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion VARCHAR(500),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    calificacion NUMERIC(3,2) DEFAULT 0.00,
    contacto_nombre VARCHAR(100),
    contacto_email VARCHAR(100),
    contacto_telefono VARCHAR(20),
    usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_proveedores_rfc CHECK (rfc ~* '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
    CONSTRAINT chk_proveedores_email CHECK (contacto_email IS NULL OR contacto_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_proveedores_calificacion CHECK (calificacion >= 0 AND calificacion <= 5)
);

CREATE TRIGGER trg_proveedores_updated_at
    BEFORE UPDATE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_proveedores_rfc ON proveedores(rfc);
CREATE INDEX idx_proveedores_activo ON proveedores(activo) WHERE activo = TRUE;
CREATE INDEX idx_proveedores_calificacion ON proveedores(calificacion DESC) WHERE activo = TRUE;

-- ============================================
-- TABLA: cuentas_bancarias
-- ============================================
CREATE TABLE cuentas_bancarias (
    id BIGSERIAL PRIMARY KEY,
    banco VARCHAR(100) NOT NULL,
    clabe VARCHAR(18) NOT NULL UNIQUE,
    numero_cuenta VARCHAR(50) NOT NULL,
    titular VARCHAR(100),
    tipo_cuenta VARCHAR(20) NOT NULL DEFAULT 'CHEQUES',
    proveedor_id BIGINT NOT NULL UNIQUE REFERENCES proveedores(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cuentas_clabe CHECK (clabe ~ '^[0-9]{18}$'),
    CONSTRAINT chk_cuentas_tipo CHECK (tipo_cuenta IN ('CHEQUES', 'AHORROS'))
);

CREATE TRIGGER trg_cuentas_bancarias_updated_at
    BEFORE UPDATE ON cuentas_bancarias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: documentos_proveedor
-- ============================================
CREATE TABLE documentos_proveedor (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    proveedor_id BIGINT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_documentos_proveedor_updated_at
    BEFORE UPDATE ON documentos_proveedor
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_documentos_proveedor ON documentos_proveedor(proveedor_id);
CREATE INDEX idx_documentos_verificado ON documentos_proveedor(verificado) WHERE verificado = FALSE;

-- ============================================
-- TABLA: gerencias
-- ============================================
CREATE TABLE gerencias (
    id BIGSERIAL PRIMARY KEY,
    departamento VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    numero_empleado VARCHAR(50) UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    jefe_directo_id BIGINT REFERENCES gerencias(id) ON DELETE SET NULL,
    usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_gerencias_updated_at
    BEFORE UPDATE ON gerencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_gerencias_departamento ON gerencias(departamento);
CREATE INDEX idx_gerencias_activo ON gerencias(activo) WHERE activo = TRUE;
CREATE INDEX idx_gerencias_jefe ON gerencias(jefe_directo_id);
CREATE INDEX idx_gerencias_numero_empleado ON gerencias(numero_empleado) WHERE numero_empleado IS NOT NULL;

-- ============================================
-- TABLA: sesiones
-- ============================================
CREATE TABLE sesiones (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    expira_en TIMESTAMPTZ NOT NULL,
    refresh_expira_en TIMESTAMPTZ NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_sesiones_updated_at
    BEFORE UPDATE ON sesiones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_sesiones_usuario_activa ON sesiones(usuario_id, activa) WHERE activa = TRUE;
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_refresh_token ON sesiones(refresh_token);
CREATE INDEX idx_sesiones_expira ON sesiones(expira_en) WHERE activa = TRUE;

-- ============================================
-- TABLA: auditoria
-- ============================================
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    entidad VARCHAR(100) NOT NULL,
    entidad_id VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    ip VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_auditoria_accion CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ENABLE', 'DISABLE'))
);

CREATE INDEX idx_auditoria_usuario_fecha ON auditoria(usuario_id, fecha DESC);
CREATE INDEX idx_auditoria_entidad ON auditoria(entidad, entidad_id);
CREATE INDEX idx_auditoria_accion_fecha ON auditoria(accion, fecha DESC);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha DESC);

-- ============================================
-- DATOS INICIALES (SEEDS)
-- ============================================

-- Roles base
INSERT INTO roles (nombre, descripcion) VALUES
    ('GERENCIA', 'Administradores internos del sistema'),
    ('PROVEEDOR', 'Proveedores externos registrados')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos base por recurso/acción
INSERT INTO permisos (nombre, descripcion, recurso, accion) VALUES
    ('usuario:crear', 'Crear usuarios', 'usuario', 'CREATE'),
    ('usuario:leer', 'Leer usuarios', 'usuario', 'READ'),
    ('usuario:actualizar', 'Actualizar usuarios', 'usuario', 'UPDATE'),
    ('usuario:eliminar', 'Eliminar usuarios', 'usuario', 'DELETE'),
    ('usuario:cambiar_estado', 'Cambiar estado de usuarios', 'usuario', 'ENABLE_DISABLE'),
    ('usuario:asignar_rol', 'Asignar roles a usuarios', 'usuario', 'ASSIGN_ROLE'),
    ('rol:crear', 'Crear roles', 'rol', 'CREATE'),
    ('rol:leer', 'Leer roles', 'rol', 'READ'),
    ('rol:actualizar', 'Actualizar roles', 'rol', 'UPDATE'),
    ('rol:eliminar', 'Eliminar roles', 'rol', 'DELETE'),
    ('rol:asignar_permiso', 'Asignar permisos a roles', 'rol', 'ASSIGN_PERMISSION'),
    ('permiso:crear', 'Crear permisos', 'permiso', 'CREATE'),
    ('permiso:leer', 'Leer permisos', 'permiso', 'READ'),
    ('permiso:actualizar', 'Actualizar permisos', 'permiso', 'UPDATE'),
    ('permiso:eliminar', 'Eliminar permisos', 'permiso', 'DELETE'),
    ('direccion:crear', 'Crear direcciones', 'direccion', 'CREATE'),
    ('direccion:leer', 'Leer direcciones', 'direccion', 'READ'),
    ('direccion:actualizar', 'Actualizar direcciones', 'direccion', 'UPDATE'),
    ('direccion:eliminar', 'Eliminar direcciones', 'direccion', 'DELETE'),
    ('proveedor:crear', 'Crear proveedores', 'proveedor', 'CREATE'),
    ('proveedor:leer', 'Leer proveedores', 'proveedor', 'READ'),
    ('proveedor:actualizar', 'Actualizar proveedores', 'proveedor', 'UPDATE'),
    ('proveedor:eliminar', 'Eliminar proveedores', 'proveedor', 'DELETE'),
    ('proveedor:cambiar_estado', 'Cambiar estado de proveedores', 'proveedor', 'ENABLE_DISABLE'),
    ('gerencia:crear', 'Crear gerencias', 'gerencia', 'CREATE'),
    ('gerencia:leer', 'Leer gerencias', 'gerencia', 'READ'),
    ('gerencia:actualizar', 'Actualizar gerencias', 'gerencia', 'UPDATE'),
    ('gerencia:eliminar', 'Eliminar gerencias', 'gerencia', 'DELETE'),
    ('gerencia:ver_subordinados', 'Ver subordinados', 'gerencia', 'VIEW_SUBORDINATES'),
    ('sesion:leer', 'Leer sesiones', 'sesion', 'READ'),
    ('sesion:revocar', 'Revocar sesiones', 'sesion', 'REVOKE'),
    ('auditoria:leer', 'Leer auditoría', 'auditoria', 'READ')
ON CONFLICT (nombre) DO NOTHING;

-- Asignar todos los permisos a GERENCIA
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'GERENCIA'
ON CONFLICT DO NOTHING;

-- Asignar permisos básicos a PROVEEDOR
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'PROVEEDOR'
  AND p.recurso IN ('direccion', 'proveedor', 'sesion')
  AND p.accion IN ('CREATE', 'READ', 'UPDATE')
ON CONFLICT DO NOTHING;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

CREATE OR REPLACE VIEW v_usuarios_con_roles AS
SELECT
    u.id,
    u.username,
    u.email,
    u.nombre,
    u.apellido,
    u.telefono,
    u.activo,
    u.email_verificado,
    u.ultimo_acceso,
    u.created_at,
    u.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', r.id,
                'nombre', r.nombre,
                'descripcion', r.descripcion
            )
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'::json
    ) AS roles
FROM usuarios u
LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
LEFT JOIN roles r ON ur.rol_id = r.id
GROUP BY u.id;

CREATE OR REPLACE VIEW v_proveedores_completos AS
SELECT
    p.id,
    p.rfc,
    p.razon_social,
    p.nombre_comercial,
    p.activo,
    p.descripcion,
    p.fecha_registro,
    p.calificacion,
    p.contacto_nombre,
    p.contacto_email,
    p.contacto_telefono,
    p.created_at,
    p.updated_at,
    json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'nombre', u.nombre,
        'apellido', u.apellido
    ) AS usuario,
    cb.id AS cuenta_bancaria_id
FROM proveedores p
JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN cuentas_bancarias cb ON p.id = cb.proveedor_id;

CREATE OR REPLACE VIEW v_gerencias_jerarquia AS
SELECT
    g.id,
    g.departamento,
    g.cargo,
    g.numero_empleado,
    g.activo,
    g.fecha_ingreso,
    g.created_at,
    g.updated_at,
    json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'nombre', u.nombre,
        'apellido', u.apellido
    ) AS usuario,
    json_build_object(
        'id', j.id,
        'departamento', j.departamento,
        'cargo', j.cargo
    ) AS jefe_directo,
    (
        SELECT COUNT(*) FROM gerencias sub WHERE sub.jefe_directo_id = g.id
    ) AS total_subordinados
FROM gerencias g
JOIN usuarios u ON g.usuario_id = u.id
LEFT JOIN gerencias j ON g.jefe_directo_id = j.id;
