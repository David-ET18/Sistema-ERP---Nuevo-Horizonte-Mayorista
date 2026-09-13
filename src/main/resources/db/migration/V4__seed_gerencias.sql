-- Seed: un registro de gerencia para cada usuario con rol GERENCIA
-- (idempotente: no duplica si ya existe el usuario_id)

INSERT INTO gerencias (departamento, cargo, numero_empleado, activo, fecha_ingreso, usuario_id)
SELECT 'Operaciones',
       'Gerente de Operaciones',
       'NH-ADMIN-' || lpad(u.id::TEXT, 3, '0'),
       TRUE,
       CURRENT_DATE,
       u.id
FROM usuarios u
WHERE EXISTS (
    SELECT 1
    FROM usuario_rol ur
    JOIN roles r ON r.id = ur.rol_id
    WHERE ur.usuario_id = u.id
      AND r.nombre = 'GERENCIA'
)
ON CONFLICT (usuario_id) DO NOTHING;