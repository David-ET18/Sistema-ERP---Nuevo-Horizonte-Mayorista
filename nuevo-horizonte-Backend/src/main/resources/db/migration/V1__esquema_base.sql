-- V1: linea base del esquema (antes era schema.sql via spring.sql.init).
--
-- Contiene SOLO lo que Hibernate ddl-auto=update no puede hacer solo:
-- crear los schemas y los ajustes manuales de columnas legacy. Las tablas
-- las sigue creando/actualizando Hibernate a partir de las entidades.
--
-- REGLA DE FLYWAY: un migration aplicado jamas se edita. Cambios futuros van
-- en V2, V3, ... nuevos. Todo es IF NOT EXISTS / IF EXISTS para que V1 sea
-- re-ejecutable sin riesgo.
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS catalogo;
CREATE SCHEMA IF NOT EXISTS ventas;
CREATE SCHEMA IF NOT EXISTS gestion_agencias;

-- "tipo_base" se reemplazo por el booleano "es_sistema" (ver Rol.java): quedaba
-- redundante y se podia desincronizar de el. ddl-auto=update nunca borra
-- columnas, asi que hay que hacerlo aqui a mano.
ALTER TABLE IF EXISTS seguridad.rol DROP COLUMN IF EXISTS tipo_base;

-- "anonimizado" (ver Usuario.java) es NOT NULL; en una tabla con filas existentes
-- ddl-auto=update no puede agregarla sin DEFAULT, asi que hay que hacerlo aqui a mano.
ALTER TABLE IF EXISTS seguridad.usuario ADD COLUMN IF NOT EXISTS anonimizado boolean NOT NULL DEFAULT false;
