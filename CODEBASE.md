# EZRA codebase guide

EZRA is a self-care app. It has goals, tasks, and progress without streaks. The repository contains an Expo and React Native frontend, a Flask JSON API, and Docker Compose files for the services.

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

See the [root README](README.md) for general setup. Use the [frontend guide](frontend/README.md), [backend guide](backend/README.md), and [Docker guide](DOCKER.md) to start each service. See [frontend/DEPENDENCIES.md](frontend/DEPENDENCIES.md) to change frontend packages. The [technical guide](docs/TECHNICAL_DOCUMENTATION.md) lists versions, licenses, and SDK references.

## How a request moves through the app

1. A file under `frontend/src/app/` renders a route. Tab screens use `useApi` to load data when the screen gains focus. They use `useMutation` to prevent duplicate writes while a request runs.
2. The screen calls a method in `frontend/src/api/client.ts`. The client adds `/api`, encodes JSON, handles `204 No Content`, and formats network and API errors.
3. Flask registers resource blueprints in `backend/app/__init__.py`. Route handlers validate requests. They read or update SQLAlchemy models and return JSON.
4. Model `to_dict()` methods define the API response shape. Matching TypeScript types are in `frontend/src/types/models.ts`.

Keep endpoint paths and JSON field names in sync across the route, API client, and TypeScript model. API JSON uses `snake_case`. React component props use TypeScript naming conventions.

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

`frontend/src/app/_layout.tsx` defines the root stack. `frontend/src/app/(tabs)/_layout.tsx` defines the four tabs and uses the custom `TabBar`. Put shared UI in `frontend/src/components/`. Put route screens in `src/app/`. Expo Router treats files in this folder as routes.

## Component catalog

Components are in `frontend/src/components/`. Most components display data and call callbacks. Screens load data and make changes, then pass values and callbacks to components.

| Component | Purpose and main props |
| --- | --- |
| `Screen` | Provides a safe-area, scrollable page. Set `title`, optional `subtitle`, and `children`. |
| `Button` | Shows a primary or secondary pill action. Set `label`, optional `onPress`, `disabled`, and `variant`. |
| `Card` | Groups content. Set `title`, optional `description`, `tone` (`default`, `mint`, `peach`, `sky`), and `children`. |
| `Field` | Shows a labelled React Native `TextInput`. It accepts `TextInput` props and `label`. `FieldGroup` labels custom controls such as `Chips`. |
| `Chips` | Shows selectable pills. Pass `options`, `isSelected(value)`, and `onPress(value)`. The parent controls the selection. |
| `CheckRow` | Shows a goal or checklist row with a checkbox. It supports `checked`, `muted`, `disabled`, and optional text and action callbacks. |
| `TaskCard` | Shows a task, due-date text, and completion checkbox. Pass `task`, local `today`, `onToggle`, and `onPress`. |
| `SwipeableTask` | Adds swipe actions to a task row. Pass `children`, `rightLabel`, `onSwipeRight`, optional `onSwipeLeft`, and `disabled`. |
| `FocusCard` | Shows today's next action and an animated completion ring. Pass `done`, `total`, optional `next`, `onDone`, and `disabled`. |
| `GoalForm` | Provides a shared create and edit form. Pass controlled `draft` (`title`, `description`, `days`) and `onChange`. Weekday `0` is Monday; weekday `6` is Sunday. An empty `days` list means every day. |
| `QuickActions` | Shows an animated shortcut menu. Control it with `open`, `onClose`, and the `bottom` offset. |
| `TabBar` | Shows five tab slots and a centre EZRA quick-action button. The tabs layout passes Expo Router tab-bar props. |
| `EzraMark` | Shows the EZRA fish mark as an SVG. Set `color` and optional `size`. |
| `WeekBars` | Shows completion bars for each day. Pass `days` (`date`, `done`) and optional local `today` label. |
| `UndoToast` | Shows an undo message for four seconds. Pass `message`, `onUndo`, and `onDismiss`. |
| `Loading`, `ErrorState`, `EmptyState` | Show request and list states. `ErrorState` takes `message` and optional `onRetry`. `EmptyState` takes `title` and optional `description`. |

Use `frontend/src/constants/theme.ts` for shared colors, spacing, and text styles. Interactive components can trigger haptics and expose accessibility roles. Keep these behaviors when you reuse or change a component.

## Backend resources and data model

- **Goal** stores a title, description, start date, weekday schedule, and archive state. In `days_of_week`, Monday is `0` and Sunday is `6`. An empty list means every day.
- **Occurrence** stores one goal check-in for one date. Its status is `pending`, `done`, or `skipped`. A unique constraint allows one row for each goal and date.
- **Task** stores a title, notes, completion state, optional due date, and optional goal link.
- **Revision** stores changes to a goal's title, description, or schedule. It includes old and new values and an optional note. Archive changes do not create revisions.

Routes are grouped in `backend/app/routes/`: `goals.py`, `tasks.py`, `today.py`, and `progress.py`. Shared API errors use `{"error":{"code":"...","message":"..."}}` and are formatted by `backend/app/errors.py`.

### Progress rules

- The API does not calculate streaks. It calculates progress for a requested date range.
- Skipped occurrences are excluded from the completion-rate denominator.
- The API creates check-in rows when a client requests `/api/today`. Progress uses each goal's current schedule to calculate scheduled dates, even when the app was not open.
- A schedule change can change scheduled counts for past dates. The API keeps completed check-ins.
- Recovery suggestions use a threshold in `backend/app/routes/progress.py`. This is a product heuristic, not a validated assessment.

## Dates and time zones

Dates such as due dates, goal start dates, and occurrence dates use the user's local calendar and the `YYYY-MM-DD` format. The frontend must send its local date. Use the helpers in `frontend/src/lib/dates.ts`. Do not use `toISOString()` for local dates. It converts dates to UTC and can change the day.

The backend returns timestamps in ISO 8601 UTC format. For Today and progress requests, the client sends the local date. This prevents the server timezone from selecting the user's date. The server uses `date.today()` only when a caller omits the date.

## Where to make common changes

| Change | Files to review |
| --- | --- |
| Add or edit a screen | `frontend/src/app/`, shared components in `frontend/src/components/`, and route setup in `_layout.tsx` |
| Add a frontend API call | `frontend/src/api/client.ts`, `frontend/src/types/models.ts`, and the screen or hook that uses it |
| Add or change an endpoint | `backend/app/routes/`, validation in `backend/app/validation.py`, backend API tests, and frontend API/types if the contract changes |
| Change stored data | `backend/app/models.py` and related routes and tests. `db.create_all()` does not migrate existing databases. |
| Change shared visual style | `frontend/src/constants/theme.ts` and shared components |
| Change configuration or service startup | `frontend/app.json`, Dockerfiles, `docker-compose.yml`, and the relevant setup guide |

For frontend contribution conventions and checks, see [frontend/CONTRIBUTING.md](frontend/CONTRIBUTING.md). For the API endpoint reference and backend conventions, see [backend/README.md](backend/README.md).

## Developer onboarding

### Run with Docker Compose

Use Docker Compose to run the API and web app together. Run this command from the repository root:

```sh
docker compose up --build
```

Open the web app at `http://localhost:8080`. The API listens at `http://localhost:5000`. Check the API with `curl http://localhost:5000/api/health`. To use Expo Go on a phone, create a root `.env` file. Set your computer's LAN address, then start Metro:

```dotenv
LAN_IP=192.168.1.20
```

```sh
docker compose --profile dev up --build metro
```

Connect the phone and computer to the same network. Run `docker compose down` to stop the services and keep named volumes. Run `docker compose down -v` to also delete the SQLite database volume and the cached Metro `node_modules` volume.

### Manual development

Start the backend in one terminal:

```sh
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
python run.py
```

The backend reads `DATABASE_URL`, `CORS_ORIGINS`, and `PORT` from the process environment. `python run.py` does not load `.env` files. See `backend/.env.example` for the variable names and defaults.

In a second terminal, install and start the frontend:

```sh
cd frontend
npm ci
cp .env.example .env
npm start
```

Use Expo Go to scan the development QR code. On a phone, set `EXPO_PUBLIC_API_URL` in `frontend/.env` to `http://<computer-LAN-IP>:5000`. On the phone, `localhost` points to the phone. If another service uses port 5000, run the backend with `PORT=5001` and set the frontend URL to port 5001.

### Environment variables

| Variable | Read by | Default / purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Frontend bundle | `http://localhost:5000`; base URL for the Flask API. Set in `frontend/.env` for manual development. |
| `DATABASE_URL` | Flask app | `sqlite:///ezra.db` for a local instance database; Docker sets `sqlite:////data/ezra.db`. |
| `CORS_ORIGINS` | Flask app / Compose | Comma-separated browser origins; defaults to `http://localhost:8081` in Flask and Compose allows ports 8080 and 8081. Native app requests do not use browser CORS. |
| `PORT` | `backend/run.py` | `5000`; manual Flask development server port. |
| `LAN_IP` | Docker Compose Metro service | Defaults to `localhost`; set this to the host computer's LAN IP for phone access and QR URLs. |
| `WEB_API_URL` | Docker web image build | `http://localhost:5000`; Compose passes it as the build-time API URL embedded in the static web bundle. Rebuild `web` after changing it. |

The repository has separate `backend/.env.example` and `frontend/.env.example` files. Create a root `.env` file for Compose settings such as `LAN_IP` or `WEB_API_URL`.

## API reference

All endpoints use the `/api` prefix. They accept and return JSON, except that delete requests return `204 No Content`. JSON fields use `snake_case`. Dates use `YYYY-MM-DD`. Timestamps use ISO 8601 UTC. Invalid requests return `{"error":{"code":"...","message":"..."}}`.

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

The objects above are examples. A Today occurrence also contains its related `goal`. A revision contains `id`, `goal_id`, `changes`, `note`, and `created_at`. Each changed field in `changes` maps to `{ "from": ..., "to": ... }`.

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

See `backend/README.md` for the endpoint index and backend setup instructions.

## Local deployment notes

The backend uses SQLite and has no authentication. Use the development server and current deployment setup only on a local or trusted network. Do not expose them as a public service. See [DOCKER.md](DOCKER.md) for volume and rebuild instructions.

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

The tests use an isolated database. The settings are in `backend/tests/conftest.py`. Do not run database deletion commands against a database that contains user data.
