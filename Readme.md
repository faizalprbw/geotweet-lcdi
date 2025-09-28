# GeoTweet — React (Vite) + Django REST + PostGIS (Docker Compose)

A small full-stack app with login/register, a tweet-style dashboard (140 chars), a Leaflet map of all posts, and Swagger API docs. Posts must contain a **place name** (e.g., "Jakarta", "Raja Ampat"); backend geocodes the text via **Nominatim** and stores a Point geometry in PostGIS.

---

## Features
- **Auth**: Register & Login (JWT). Errors shown in frontend via SweetAlert.
- **Dashboard**: Textarea (≤ 140 chars). Post is **rejected** if no recognizable location found.
- **Map (Leaflet)**: Shows all posts; popup has avatar, user, text, timestamp.
- **Deep link**: From Dashboard → click 📍 opens `/map?focus=<id>` and auto-zooms + opens popup.
- **API Docs**: Swagger UI embedded at `/api/docs/`.
- **One command**: `docker compose up --build` (builds images, runs migrations automatically).

---

## Stack
- **Frontend**: React 18 + Vite, React Router, Axios, SweetAlert2, React-Leaflet.
- **Backend**: Django 5 + DRF, SimpleJWT, drf-spectacular, GeoDjango.
- **Database**: Postgres + PostGIS (official `postgis/postgis` image).

---

## Repository Structure
```
geo-tweet/
├─ docker-compose.yml
├─ .env
├─ backend/
│  ├─ Dockerfile
│  ├─ entrypoint.sh
│  ├─ requirements.txt
│  ├─ manage.py
│  ├─ config/...
│  └─ app/...
└─ frontend/
   ├─ Dockerfile
   ├─ package.json
   └─ src/...
```

---

## Prerequisites
- Docker & Docker Compose
(https://docs.docker.com/get-started/get-docker/)
---

## Quickstart (OS Ubuntu Server)
```bash
git clone https://github.com/faizalprbw/geotweet-lcdi.git
docker compose up -d --build
```
Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Swagger: http://localhost:8000/api/docs/

Access (Via NGINX Revers proxy):
- Frontend: http://localhost
- Backend API: http://localhost/api/
- Swagger: http://localhost/api/docs/

**First time:** migrations run automatically. (Optional) Create an admin user later:
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Environment Variables (`.env` at repo root)
```env
# General
PROJECT_NAME=geo-tweet
DJANGO_SECRET=change-me-in-production
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=*

# DB
POSTGRES_DB=geodb
POSTGRES_USER=geo
POSTGRES_PASSWORD=geo123
POSTGRES_HOST=db
POSTGRES_PORT=5432

# CORS (comma-separated origins)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://frontend:5173

# Nominatim (identify your app politely)
NOMINATIM_EMAIL=you@example.com
```

---

## How It Works
- **Post creation**: Frontend sends `{ text }` to `POST /api/posts/`. The backend calls Nominatim `/search?q=<text>`.
  - If no result → `400` with message → frontend shows **SweetAlert**.
  - If found → point is saved as `geom` (EPSG:4326) with `location_name`.
- **Map**: Frontend loads `GET /api/posts.geojson` and renders with Leaflet.
- **Deep link**: Dashboard’s 📍 links to `/map?focus=<id>`, Map reads it and flies to the point.

## Diagrams
### ERD
<img width="277" height="407" alt="image" src="https://github.com/user-attachments/assets/000c50f7-b3de-481f-b302-87192322b1f0" />

### Business Process Flow
<img width="593" height="1168" alt="image" src="https://github.com/user-attachments/assets/c89063f3-6a85-4012-a413-3f3205a8d0ca" />

---

## API Summary
Base URL: `http://localhost:8000/api/`

Auth (JWT):
- `POST /auth/register/` — body: `{ username, password }`
- `POST /auth/login/` — body: `{ username, password }` → `{ access, refresh }`

Posts:
- `GET /posts/` — list all posts (desc by time)
- `POST /posts/` — create `{ text }` (must include recognizable place name)
- `GET /posts/{id}/` — get one post
- `GET /posts.geojson` — GeoJSON FeatureCollection of all posts

Docs:
- `GET /schema/` — OpenAPI schema (JSON)
- `GET /docs/` — Swagger UI

---

## Frontend Notes
- Dev server runs at `5173` and proxies `/api` to `backend:8000` (see `vite.config.js`).
- Tokens saved in `localStorage` for simplicity (demo). Consider httpOnly cookies for production.

---

## Data Model (simplified)
```text
Post
- user: FK auth_user
- text: Char(140)
- location_name: Char(200)
- geom: Point (SRID 4326)
- created_at: DateTime (auto)
```

---

## Troubleshooting
- **Port already in use**: change ports in `docker-compose.yml` or stop the other service.
- **Can’t connect to DB**: ensure `db` becomes healthy; compose has a healthcheck and backend waits.
- **Nominatim 429/timeout**: set `NOMINATIM_EMAIL`, implement backoff or caching for heavy use.
- **Map markers not showing**: ensure Leaflet icon URLs load (see `MapPage.jsx` setup) and CORS is configured.
- **CORS errors**: set `CORS_ALLOWED_ORIGINS` to your frontend origin.

---

## Scripts & Useful Commands
```bash
# Run migrations manually
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Open Django shell
docker compose exec backend python manage.py shell
```

---

## License
For demo/educational use. Adapt before production.
