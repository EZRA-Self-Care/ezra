import os

from flask import Flask, jsonify
from flask_cors import CORS

from .errors import register_error_handlers
from .extensions import db


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", "sqlite:///ezra.db"),
        CORS_ORIGINS=os.environ.get("CORS_ORIGINS", "http://localhost:8081").split(","),
    )
    if config:
        app.config.update(config)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    register_error_handlers(app)

    from .routes import goals, progress, tasks, today

    for module in (goals, tasks, today, progress):
        app.register_blueprint(module.bp)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    with app.app_context():
        # No migrations: create_all() only creates missing tables, it never alters existing ones.
        db.create_all()

    return app
