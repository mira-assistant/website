# Mira website

Vite + React SPA. See [`.env.example`](./.env.example) for `MIRA_API_URL` and `BETA`.

## Development

```bash
npm install
npm run dev
```

## Environment (`MIRA_API_URL`, `BETA`)

- **`MIRA_API_URL`** — API origin **without** `/api/v1` (that suffix is added in code).
- **`BETA`** — exactly `true` selects `/api/v2`; anything else (including unset) uses **`/api/v1`**. Production builds should use **`BETA=false`**.

Copy `.env.example` to `.env` (or `.env.local`) for local development.

## Using a production API from localhost

Set `MIRA_API_URL` in `.env` to your deployed API (e.g. Railway). The app uses **HTTPS REST** and **`wss://`** for realtime events, so this works from `npm run dev` without tunnels.

Your backend must **allow the browser origin** (e.g. `http://localhost:5173`) for both HTTP and WebSocket if you restrict `CORS_ORIGINS` (wildcard `*` already allows everything).

## Production builds (CI / hosting)

Set `MIRA_API_URL` and `BETA=false` in the environment (or write a `.env.production` with those keys) **before** `vite build` so values are inlined.

On **GitHub Actions**, expose the org secret to the build (e.g. `MIRA_API_URL: ${{ secrets.MIRA_API_URL }}`) so `vite build` inlines the same value as the Electron release pipeline.
