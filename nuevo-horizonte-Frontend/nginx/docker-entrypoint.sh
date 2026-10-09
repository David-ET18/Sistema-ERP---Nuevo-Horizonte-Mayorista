#!/bin/sh
# Decide automaticamente el modo de nginx en cada arranque del contenedor:
# - Sin DOMAIN definido, o sin certificado todavia para ese dominio: HTTP
#   normal en :80 (el mismo comportamiento de siempre, para local y para
#   un EC2 recien levantado antes de tener el dominio apuntado).
# - Con el certificado ya emitido (lo deja certbot en el volumen
#   compartido /etc/letsencrypt): HTTPS en :443 + redirect desde :80.
set -e

CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

if [ -n "${DOMAIN}" ] && [ -f "${CERT_PATH}" ]; then
	echo "Certificado encontrado para ${DOMAIN}: sirviendo HTTPS"
	envsubst '${DOMAIN}' < /etc/nginx/ssl.conf.template > /etc/nginx/conf.d/default.conf
else
	echo "Sin certificado todavia (o sin DOMAIN definido): sirviendo solo HTTP en :80"
	cp /etc/nginx/http.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
