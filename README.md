# Tradin Frontend

React + Vite SPA for the Tradin crypto research dashboard.

## Requirements

- Node.js 20+

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The dev server runs at http://localhost:5173 and proxies `/api` and `/ws` to the backend at `:8000`.

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (empty in dev uses proxy) |
| `VITE_WS_URL` | WebSocket URL (optional; derived from API URL) |
| `VITE_APP_NAME` | App display name |

Production example:

```
VITE_API_BASE_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com/ws
```

## Build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker compose up --build
```

Serves static assets on port 8001 (mapped to nginx :80).

## Public routes

- `/welcome` — landing page
- `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/terms`, `/privacy`

All app features require authentication.
