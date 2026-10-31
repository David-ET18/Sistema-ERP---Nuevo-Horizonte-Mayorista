-- V2: promociones con imagen en base de datos y mejoras de notificaciones.
--
-- La tabla promociones.promocion la crea Hibernate (ddl-auto=update) a partir
-- de la entidad Promocion: aqui solo aseguramos el esquema para que exista
-- antes de la primera escritura. Las columnas nuevas de notificacion se
-- agregan de forma idempotente porque esa tabla ya puede tener filas.
CREATE SCHEMA IF NOT EXISTS promociones;

ALTER TABLE IF EXISTS seguridad.notificacion
	ADD COLUMN IF NOT EXISTS enlace VARCHAR(200);

ALTER TABLE IF EXISTS seguridad.notificacion
	ADD COLUMN IF NOT EXISTS fecha_leida TIMESTAMP;
