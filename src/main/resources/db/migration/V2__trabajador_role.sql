-- ============================================
-- V2: ROL TRABAJADOR REEMPLAZA A PROVEEDOR
-- El rol PROVEEDOR queda suspendido: solo
-- GERENCIA y TRABAJADOR pueden existir.
-- ============================================

-- Quitar constraint anterior para poder renombrar
ALTER TABLE roles DROP CONSTRAINT IF EXISTS chk_roles_nombre;

-- Renombrar el rol PROVEEDOR existente a TRABAJADOR (no-op en BD nuevas)
UPDATE roles
SET nombre = 'TRABAJADOR',
    descripcion = 'Trabajadores operativos de la empresa'
WHERE nombre = 'PROVEEDOR';

-- Forzar que solo existan los dos roles permitidos
ALTER TABLE roles ADD CONSTRAINT chk_roles_nombre CHECK (nombre IN ('GERENCIA', 'TRABAJADOR'));

-- Asegurar que el rol TRABAJADOR tenga los permisos base
-- (cobija el caso de BD nuevas donde el seed de V1 inserto PROVEEDOR)
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'TRABAJADOR'
  AND NOT EXISTS (
      SELECT 1 FROM rol_permiso rp
      WHERE rp.rol_id = r.id AND rp.permiso_id = p.id
  )
  AND p.recurso IN ('direccion', 'proveedor', 'sesion', 'usuario')
  AND p.accion IN ('CREATE', 'READ', 'UPDATE')
ON CONFLICT DO NOTHING;