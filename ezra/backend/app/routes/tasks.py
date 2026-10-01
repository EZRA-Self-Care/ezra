from flask import Blueprint, jsonify, request

from ..errors import ApiError
from ..extensions import db
from ..models import Goal, Task, utcnow
from ..validation import clean_bool, clean_optional_date, clean_str, json_body

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


def _clean_goal_id(value):
    if value is None:
        return None
    if not isinstance(value, int) or isinstance(value, bool) or db.session.get(Goal, value) is None:
        raise ApiError("'goal_id' must be null or the id of an existing goal")
    return value


def _set_done(task, done):
    task.done = done
    task.completed_at = utcnow() if done else None


@bp.get("")
def list_tasks():
    query = Task.query
    done = request.args.get("done")
    if done in ("true", "false"):
        query = query.filter_by(done=(done == "true"))
    elif done is not None:
        raise ApiError("'done' must be 'true' or 'false'")
    if "goal_id" in request.args:
        try:
            query = query.filter_by(goal_id=int(request.args["goal_id"]))
        except ValueError:
            raise ApiError("'goal_id' must be an integer")
    tasks = query.order_by(Task.done, Task.due_date.is_(None), Task.due_date, Task.id).all()
    return jsonify([t.to_dict() for t in tasks])


@bp.post("")
def create_task():
    data = json_body()
    if "title" not in data:
        raise ApiError("'title' is required")
    task = Task(
        title=clean_str(data["title"], "title", max_len=200),
        notes=clean_str(data.get("notes", ""), "notes", max_len=2000, allow_empty=True),
        due_date=clean_optional_date(data.get("due_date"), "due_date"),
        goal_id=_clean_goal_id(data.get("goal_id")),
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@bp.get("/<int:task_id>")
def get_task(task_id):
    return jsonify(db.get_or_404(Task, task_id).to_dict())


@bp.patch("/<int:task_id>")
def update_task(task_id):
    task = db.get_or_404(Task, task_id)
    data = json_body()
    if "title" in data:
        task.title = clean_str(data["title"], "title", max_len=200)
    if "notes" in data:
        task.notes = clean_str(data["notes"], "notes", max_len=2000, allow_empty=True)
    if "due_date" in data:
        task.due_date = clean_optional_date(data["due_date"], "due_date")
    if "goal_id" in data:
        task.goal_id = _clean_goal_id(data["goal_id"])
    if "done" in data:
        done = clean_bool(data["done"], "done")
        if done != task.done:
            _set_done(task, done)
    db.session.commit()
    return jsonify(task.to_dict())


@bp.delete("/<int:task_id>")
def delete_task(task_id):
    db.session.delete(db.get_or_404(Task, task_id))
    db.session.commit()
    return "", 204
