# BUILD
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# SERVIDO
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# http.conf / ssl.conf.template quedan fuera de conf.d: docker-entrypoint.sh
# decide cual activar en cada arranque segun exista o no el certificado
# (ver ese script). gettext da "envsubst", usado para inyectar $DOMAIN.
RUN apk add --no-cache gettext
COPY nginx/http.conf /etc/nginx/http.conf
COPY nginx/ssl.conf.template /etc/nginx/ssl.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
