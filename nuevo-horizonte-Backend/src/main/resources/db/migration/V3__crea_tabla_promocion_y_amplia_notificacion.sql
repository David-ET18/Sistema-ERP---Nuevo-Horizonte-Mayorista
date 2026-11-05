-- V3: ampliacion de notificaciones
-- La tabla promocion ya no se crea aqui: ahora vive en el esquema catalogo
-- (la crea/mueve V2 y la mapea Promocion.java).

ALTER TABLE seguridad.notificacion ADD COLUMN IF NOT EXISTS enlace VARCHAR(255);
ALTER TABLE seguridad.notificacion ADD COLUMN IF NOT EXISTS fecha_leida TIMESTAMP;
