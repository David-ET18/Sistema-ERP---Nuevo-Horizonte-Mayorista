CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS catalogo;
CREATE SCHEMA IF NOT EXISTS ventas;
CREATE SCHEMA IF NOT EXISTS gestion_agencias;

-- "tipo_base" se reemplazo por el booleano "es_sistema" (ver Rol.java): quedaba
-- redundante y se podia desincronizar de el. ddl-auto=update nunca borra
-- columnas, asi que hay que hacerlo aqui a mano.
ALTER TABLE IF EXISTS seguridad.rol DROP COLUMN IF EXISTS tipo_base;
