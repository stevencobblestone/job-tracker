# Job Application Tracker — Project Guide

A small MVP for tracking job applications on a kanban board. No login/auth.

## Stack
- `backend/` — Spring Boot 3.x, Java 21, Maven (via `mvnw` wrapper), Spring Data JPA,
  Validation, Flyway, PostgreSQL driver.
- `frontend/` — Angular (latest stable), standalone components, Angular CDK (drag-and-drop).
- Database — PostgreSQL. Local dev runs it in Docker (`docker-compose.yml` at repo root).

## Configuration
The backend reads DB settings from environment variables, with local defaults:
`DB_HOST` (localhost), `DB_PORT` (5432), `DB_NAME` (jobtracker), `DB_USER` (jobtracker),
`DB_PASSWORD` (jobtracker). Pointing at AWS Aurora PostgreSQL later = just change these.

## Data model
- `job_application`: id, company, title, url, location, salary_min, salary_max, notes,
  applied_date, status, created_at, updated_at
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
- Kanban board, one column per status; drag a card to another column → PATCH status.
- Add/edit/delete form; small stats summary.

## Build stages
1. (a) docker-compose + Flyway migration
2. (b) backend API with tests
3. (c) Angular frontend
4. (d) README with run instructions

After each stage: build/test, fix, commit (never push).

## Conventions
- Keep it simple and readable; brief comments. MVP only — no extra features.
- Ask before big decisions or unusual installs.
