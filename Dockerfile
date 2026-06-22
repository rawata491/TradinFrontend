FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Optional overrides — when unset, `vite build` uses `.env.production`.
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_APP_NAME
RUN set -e; \
    if [ -n "${VITE_API_BASE_URL:-}" ]; then export VITE_API_BASE_URL="$VITE_API_BASE_URL"; fi; \
    if [ -n "${VITE_WS_URL:-}" ]; then export VITE_WS_URL="$VITE_WS_URL"; fi; \
    if [ -n "${VITE_APP_NAME:-}" ]; then export VITE_APP_NAME="$VITE_APP_NAME"; fi; \
    npm run build

FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1
