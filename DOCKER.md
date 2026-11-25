# Docker

This file and `docker-compose.yml` are in the repository root. The `backend/` and `frontend/` folders are also in this folder. The `.env.example` files are in the `backend/` and `frontend/` folders.

## What each container is

| Service | Image target | What it does |
| --- | --- | --- |
| `backend` | `backend/Dockerfile` | Runs the Flask API with Gunicorn. Stores SQLite data in the `ezra-data` volume. Uses port 5000. |
| `web` | `frontend/Dockerfile` → `web` | Serves the static Expo web app with nginx. Uses port 8080. |
| `metro` | `frontend/Dockerfile` → `dev` | Runs the Metro development server for Expo Go. Uses port 8081. Start it with the `dev` profile. |

Docker does not run the iOS or Android app. To test on a phone, use Expo Go with the `metro` service. You can also use EAS to build a native app.

## Run the services

To use Expo Go on a phone, create a root `.env` file. Set `LAN_IP` to your computer's LAN address. For example, use `LAN_IP=192.168.1.20`.

```bash
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
- Metro dependencies are stored in a named volume. If `package.json` or `package-lock.json` changes, update the volume with `docker compose --profile dev run --rm --no-deps metro npm ci`. This command keeps the database volume.
- The frontend reads `process.env.EXPO_PUBLIC_API_URL`. If you change this name in `src/api/client.ts`, update the Dockerfile and Compose file.
- Gunicorn uses one worker. SQLite and startup table creation require this configuration.
- The services do not use TLS or authentication. Do not expose this setup to the public internet.
