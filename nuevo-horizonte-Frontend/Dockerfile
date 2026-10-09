# ---- Etapa de build ----
FROM node:20-alpine AS build
WORKDIR /app

# Capa de dependencias separada del codigo fuente para aprovechar la cache
# de Docker mientras no cambien package.json/pnpm-lock.yaml.
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
# API_BASE_URL (src/config/env.ts) ya usa "/api" por defecto, que nginx.conf
# redirige al backend: no hace falta ningun build-arg en el caso normal.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# ---- Etapa de servido ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
