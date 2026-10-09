# Despliegue

Todo el stack (Postgres + backend + frontend) corre con Docker Compose, tanto
en local como en producción, sin cambiar código ni Dockerfiles — solo el
`.env`.

## Local

```bash
cp .env.example .env
# completa DB_PASSWORD y JWT_SECRET con valores propios (lo demás ya tiene
# defaults razonables para probar en tu máquina)
docker compose up --build
```

Abre `http://localhost`. `COOKIE_SECURE=false` en el `.env` de ejemplo es
a propósito: sin eso el login no funciona por HTTP plano.

## EC2 (sin dominio todavía)

1. Instala Docker y Docker Compose en la instancia.
2. Clona el repo, `cp .env.example .env` y completa `DB_PASSWORD`,
   `JWT_SECRET` (genera uno con `openssl rand -base64 48`), y
   `FRONTEND_URL` con la IP pública de la instancia
   (`http://<ip-publica>`).
3. Abre el puerto 80 (y 443 para más adelante) en el Security Group de la
   instancia.
4. `docker compose up -d --build`

Con eso ya queda funcionando por HTTP en la IP pública — lo mismo que local,
nada especial.

## Agregar el dominio + HTTPS (cuando lo compres)

1. En tu proveedor de DNS, crea un registro **A** apuntando tu dominio
   (ej. `app.tudominio.com`) a la IP pública del EC2. Espera a que propague
   (`dig app.tudominio.com` debería devolver esa IP).
2. En el `.env` del servidor, completa:
   ```
   DOMAIN=app.tudominio.com
   CERTBOT_EMAIL=tu-correo@ejemplo.com
   FRONTEND_URL=https://app.tudominio.com
   COOKIE_SECURE=true
   ```
3. `docker compose up -d` (recarga las variables; sigue sirviendo HTTP,
   normal, todavía no hay certificado).
4. `./init-letsencrypt.sh` — pide el certificado a Let's Encrypt (necesita
   que el DNS ya apunte al EC2) y reinicia el frontend.
5. Listo: `https://app.tudominio.com`. El contenedor `certbot` ya definido
   en `docker-compose.yml` renueva el certificado solo cada 12h — no hay
   que volver a correr nada.

## Variables de entorno (`.env`)

Ver [.env.example](.env.example) — cada variable tiene un comentario
explicando qué hace y cuál es su default. Nunca se commitea `.env`, solo
`.env.example` (plantilla sin valores reales).

## Esquema de base de datos

Lo administra [Flyway](nuevo-horizonte-Backend/src/main/resources/db/migration/):
cada cambio de esquema es un archivo `V2__algo.sql`, `V3__otra_cosa.sql`, etc.
en esa carpeta — nunca se edita un `V*` ya aplicado, ni se depende de que
Hibernate cree o modifique tablas solo (`ddl-auto=validate`: solo verifica
que coincidan).
