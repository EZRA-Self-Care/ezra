# EZRA codebase guide

EZRA is a self-care app built around goals, practical tasks, and progress without streaks. The repository has an Expo / React Native frontend, a Flask JSON API, and Docker Compose files for running the services together.

## Repository map

| Path | Responsibility |
| --- | --- |
| `frontend/src/app/` | Expo Router screens and navigation layouts |
| `frontend/src/components/` | Shared controls and visual components used by screens |
| `frontend/src/api/client.ts` | Typed frontend API client, base URL, and network error handling |
| `frontend/src/types/models.ts` | TypeScript models matching API responses and request bodies |
| `frontend/src/lib/` | API loading/mutation hooks, local date helpers, haptics, and navigation fallback |
| `frontend/src/constants/theme.ts` | Shared colors, spacing, and typography |
| `backend/app/__init__.py` | Flask app factory, CORS, error handlers, route registration, and table creation |
| `backend/app/routes/` | API handlers grouped by resource |
| `backend/app/models.py` | SQLAlchemy models and JSON serializers |
| `backend/app/validation.py` | Shared validation for JSON fields and dates |
| `backend/tests/` | Flask API tests |
| `docker-compose.yml`, `DOCKER.md` | Combined services and Docker workflows |

For install and run commands, see the [root README](README.md), [frontend setup](frontend/README.md), [backend setup](backend/README.md), and [Docker guide](DOCKER.md). Frontend dependency changes are covered in [frontend/DEPENDENCIES.md](frontend/DEPENDENCIES.md).

## How a request moves through the app

1. A file under `frontend/src/app/` renders a route. Tab screens use `useApi` to load on focus and `useMutation` to avoid duplicate writes while a request is in flight.
2. The screen calls a method from `frontend/src/api/client.ts`. That client adds `/api`, serializes JSON, handles `204 No Content`, and turns network or API errors into readable messages.
3. Flask registers resource blueprints in `backend/app/__init__.py`. Route handlers validate request data, read or update SQLAlchemy models, and return JSON.
4. Model `to_dict()` methods shape the API response. The matching TypeScript definitions are in `frontend/src/types/models.ts`.

Keep endpoint paths and JSON field names synchronized across the route, API client, and TypeScript model. API JSON uses `snake_case`; React component props use normal TypeScript conventions.

## Frontend routes

| Route file | Screen |
| --- | --- |
| `frontend/src/app/(tabs)/index.tsx` | Today dashboard and scheduled goal check-ins |
| `frontend/src/app/(tabs)/lists.tsx` | Task list and task filters |
| `frontend/src/app/(tabs)/goals.tsx` | Goal list and archive state |
| `frontend/src/app/(tabs)/progress.tsx` | Progress summary and recovery suggestions |
| `frontend/src/app/goals/new.tsx` | Create a goal |
| `frontend/src/app/goals/[id].tsx` | Edit/archive a goal and view revisions |
| `frontend/src/app/tasks/new.tsx` | Create a task, optionally attached to a goal |
| `frontend/src/app/tasks/[id].tsx` | Edit, complete, or delete a task |

`frontend/src/app/_layout.tsx` defines the root stack. `frontend/src/app/(tabs)/_layout.tsx` defines the four tabs and supplies the custom `TabBar`. Shared UI belongs in `frontend/src/components/`; keep route screens inside `src/app/` because Expo Router treats files there as routes.

## Component catalog

Components live in `frontend/src/components/`. Most are presentational: screens own data fetching and mutations, then pass values and callbacks down.

| Component | Purpose and main props |
| --- | --- |
| `Screen` | Safe-area, scrollable page shell; `title`, optional `subtitle`, and `children`. |
| `Button` | Primary or secondary pill action; `label`, optional `onPress`, `disabled`, and `variant`. |
| `Card` | Content container; `title`, optional `description`, `tone` (`default`, `mint`, `peach`, `sky`), and `children`. |
| `Field` | Labelled React Native `TextInput`; accepts the normal `TextInput` props plus `label`. `FieldGroup` labels custom controls such as `Chips`. |
| `Chips` | Generic selectable pill row; `options`, `isSelected(value)`, and `onPress(value)`. Selection stays controlled by the parent. |
| `CheckRow` | Goal/checklist row with checkbox and optional text/action callbacks; supports `checked`, `muted`, and `disabled`. |
| `TaskCard` | Task summary with due-date wording and completion checkbox; receives `task`, local `today`, `onToggle`, and `onPress`. |
| `SwipeableTask` | Gesture wrapper for a task row; `children`, `rightLabel`, `onSwipeRight`, optional `onSwipeLeft`, and `disabled`. |
| `FocusCard` | Today’s next action and animated completion ring; `done`, `total`, optional `next`, `onDone`, and `disabled`. |
| `GoalForm` | Shared create/edit form; controlled `draft` (`title`, `description`, `days`) and `onChange`. Weekdays use `0` for Monday through `6` for Sunday; an empty `days` list means every day. |
| `QuickActions` | Animated shortcut menu; controlled with `open`, `onClose`, and `bottom` offset. |
| `TabBar` | Custom five-slot tab bar with the centre EZRA quick-action button; receives the Expo Router tab-bar props from the tabs layout. |
| `EzraMark` | SVG fish mark; `color` and optional `size`. |
| `WeekBars` | Per-day completion bars; `days` (`date`, `done`) and optional local `today` label. |
| `UndoToast` | Four-second undo message; `message`, `onUndo`, and `onDismiss`. |
| `Loading`, `ErrorState`, `EmptyState` | Shared request/list states. `ErrorState` takes `message` and optional `onRetry`; `EmptyState` takes `title` and optional `description`. |

Use `frontend/src/constants/theme.ts` for shared visual tokens. Interactive components generally trigger haptics and expose accessibility roles; keep those behaviors when reusing or changing them.

## Backend resources and data model

- **Goal** stores title, description, start date, weekday schedule, and archive state. `days_of_week` uses Monday `0` through Sunday `6`; an empty list means every day.
- **Occurrence** is one goal check-in for one date. Its status is `pending`, `done`, or `skipped`. A unique constraint prevents duplicate rows for the same goal and date.
- **Task** stores title, notes, completion state, optional due date, and optional goal link.
- **Revision** records changes to a goal's title, description, or schedule, including old and new values and an optional note. Archive changes are not revisions.

Routes are grouped in `backend/app/routes/`: `goals.py`, `tasks.py`, `today.py`, and `progress.py`. Shared API errors use `{"error":{"code":"...","message":"..."}}` and are formatted by `backend/app/errors.py`.

### Progress rules

- There are no streaks. Progress is calculated over a requested date window.
- Skipped occurrences are excluded from the completion-rate denominator.
- Check-in rows are created lazily when `/api/today` is requested. Progress derives scheduled dates from each goal's current schedule, even when the app was not opened that day.
- Consequently, changing a goal's schedule can change historical scheduled counts. Completed check-ins remain counted.
- Recovery suggestions use a simple threshold in `backend/app/routes/progress.py`; they are a product heuristic, not a validated assessment.

## Dates and time zones

Dates such as a due date, goal start date, or occurrence date are plain `YYYY-MM-DD` values in the user's local calendar. The frontend should send its local date using helpers in `frontend/src/lib/dates.ts`; avoid converting these dates through `toISOString()`, which changes them to UTC and may shift the day.

The backend serializes timestamps as ISO 8601 UTC. When requesting Today or progress, the client sends the local date explicitly so the server's timezone does not choose the user's day. The server's `date.today()` defaults are fallbacks for callers that omit the date.

## Where to make common changes

| Change | Files to review |
| --- | --- |
| Add or edit a screen | `frontend/src/app/`, shared components under `frontend/src/components/`, and route setup in `_layout.tsx` |
| Add a frontend API call | `frontend/src/api/client.ts`, `frontend/src/types/models.ts`, and the screen or hook that uses it |
| Add or change an endpoint | `backend/app/routes/`, validation in `backend/app/validation.py`, backend API tests, and frontend API/types if the contract changes |
| Change stored data | `backend/app/models.py` and related routes/tests; note that `db.create_all()` does not migrate existing databases |
| Change shared visual style | `frontend/src/constants/theme.ts` and shared components |
| Change configuration or service startup | `frontend/app.json`, Dockerfiles, `docker-compose.yml`, and the relevant setup guide |

For frontend contribution conventions and checks, see [frontend/CONTRIBUTING.md](frontend/CONTRIBUTING.md). For the API endpoint reference and backend conventions, see [backend/README.md](backend/README.md).

## Developer onboarding

### Docker Compose

Docker Compose is the quickest way to run the API and web app together. From the repository root:

```sh
docker compose up --build
```

Open the web app at `http://localhost:8080`; the API listens on `http://localhost:5000`. Check the API with `curl http://localhost:5000/api/health`. To use Expo Go from a phone, create a root `.env` containing your computer's LAN address and start Metro:

```dotenv
LAN_IP=192.168.1.20
```

```sh
docker compose --profile dev up --build metro
```

The phone and computer need to share a network. `docker compose down` stops services and keeps named volumes. `docker compose down -v` also deletes the SQLite database volume and the cached Metro `node_modules` volume.

### Manual development

Start the backend in one terminal:

```sh
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env  # optional; defaults work
python run.py
```

In another terminal, install and start the frontend:

```sh
cd frontend
npm ci
cp .env.example .env
npm start
```

Use Expo Go to scan the development QR code. On a physical phone, set `EXPO_PUBLIC_API_URL` in `frontend/.env` to `http://<computer-LAN-IP>:5000`; `localhost` on the phone points to the phone. If port 5000 is occupied, run the manual backend with `PORT=5001` and change the frontend URL to port 5001.

### Environment variables

| Variable | Read by | Default / purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Frontend bundle | `http://localhost:5000`; base URL for the Flask API. Set in `frontend/.env` for manual development. |
| `DATABASE_URL` | Flask app | `sqlite:///ezra.db` for a local instance database; Docker sets `sqlite:////data/ezra.db`. |
| `CORS_ORIGINS` | Flask app / Compose | Comma-separated browser origins; defaults to `http://localhost:8081` in Flask and Compose allows ports 8080 and 8081. Native app requests do not use browser CORS. |
| `PORT` | `backend/run.py` | `5000`; manual Flask development server port. |
| `LAN_IP` | Docker Compose Metro service | Defaults to `localhost`; set this to the host computer's LAN IP for phone access and QR URLs. |
| `WEB_API_URL` | Docker web image build | `http://localhost:5000`; Compose passes it as the build-time API URL embedded in the static web bundle. Rebuild `web` after changing it. |

The repository has separate `backend/.env.example` and `frontend/.env.example` files. Create a root `.env` yourself for Compose overrides such as `LAN_IP` or `WEB_API_URL`.

## API reference

All endpoints are under `/api`, accept and return JSON unless a delete returns `204 No Content`, and use `snake_case` fields. Dates are `YYYY-MM-DD`; timestamps are ISO 8601 UTC. Invalid requests return `{"error":{"code":"...","message":"..."}}`.

### Shared object shapes

```json
{
  "goal": {
    "id": 12,
    "title": "Read",
    "description": "Make space for it",
    "days_of_week": [0, 2, 4],
    "start_date": "2026-11-24",
    "archived": false,
    "created_at": "2026-11-24T17:00:00+00:00"
  },
  "task": {
    "id": 31,
    "title": "Choose a book",
    "notes": "",
    "done": false,
    "due_date": null,
    "goal_id": 12,
    "created_at": "2026-11-24T17:00:00+00:00",
    "completed_at": null
  },
  "occurrence": {
    "id": 45,
    "goal_id": 12,
    "date": "2026-11-24",
    "status": "pending",
    "completed_at": null
  }
}
```

The objects above are illustrative; a Today occurrence also embeds its related `goal`. A revision has `id`, `goal_id`, `changes` (each changed field maps to `{ "from": ..., "to": ... }`), `note`, and `created_at`.

### Endpoints

| Method and path | Request | Response |
| --- | --- | --- |
| `GET /api/health` | None | `{ "status": "ok" }` |
| `GET /api/today?date=YYYY-MM-DD` | `date` is the client's local date; optional fallback is server date. | `{ date, occurrences: [{ ...occurrence, goal }], tasks: Task[], summary: { goals_done, goals_total, tasks_due } }`. `tasks` are open tasks with a non-null due date on or before the requested date. Scheduled occurrences are created on demand. |
| `PATCH /api/occurrences/{id}` | `{ "status": "pending" }`, `"done"`, or `"skipped"` | Updated occurrence object. `completed_at` is set for `done`, otherwise null. |
| `GET /api/goals?include_archived=true` | Optional query flag; archived goals are excluded unless exactly `true`. | Array of Goal objects. |
| `POST /api/goals` | Required `title`; optional `description`, `days_of_week`, `start_date`. Empty schedule means daily. | Created Goal object (`201`). |
| `GET /api/goals/{id}` | None | Goal object. |
| `PATCH /api/goals/{id}` | Any of `title`, `description`, `days_of_week`, `archived`; optional `note` for an edit-history entry. | Updated Goal object. Changes to title, description, or schedule create a Revision; archiving does not. |
| `DELETE /api/goals/{id}` | None | Empty response (`204`). Linked tasks are kept and detached; occurrences and revisions are deleted. |
| `GET /api/goals/{id}/revisions` | None | Revisions newest first. |
| `GET /api/goals/{id}/occurrences?from=YYYY-MM-DD&to=YYYY-MM-DD` | Optional date range; default is the most recent 30 days. Range cannot exceed 366 days. | Array of stored occurrence objects, ordered by date. This endpoint does not create missing rows. |
| `GET /api/tasks?done=true&goal_id=12` | Optional `done=true|false` and integer `goal_id` filters. | Array of Task objects. |
| `POST /api/tasks` | Required `title`; optional `notes`, `due_date`, `goal_id`. | Created Task object (`201`). |
| `GET /api/tasks/{id}` | None | Task object. |
| `PATCH /api/tasks/{id}` | Any of `title`, `notes`, `due_date`, `goal_id`, `done`. Send only fields to change; use `null` to clear due date or goal link. | Updated Task object. Completion timestamps follow `done`. |
| `DELETE /api/tasks/{id}` | None | Empty response (`204`). |
| `GET /api/progress?days=14&end=YYYY-MM-DD` | `days` defaults to 14 and must be 1–90; `end` defaults to server date. | `{ start, end, days, total_done, per_day: [{ date, done }], goals: [{ goal_id, title, scheduled, done, skipped, completion_rate }], recovery: [{ goal_id, title, completion_rate, suggestion }] }`. `completion_rate` is null when there were no attempts. |

Example writes:

```http
POST /api/goals
Content-Type: application/json

{"title":"Read","description":"Make space for it","days_of_week":[0,2,4],"start_date":"2026-11-24"}
```

```http
POST /api/tasks
Content-Type: application/json

{"title":"Choose a book","due_date":"2026-11-25","goal_id":12}
```

`backend/README.md` remains the concise endpoint index and source for backend setup details.

## Local deployment notes

The backend uses SQLite and has no authentication. The default development server and current deployment setup are intended for local or trusted use, not as a public production service. See [DOCKER.md](DOCKER.md) for volume and rebuild behavior.

## Verification

Frontend commands run from `frontend/`:

```sh
npm run lint
npm run typecheck
```

Backend tests run from `backend/`:

```sh
pytest
```

The tests use an isolated database configured in `backend/tests/conftest.py`. Avoid running destructive database commands against a database containing user data.
