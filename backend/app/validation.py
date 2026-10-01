from datetime import date

from flask import request

from .errors import ApiError


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Request body must be a JSON object")
    return data


def clean_str(value, field, *, max_len, allow_empty=False):
    if not isinstance(value, str):
        raise ApiError(f"'{field}' must be a string")
    value = value.strip()
    if not value and not allow_empty:
        raise ApiError(f"'{field}' cannot be empty")
    if len(value) > max_len:
        raise ApiError(f"'{field}' must be at most {max_len} characters")
    return value


def clean_bool(value, field):
    if not isinstance(value, bool):
        raise ApiError(f"'{field}' must be true or false")
    return value


def clean_days(value):
    ok = isinstance(value, list) and all(
        isinstance(d, int) and not isinstance(d, bool) and 0 <= d <= 6 for d in value
    )
    if not ok:
        raise ApiError("'days_of_week' must be a list of integers, 0 (Mon) to 6 (Sun)")
    return sorted(set(value))


def parse_date(value, field):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise ApiError(f"'{field}' must be a date formatted YYYY-MM-DD")


def clean_optional_date(value, field):
    return None if value is None else parse_date(value, field)
