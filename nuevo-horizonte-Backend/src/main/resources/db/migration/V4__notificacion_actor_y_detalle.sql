-- V4: contexto enriquecido de notificaciones
-- actor_nombre: usuario que provoco el cambio (para responder "quien lo hizo").
-- detalle: texto ampliado con el antes/despues del cambio, para que el panel
-- de detalle no dependa solo del mensaje corto de la tarjeta.

ALTER TABLE seguridad.notificacion ADD COLUMN IF NOT EXISTS actor_nombre VARCHAR(120);
ALTER TABLE seguridad.notificacion ADD COLUMN IF NOT EXISTS detalle VARCHAR(1000);
