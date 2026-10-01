from datetime import date, timedelta

from flask import Blueprint, jsonify, request

from ..errors import ApiError
from ..extensions import db
from ..models import Goal, Occurrence, Revision, Task
from ..validation import clean_bool, clean_days, clean_str, json_body, parse_date

bp = Blueprint("goals", __name__, url_prefix="/api/goals")


@bp.get("")
def list_goals():
    query = Goal.query
    if request.args.get("include_archived") != "true":
        query = query.filter_by(archived=False)
    goals = query.order_by(Goal.id.desc()).all()
    return jsonify([g.to_dict() for g in goals])


@bp.post("")
def create_goal():
    data = json_body()
    if "title" not in data:
        raise ApiError("'title' is required")
    start = data.get("start_date")
    goal = Goal(
        title=clean_str(data["title"], "title", max_len=200),
        description=clean_str(data.get("description", ""), "description", max_len=2000, allow_empty=True),
        days_of_week=clean_days(data.get("days_of_week", [])),
        # Clients should send their local date; server date is a UTC-ish fallback.
        start_date=parse_date(start, "start_date") if start is not None else date.today(),
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal.to_dict()), 201


@bp.get("/<int:goal_id>")
def get_goal(goal_id):
    return jsonify(db.get_or_404(Goal, goal_id).to_dict())


@bp.patch("/<int:goal_id>")
def update_goal(goal_id):
    goal = db.get_or_404(Goal, goal_id)
    data = json_body()
    changes = {}

    def apply(field, new):
        old = getattr(goal, field)
        if old != new:
            changes[field] = {"from": old, "to": new}
            setattr(goal, field, new)

    if "title" in data:
        apply("title", clean_str(data["title"], "title", max_len=200))
    if "description" in data:
        apply("description", clean_str(data["description"], "description", max_len=2000, allow_empty=True))
    if "days_of_week" in data:
        apply("days_of_week", clean_days(data["days_of_week"]))
    if "archived" in data:
        goal.archived = clean_bool(data["archived"], "archived")  # not recorded as a revision

    if changes:
        note = clean_str(data.get("note", ""), "note", max_len=500, allow_empty=True)
        db.session.add(Revision(goal_id=goal.id, changes=changes, note=note))
    db.session.commit()
    return jsonify(goal.to_dict())


@bp.delete("/<int:goal_id>")
def delete_goal(goal_id):
    goal = db.get_or_404(Goal, goal_id)
    # Keep the person's to-dos; just detach them from the goal.
    Task.query.filter_by(goal_id=goal.id).update({"goal_id": None})
    db.session.delete(goal)  # cascades occurrences + revisions
    db.session.commit()
    return "", 204


@bp.get("/<int:goal_id>/revisions")
def list_revisions(goal_id):
    goal = db.get_or_404(Goal, goal_id)
    return jsonify([r.to_dict() for r in goal.revisions])


@bp.get("/<int:goal_id>/occurrences")
def list_goal_occurrences(goal_id):
    db.get_or_404(Goal, goal_id)
    end = parse_date(request.args["to"], "to") if "to" in request.args else date.today()
    start = parse_date(request.args["from"], "from") if "from" in request.args else end - timedelta(days=29)
    if start > end:
        raise ApiError("'from' must not be after 'to'")
    if (end - start).days > 366:
        raise ApiError("Range cannot exceed 366 days")
    rows = (
        Occurrence.query.filter(Occurrence.goal_id == goal_id, Occurrence.date >= start, Occurrence.date <= end)
        .order_by(Occurrence.date)
        .all()
    )
    return jsonify([o.to_dict() for o in rows])
