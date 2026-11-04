-- V3: modulo de promociones y ampliacion de notificaciones

ALTER TABLE seguridad.notificacion ADD COLUMN IF NOT EXISTS enlace VARCHAR(255);
ALTER TABLE seguridad.notificacion ADD COLUMN IF NOT EXISTS fecha_leida TIMESTAMP;

CREATE SCHEMA IF NOT EXISTS promociones;

CREATE TABLE IF NOT EXISTS promociones.promocion (
    id_promocion BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    id_servicio BIGINT,
    descuento_porcentaje NUMERIC(5,2) NOT NULL,
    precio_original NUMERIC(10,2),
    precio_promocional NUMERIC(10,2),
    fecha_inicio DATE,
    fecha_fin DATE,
    destacada BOOLEAN NOT NULL DEFAULT FALSE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    imagen BYTEA,
    imagen_content_type VARCHAR(60),
    imagen_nombre VARCHAR(200),
    imagen_tamano BIGINT,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_promocion_servicio FOREIGN KEY (id_servicio)
        REFERENCES catalogo.servicio (id_servicio)
        ON DELETE SET NULL
);
