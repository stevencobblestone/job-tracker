# Job Application Tracker — Project Guide

A small MVP for tracking job applications on a kanban board. No login/auth.

## Stack
- `backend/` — Spring Boot 3.x, Java 21, Maven (via `mvnw` wrapper), Spring Data JPA,
  Validation, Flyway, PostgreSQL driver.
- `frontend/` — Angular (latest stable), standalone components, Angular CDK (drag-and-drop).
- Database — PostgreSQL. Local dev runs it in Docker (`docker-compose.yml` at repo root).

## Docker
- `docker compose up -d --build` runs everything: db, backend (Dockerfile in `backend/`),
  frontend (Angular built and served by nginx, `frontend/nginx.conf` proxies `/api` to the backend).
  App at http://localhost:3000. Backend port is not published, to avoid clashing with local dev.
- `docker compose up -d db` starts only the database for local dev (backend on 8080, `ng serve` on 4200).

## Configuration
The backend reads DB settings from environment variables, with local defaults:
`DB_HOST` (localhost), `DB_PORT` (5432), `DB_NAME` (jobtracker), `DB_USER` (jobtracker),
`DB_PASSWORD` (jobtracker). Pointing at AWS Aurora PostgreSQL later = just change these.

## Data model
- `job_application`: id, company, title, url, location, salary_min, salary_max,
  salary_period (YEARLY | HOURLY, null when no salary), notes, applied_date, status, created_at, updated_at
- `status_event`: id, application_id (FK, cascade delete), from_status, to_status, changed_at
  — one row per status change (history).
- Statuses: WISHLIST, APPLIED, PHONE_SCREEN, INTERVIEW, OFFER, REJECTED, WITHDRAWN
- Schema changes go in new Flyway files: `backend/src/main/resources/db/migration/V<n>__name.sql`.
  Never edit a migration that has already been applied.

## REST API (base `/api/applications`)
- `GET /` list, `GET /{id}` get, `POST /` create, `PUT /{id}` update, `DELETE /{id}` delete
- `PATCH /{id}/status` body `{ "status": "INTERVIEW" }` — changes status and logs an event
- `GET /{id}/events` status history
- `GET /api/stats` — counts per status

## Frontend
- UI follows the "Pursuit" design (dark sidebar, condensed titles, mono labels); colors/fonts
  are CSS variables at the top of `frontend/src/styles.css`. All styles live in that one file.
- Applications page: Board view (one column per status, drag → PATCH status) or Table view;
  search box filters by company/role. Overview page: pipeline bars per status.
- "Add a role" modal for add/edit/delete; metrics strip computed from `/api/stats`.
- Not built (no backend for them yet): Interviews, Contacts, Documents, Source, Next step.

## Build stages
1. (a) docker-compose + Flyway migration
2. (b) backend API with tests
3. (c) Angular frontend
4. (d) README with run instructions

After each stage: build/test, fix, commit (never push).

## Conventions
- Keep it simple and readable; brief comments. MVP only — no extra features.
- Ask before big decisions or unusual installs.
