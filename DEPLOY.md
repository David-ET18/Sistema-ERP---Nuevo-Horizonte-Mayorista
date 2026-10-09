# Despliegue

Todo el stack (Postgres + backend + frontend) corre con Docker Compose, tanto
en local como en el servidor, sin cambiar código ni Dockerfiles — solo el
`.env`. Esta guía sirve para cualquier VPS con Linux (Contabo, EC2,
DigitalOcean, etc.), no solo para uno en particular.

## Local

```bash
cp .env.example .env
# completa DB_PASSWORD y JWT_SECRET con valores propios (lo demás ya tiene
# defaults razonables para probar en tu máquina)
docker compose up --build
```

Abre `http://localhost`. `COOKIE_SECURE=false` en el `.env` de ejemplo es
a propósito: sin eso el login no funciona por HTTP plano.

---

## 1. Preparar el VPS desde cero

Conéctate por SSH con el usuario y contraseña que te dio el proveedor (en
Contabo, root + la contraseña que fijaste o la que te llegó por correo):

```bash
ssh root@<ip-del-vps>
```

### 1.1 Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### 1.2 Crear un usuario sin privilegios de root

Usar `root` para todo es mala práctica. Crea un usuario y dale acceso a
`sudo`:

```bash
adduser deploy
usermod -aG sudo deploy
```

(sigue las preguntas, poné una contraseña propia)

### 1.3 Acceso por SSH con clave (recomendado, evita fuerza bruta)

Desde tu propia máquina (no desde el VPS):

```bash
ssh-copy-id deploy@<ip-del-vps>
```

Si no tienes una clave SSH todavía, generala primero con
`ssh-keygen -t ed25519`.

### 1.4 Firewall

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

### 1.5 (Opcional pero recomendado) Protección contra fuerza bruta en SSH

```bash
apt install -y fail2ban
systemctl enable --now fail2ban
```

De aquí en adelante, conéctate siempre como `deploy` (`ssh deploy@<ip>`), no
como `root`.

---

## 2. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```

Cierra la sesión SSH y vuelve a entrar para que el grupo `docker` tome
efecto. Verifica:

```bash
docker --version
docker compose version
```

---

## 3. Clonar el proyecto

Si el repositorio es privado, necesitas un deploy key (SSH) o un token de
acceso personal de GitHub. Con SSH:

```bash
ssh-keygen -t ed25519 -C "vps-deploy" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# pega esa clave en GitHub: Settings del repo -> Deploy keys -> Add deploy key
git clone git@github.com:David-ET18/Sistema-ERP---Nuevo-Horizonte-Mayorista.git nuevo-horizonte
cd nuevo-horizonte
```

---

## 4. Staging y producción en el mismo VPS

Con un solo VPS, la forma más simple y segura de tener los dos ambientes sin
que se pisen es **una carpeta por ambiente**, cada una con su propio `.env`
y corriendo en puertos distintos (Docker Compose ya aísla cada carpeta en su
propia red/volúmenes automáticamente, por el nombre del directorio).

```bash
git clone git@github.com:David-ET18/Sistema-ERP---Nuevo-Horizonte-Mayorista.git nuevo-horizonte-staging
git clone git@github.com:David-ET18/Sistema-ERP---Nuevo-Horizonte-Mayorista.git nuevo-horizonte-produccion
```

### 4.1 Staging

```bash
cd ~/nuevo-horizonte-staging
git checkout develop
cp .env.example .env
```

Edita `.env`:

```
DB_PASSWORD=<una-clave-distinta-a-la-de-produccion>
JWT_SECRET=<genera-una-con: openssl rand -base64 48>
FRONTEND_URL=http://<ip-del-vps>:8080
APP_PORT=8080
COOKIE_SECURE=false
SEED_DEMO_USUARIOS=true
```

```bash
docker compose up -d --build
```

Pruébalo en `http://<ip-del-vps>:8080` — no necesitas dominio para esto,
sirve mientras validas cambios antes de pasarlos a producción.

### 4.2 Producción

```bash
cd ~/nuevo-horizonte-produccion
git checkout develop
cp .env.example .env
```

(`main` todavía no tiene el setup de Docker/despliegue — usa `develop` para
ambos ambientes hasta que decidan fusionarlo a `main`)

Edita `.env`:

```
DB_PASSWORD=<otra-clave-distinta>
JWT_SECRET=<otra-generada-con: openssl rand -base64 48>
FRONTEND_URL=http://<ip-del-vps>
APP_PORT=80
COOKIE_SECURE=false
SEED_DEMO_USUARIOS=false
```

`SEED_DEMO_USUARIOS=false` es importante en producción: sin eso, el sistema
crea automáticamente usuarios de prueba con contraseña conocida
(`admin123`).

```bash
docker compose up -d --build
```

Abre el puerto 8080 también en el firewall si lo usaste para staging:

```bash
ufw allow 8080
```

---

## 5. Agregar el dominio + HTTPS a producción (cuando lo compres)

1. En tu proveedor de DNS, crea un registro **A** apuntando tu dominio
   (ej. `app.tudominio.com`) a la IP pública del VPS. Espera a que propague
   (`dig app.tudominio.com` debería devolver esa IP).
2. En `~/nuevo-horizonte-produccion/.env`, completa:
   ```
   DOMAIN=app.tudominio.com
   CERTBOT_EMAIL=tu-correo@ejemplo.com
   FRONTEND_URL=https://app.tudominio.com
   COOKIE_SECURE=true
   ```
3. `docker compose up -d` (recarga las variables; sigue sirviendo HTTP,
   normal, todavía no hay certificado).
4. `./init-letsencrypt.sh` — pide el certificado a Let's Encrypt (necesita
   que el DNS ya apunte al VPS) y reinicia el frontend.
5. Listo: `https://app.tudominio.com`. El contenedor `certbot` ya definido
   en `docker-compose.yml` renueva el certificado solo cada 12h — no hay
   que volver a correr nada.

---

## 6. Operación del día a día

**Desplegar un cambio nuevo** (en staging o producción, según la carpeta):

```bash
cd ~/nuevo-horizonte-staging    # o nuevo-horizonte-produccion
git pull
docker compose up -d --build
```

**Ver logs en vivo**:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

**Respaldo de la base de datos**:

```bash
docker compose exec db pg_dump -U postgres nuevo_horizonte > backup-$(date +%F).sql
```

**Estado de los contenedores**:

```bash
docker compose ps
docker stats
```

---

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
