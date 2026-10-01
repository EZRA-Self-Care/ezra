from flask import jsonify
from werkzeug.exceptions import HTTPException

from .extensions import db


class ApiError(Exception):
    def __init__(self, message, status=400, code="bad_request"):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code


def _body(code, message):
    return jsonify(error={"code": code, "message": message})


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(e):
        return _body(e.code, e.message), e.status

    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        return _body(e.name.lower().replace(" ", "_"), e.description), e.code

    @app.errorhandler(Exception)
    def handle_unexpected(e):
        app.logger.exception("Unhandled error")
        db.session.rollback()
        return _body("server_error", "Something went wrong on our side."), 500
