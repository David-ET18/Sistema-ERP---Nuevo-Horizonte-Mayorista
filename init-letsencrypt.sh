#!/bin/bash
# Pide el primer certificado HTTPS a Let's Encrypt. Se corre UNA sola vez,
# cuando ya compraste el dominio y su registro A/AAAA apunta a la IP publica
# de este EC2 (sin eso, Let's Encrypt no puede validar el dominio).
#
# Uso:
#   1. Completa DOMAIN y CERTBOT_EMAIL en tu .env
#   2. docker compose up -d        (frontend arranca en HTTP normal)
#   3. ./init-letsencrypt.sh
#
# De ahi en mas, el contenedor "certbot" ya definido en docker-compose.yml
# renueva el certificado solo cada 12h; no hace falta volver a correr esto.
set -e

if [ -f .env ]; then
	set -a
	source .env
	set +a
fi

if [ -z "$DOMAIN" ]; then
	echo "Falta DOMAIN en tu .env (ej: DOMAIN=app.tudominio.com)"
	exit 1
fi
if [ -z "$CERTBOT_EMAIL" ]; then
	echo "Falta CERTBOT_EMAIL en tu .env (Let's Encrypt lo usa para avisos de vencimiento)"
	exit 1
fi

echo "Pidiendo certificado para $DOMAIN..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $CERTBOT_EMAIL -d $DOMAIN \
    --rsa-key-size 4096 --agree-tos --no-eff-email" certbot

echo "Certificado listo. Reiniciando frontend para que pase a HTTPS..."
docker compose restart frontend

echo "Listo: https://$DOMAIN"
