# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DATABASE_URL=sqlite:////data/ezra.db

# Non-root user; /data holds the SQLite file and is meant to be a volume.
RUN groupadd --system app \
 && useradd --system --gid app --uid 10001 app \
 && mkdir /data && chown app:app /data

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# --chown matters: COPY keeps source permissions, and a 600 file owned by root is unreadable to the non-root user.
COPY --chown=app:app app ./app

USER app
VOLUME /data
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/api/health', timeout=2)"

# One worker on purpose: SQLite allows a single writer, and create_all() runs at app
# startup, so several workers would race on first boot. Threads give enough concurrency here.
# --no-control-socket: gunicorn 26 otherwise tries to create ~/.gunicorn, and this user has no home dir.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "--no-control-socket", "--access-logfile", "-", "app:create_app()"]
