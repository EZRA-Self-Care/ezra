from collections import defaultdict
from datetime import date, timedelta

from flask import Blueprint, jsonify, request

from ..errors import ApiError
from ..models import Goal, Occurrence
from ..validation import parse_date

bp = Blueprint("progress", __name__, url_prefix="/api/progress")

# Heuristic thresholds for the "recovery" suggestions. Arbitrary starting values; tune with real use.
MIN_ATTEMPTS = 3
STRUGGLING_BELOW = 0.5


@bp.get("")
def progress():
    try:
        days = int(request.args.get("days", 14))
    except ValueError:
        raise ApiError("'days' must be an integer")
    if not 1 <= days <= 90:
        raise ApiError("'days' must be between 1 and 90")
    end = parse_date(request.args["end"], "end") if "end" in request.args else date.today()
    start = end - timedelta(days=days - 1)

    goals = Goal.query.filter_by(archived=False).order_by(Goal.id).all()
    rows = Occurrence.query.filter(Occurrence.date >= start, Occurrence.date <= end).all()
    rows_by_goal = defaultdict(dict)
    for o in rows:
        rows_by_goal[o.goal_id][o.date] = o

    per_day = {start + timedelta(days=i): 0 for i in range(days)}
    goal_stats, recovery = [], []

    for g in goals:
        goal_rows = rows_by_goal.get(g.id, {})
        # Scheduled days come from the *current* schedule, not from stored rows, so days
        # the app was never opened still count. Side effect: editing a schedule rewrites
        # history for stats purposes. Completed rows always count, so wins never vanish.
        scheduled = skipped = 0
        for i in range(days):
            d = start + timedelta(days=i)
            if d >= g.start_date and g.is_scheduled_on(d):
                scheduled += 1
                if d in goal_rows and goal_rows[d].status == "skipped":
                    skipped += 1
        done_days = [d for d, o in goal_rows.items() if o.status == "done"]
        for d in done_days:
            per_day[d] += 1

        attempted = scheduled - skipped  # rest days aren't held against anyone
        rate = min(1.0, round(len(done_days) / attempted, 2)) if attempted else None
        goal_stats.append(
            {
                "goal_id": g.id,
                "title": g.title,
                "scheduled": scheduled,
                "done": len(done_days),
                "skipped": skipped,
                "completion_rate": rate,
            }
        )
        if rate is not None and attempted >= MIN_ATTEMPTS and rate < STRUGGLING_BELOW:
            recovery.append(
                {
                    "goal_id": g.id,
                    "title": g.title,
                    "completion_rate": rate,
                    "suggestion": "This one has been hard lately. A smaller version or fewer days might fit better right now.",
                }
            )

    return jsonify(
        {
            "start": start.isoformat(),
            "end": end.isoformat(),
            "days": days,
            "total_done": sum(per_day.values()),
            "per_day": [{"date": d.isoformat(), "done": n} for d, n in per_day.items()],
            "goals": goal_stats,
            "recovery": recovery,
        }
    )
