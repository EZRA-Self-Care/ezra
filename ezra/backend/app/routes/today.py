from datetime import date

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..errors import ApiError
from ..extensions import db
from ..models import OCCURRENCE_STATUSES, Goal, Occurrence, Task, utcnow
from ..validation import json_body, parse_date

bp = Blueprint("today", __name__, url_prefix="/api")


def _occurrences_for(day, goals):
    by_goal = {o.goal_id: o for o in Occurrence.query.filter_by(date=day)}
    missing = [g for g in goals if g.id not in by_goal]
    if missing:
        db.session.add_all(Occurrence(goal_id=g.id, date=day) for g in missing)
        try:
            db.session.commit()
        except IntegrityError:  # a concurrent request created them first
            db.session.rollback()
        by_goal = {o.goal_id: o for o in Occurrence.query.filter_by(date=day)}
    return [by_goal[g.id] for g in goals if g.id in by_goal]


@bp.get("/today")
def today():
    """Dashboard payload. Pass ?date=YYYY-MM-DD (client-local date) to avoid server timezone bugs."""
    day = parse_date(request.args["date"], "date") if "date" in request.args else date.today()

    goals = Goal.query.filter_by(archived=False).order_by(Goal.id).all()
    scheduled = [g for g in goals if g.start_date <= day and g.is_scheduled_on(day)]
    occurrences = _occurrences_for(day, scheduled)
    goal_by_id = {g.id: g for g in scheduled}

    tasks = (
        Task.query.filter(Task.done.is_(False), Task.due_date.isnot(None), Task.due_date <= day)
        .order_by(Task.due_date, Task.id)
        .all()
    )
    return jsonify(
        {
            "date": day.isoformat(),
            "occurrences": [{**o.to_dict(), "goal": goal_by_id[o.goal_id].to_dict()} for o in occurrences],
            "tasks": [t.to_dict() for t in tasks],
            "summary": {
                "goals_done": sum(o.status == "done" for o in occurrences),
                "goals_total": len(occurrences),
                "tasks_due": len(tasks),
            },
        }
    )


@bp.patch("/occurrences/<int:occurrence_id>")
def update_occurrence(occurrence_id):
    occ = db.get_or_404(Occurrence, occurrence_id)
    status = json_body().get("status")
    if status not in OCCURRENCE_STATUSES:
        raise ApiError(f"'status' must be one of: {', '.join(OCCURRENCE_STATUSES)}")
    occ.status = status
    occ.completed_at = utcnow() if status == "done" else None
    db.session.commit()
    return jsonify(occ.to_dict())
