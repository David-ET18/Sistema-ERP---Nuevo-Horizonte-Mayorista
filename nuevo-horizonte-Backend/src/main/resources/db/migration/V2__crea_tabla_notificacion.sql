-- V2: tabla de notificaciones
CREATE TABLE IF NOT EXISTS seguridad.notificacion (
    id_notificacion BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    tipo VARCHAR(40) NOT NULL DEFAULT 'SISTEMA',
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario)
        REFERENCES seguridad.usuario (id_usuario)
        ON DELETE CASCADE
);
