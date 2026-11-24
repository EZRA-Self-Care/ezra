# Docker

This file, `docker-compose.yml` and `.env.example` sit in the repo root, next to `backend/` and `frontend/`.

## What each container is

| Service | Image target | What it does |
| --- | --- | --- |
| `backend` | `backend/Dockerfile` | Flask API under gunicorn, SQLite in the `ezra-data` volume, port 5000 |
| `web` | `frontend/Dockerfile` → `web` | Static Expo **web** export served by nginx, port 8080 |
| `metro` | `frontend/Dockerfile` → `dev` | Metro dev server for Expo Go, port 8081 (opt-in profile) |

Docker does not run the iOS/Android app. For phones you either use Expo Go against `metro`, or build native binaries with EAS.

## Use (Individual Commands, use as needed)

```bash
cp .env.example .env             # then edit LAN_IP if you'll use a phone

# Backend alone
docker build -t backend backend && docker run -p 5000:5000 -v ezra-data:/data backend 

# backend + web   -> http://localhost:8080
docker compose up --build

# backend + Metro for Expo Go (scan the QR code)
docker compose --profile dev up --build metro   

# stop; add -v to also delete the database and cached node_modules
docker compose down              
```

## Current Deficiencies...

- **API URL is baked into the web image.** Changing `WEB_API_URL` requires `docker compose build web`.
- **Metro dependencies live in a named volume.** The Metro container checks `package.json` and `package-lock.json` at startup and runs `npm ci` when either changes. Rebuild/recreate Metro with `docker compose --profile dev up --build --force-recreate metro`; this preserves the database volume.
- **Assumed env var name:** the frontend must read `process.env.EXPO_PUBLIC_API_URL`. If `src/api/client.ts` uses a different name, change it in the Dockerfile and compose file.
- **Single gunicorn worker** is deliberate (SQLite + `create_all()` at startup).
- No TLS and no auth. Not for the public internet as-is.
