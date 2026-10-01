# EZRA — Backend

Flask + SQLite API for the EZRA Expo app (`../frontend`).

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # optional; defaults work
python run.py               # http://0.0.0.0:5000
pytest                      # tests
```

Point the frontend at `http://<your-LAN-IP>:5000` when testing on a phone.
On macOS, port 5000 is often taken by AirPlay Receiver; set `PORT=5001` and update the frontend `.env`.

## Conventions

- All routes are under `/api`. JSON in, JSON out, `snake_case` keys.
- Dates are `YYYY-MM-DD`; timestamps are ISO-8601 UTC.
- Errors: `{"error": {"code": "...", "message": "..."}}` with a matching HTTP status.
- **Send the client's local date** (`?date=`, `start_date`, `end=`). The server's `date.today()` is only a fallback and will be wrong near midnight for users far from the server's timezone.
- No auth, single-user. Anyone who can reach the server can read and write everything.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | |
| GET | `/api/today?date=` | Scheduled goal occurrences (created on demand), tasks due/overdue, summary |
| PATCH | `/api/occurrences/<id>` | `{status: "pending" \| "done" \| "skipped"}` |
| GET / POST | `/api/goals` | `?include_archived=true`. POST: `title`, `description?`, `days_of_week?` (0=Mon..6=Sun, empty = daily), `start_date?` |
| GET / PATCH / DELETE | `/api/goals/<id>` | PATCH also takes `archived` and `note`; edits to title/description/days create a Revision |
| GET | `/api/goals/<id>/revisions` | Newest first, `changes: {field: {from, to}}` |
| GET | `/api/goals/<id>/occurrences?from=&to=` | Default: last 30 days |
| GET / POST | `/api/tasks` | `?done=true\|false&goal_id=`. POST: `title`, `notes?`, `due_date?`, `goal_id?` |
| GET / PATCH / DELETE | `/api/tasks/<id>` | |
| GET | `/api/progress?days=14&end=` | Per-day counts, per-goal rates, `recovery` suggestions. `days` max 90 |

## Design notes

- **No streaks.** Progress is counts and rates over a window. `skipped` is a first-class status and is excluded from the completion rate, so rest days don't count against anyone.
- **Occurrences are lazy.** Rows appear when `/api/today` is called for a date. `/api/progress` computes scheduled days from the goal's schedule, so days the app was never opened still count as scheduled.
- **Recovery** is a plain threshold heuristic (`routes/progress.py`: ≥3 attempts and <50% completion). It's a placeholder, not a validated behavior model.

## Known limitations

- Schema is created with `db.create_all()`. It won't alter existing tables; once you have real data, add Flask-Migrate.
- Editing a goal's schedule changes how past days are counted in `/api/progress` (done days are never removed, but "scheduled" uses the current schedule).
- Tasks are a flat list; there are no named lists.
- Reminders (UI-05) are not handled here. Local notifications are scheduled on-device.
- Dev server only. Use gunicorn or similar behind HTTPS for anything real.
