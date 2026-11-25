# EZRA — Backend

This folder contains the Flask and SQLite API for the EZRA Expo app (`../frontend`).

## Run with Docker

See the [Docker guide](../DOCKER.md).

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
python run.py               # http://0.0.0.0:5000
pytest                      # tests
```

The server reads `DATABASE_URL`, `CORS_ORIGINS`, and `PORT` from the process environment. `python run.py` does not load `.env` files. See `.env.example` for the variable names and defaults.

When you test on a phone, set the frontend API URL to `http://<your-LAN-IP>:5000`.
On macOS, AirPlay Receiver can use port 5000. If it does, set `PORT=5001` and update the frontend `.env` file.

## Conventions

- All routes use the `/api` prefix. Send and receive JSON. JSON keys use `snake_case`.
- Dates use `YYYY-MM-DD`. Timestamps use ISO 8601 UTC.
- Errors use `{"error": {"code": "...", "message": "..."}}`. The API also returns a matching HTTP status.
- Send the client's local date in `?date=`, `start_date`, and `end=` values. The server uses `date.today()` only as a fallback. The server date can differ from the client's date near midnight.
- The API has no authentication and supports one user. Anyone who can reach the server can read and change all data.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | |
| GET | `/api/today?date=` | Scheduled goal check-ins (created on request), open tasks due on or before the date, and summary counts |
| PATCH | `/api/occurrences/<id>` | `{status: "pending" \| "done" \| "skipped"}` |
| GET / POST | `/api/goals` | `?include_archived=true`. POST: `title`, `description?`, `days_of_week?` (0=Mon..6=Sun, empty = daily), `start_date?` |
| GET / PATCH / DELETE | `/api/goals/<id>` | PATCH also takes `archived` and `note`; edits to title/description/days create a Revision |
| GET | `/api/goals/<id>/revisions` | Newest first, `changes: {field: {from, to}}` |
| GET | `/api/goals/<id>/occurrences?from=&to=` | Default: last 30 days |
| GET / POST | `/api/tasks` | `?done=true\|false&goal_id=`. POST: `title`, `notes?`, `due_date?`, `goal_id?` |
| GET / PATCH / DELETE | `/api/tasks/<id>` | |
| GET | `/api/progress?days=14&end=` | Per-day counts, per-goal rates, `recovery` suggestions. `days` max 90 |

See the [codebase guide](../CODEBASE.md#api-reference) for request and response shapes.

## Behavior

- The API does not calculate streaks. It reports counts and rates for a date range. The `skipped` status is excluded from the completion rate.
- The API creates occurrence rows when a client calls `/api/today` for a date. `/api/progress` calculates scheduled days from each goal's schedule. It includes dates when the app was not open.
- Recovery suggestions use a threshold in `routes/progress.py`: at least three attempts and less than 50% completion. This is a product heuristic. It is not a validated behavior model.

## Known limitations

- `db.create_all()` creates tables. It does not change existing tables. Add Flask-Migrate before you need to change a database schema that contains user data.
- If you edit a goal's schedule, `/api/progress` uses the new schedule for past dates. It keeps completed check-ins.
- Tasks use one flat list. The API does not support named lists.
- The API does not handle reminders (UI-05). The device schedules local notifications.
- The Flask development server is for development. For a deployed service, use Gunicorn behind HTTPS.
