#!/bin/sh
set -eu

echo "[entrypoint] Ensuring database is ready and PostGIS extension exists..."
python - <<'PY'
import os, time, psycopg2
host=os.getenv('POSTGRES_HOST','db')
user=os.getenv('POSTGRES_USER')
password=os.getenv('POSTGRES_PASSWORD')
db=os.getenv('POSTGRES_DB')
for i in range(60):
    try:
        conn = psycopg2.connect(host=host, user=user, password=password, dbname=db)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        cur.close()
        conn.close()
        break
    except Exception as e:
        time.sleep(1)
else:
    raise SystemExit('DB not ready')
PY

echo "[entrypoint] Running migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Collecting static files (ignore errors in dev)..."
python manage.py collectstatic --noinput || true

echo "[entrypoint] Starting Django dev server on 0.0.0.0:8000"
exec python manage.py runserver 0.0.0.0:8000
