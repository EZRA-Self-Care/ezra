# Docker

This file, `docker-compose.yml`, and `.env.example` are in the repository root. The `backend/` and `frontend/` folders are also in this folder.

## What each container is

| Service | Image target | What it does |
| --- | --- | --- |
| `backend` | `backend/Dockerfile` | Flask API under gunicorn, SQLite in the `ezra-data` volume, port 5000 |
| `web` | `frontend/Dockerfile` → `web` | Static Expo **web** export served by nginx, port 8080 |
| `metro` | `frontend/Dockerfile` → `dev` | Metro dev server for Expo Go, port 8081 (opt-in profile) |

Docker does not run the iOS or Android app. To test on a phone, use Expo Go with the `metro` service. You can also use EAS to build a native app.

## Run the services

```bash
cp .env.example .env             # Edit LAN_IP if you will use a phone.

# Build and run the backend alone.
docker build -t backend backend && docker run -p 5000:5000 -v ezra-data:/data backend

# Start the backend and web app. Open http://localhost:8080.
docker compose up --build

# Start the backend and Metro for Expo Go. Scan the QR code.
docker compose --profile dev up --build metro

# Stop the services. Add -v to delete the database and cached node_modules.
docker compose down
```

## Configuration and limits

- The web image includes the API URL at build time. If you change `WEB_API_URL`, rebuild the web image with `docker compose build web`.
- Metro dependencies are stored in a named volume. At startup, Metro checks `package.json` and `package-lock.json`. It runs `npm ci` if either file changed. To rebuild and recreate Metro, run `docker compose --profile dev up --build --force-recreate metro`. This command keeps the database volume.
- The frontend reads `process.env.EXPO_PUBLIC_API_URL`. If you change this name in `src/api/client.ts`, update the Dockerfile and Compose file.
- Gunicorn uses one worker. SQLite and startup table creation require this configuration.
- The services do not use TLS or authentication. Do not expose this setup to the public internet.
