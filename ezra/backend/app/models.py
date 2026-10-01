from datetime import datetime, timezone

from .extensions import db

OCCURRENCE_STATUSES = ("pending", "done", "skipped")


def utcnow():
    return datetime.now(timezone.utc)


def _iso(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:  # SQLite drops tzinfo; everything we store is UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False, default="")
    # Weekdays the goal is scheduled, 0=Mon..6=Sun. Empty list = every day.
    days_of_week = db.Column(db.JSON, nullable=False, default=list)
    # Client-local date the goal begins. Nothing is scheduled before it.
    start_date = db.Column(db.Date, nullable=False)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    occurrences = db.relationship("Occurrence", backref="goal", cascade="all, delete-orphan")
    revisions = db.relationship(
        "Revision", backref="goal", cascade="all, delete-orphan", order_by="Revision.id.desc()"
    )

    def is_scheduled_on(self, day):
        return not self.days_of_week or day.weekday() in self.days_of_week

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "days_of_week": self.days_of_week,
            "start_date": self.start_date.isoformat(),
            "archived": self.archived,
            "created_at": _iso(self.created_at),
        }


class Occurrence(db.Model):
    """One scheduled instance of a goal on one date. Created lazily by /api/today."""

    __table_args__ = (db.UniqueConstraint("goal_id", "date"),)

    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey("goal.id"), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(db.String(10), nullable=False, default="pending")
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "goal_id": self.goal_id,
            "date": self.date.isoformat(),
            "status": self.status,
            "completed_at": _iso(self.completed_at),
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text, nullable=False, default="")
    done = db.Column(db.Boolean, nullable=False, default=False)
    due_date = db.Column(db.Date)
    goal_id = db.Column(db.Integer, db.ForeignKey("goal.id"), index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "notes": self.notes,
            "done": self.done,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "goal_id": self.goal_id,
            "created_at": _iso(self.created_at),
            "completed_at": _iso(self.completed_at),
        }


class Revision(db.Model):
    """Snapshot of an edit to a goal: {field: {"from": old, "to": new}}."""

    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey("goal.id"), nullable=False, index=True)
    changes = db.Column(db.JSON, nullable=False)
    note = db.Column(db.String(500), nullable=False, default="")
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "goal_id": self.goal_id,
            "changes": self.changes,
            "note": self.note,
            "created_at": _iso(self.created_at),
        }
