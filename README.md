# Job Tracker

A full-stack app for tracking job applications on a kanban board.
Drag an application between columns to update its status; every status change is saved as history.

**Stack:** Spring Boot 3.5 (Java 21) · Angular 22 · PostgreSQL 16 · Flyway · Docker

## Features

- Kanban board with one column per status: Wishlist, Applied, Phone screen, Interview, Offer, Rejected, Withdrawn
- Drag-and-drop between columns (Angular CDK) updates the status through the REST API
- Table view of the same data, plus search by company or role
- Add, edit and delete applications: company, title, URL, location, salary range, notes, applied date
- Status history: each change is logged as an event row
- Stats strip (tracked, active, interviews, offers, response rate) and an Overview page with pipeline bars
- Input validation on both frontend and backend
- API integration tests against a real PostgreSQL (Testcontainers)

## Prerequisites

| Tool | Version | Check with |
|------|---------|------------|
| Java (JDK) | 21 | `java -version` |
| Node.js | 22.22.3+ or 24 LTS | `node -v` |
| Docker Desktop | any recent | `docker --version` |

For the Docker quick start, only Docker is needed. Java and Node are for local development and tests.
Maven doesn't need to be installed: the project includes the Maven Wrapper (`mvnw` / `mvnw.cmd`), which downloads it automatically.

## Quick start (everything in Docker)

Only Docker is needed. From the project folder:

```bash
docker compose up -d --build
```

Open **http://localhost:3000**. This builds and starts three containers: the database, the backend, and the frontend
(served by nginx, which also forwards `/api` to the backend). The first build takes a few minutes.

- Stop: `docker compose down` (your data is kept)
- After changing code, run the same `up -d --build` command again to rebuild
- Backend logs: `docker compose logs -f backend`

## Run it locally (for development)

This mode reloads the frontend automatically when you edit code. Open three terminals in the project folder.

**1. Start only the database** (PostgreSQL in Docker):

```bash
docker compose up -d db
```

**2. Start the backend** (API on http://localhost:8080). On first start, Flyway creates the tables.

```bash
cd backend
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```

**3. Start the frontend** (http://localhost:4200):

```bash
cd frontend
npm install                   # first time only
npm start
```

Open **http://localhost:4200**. The frontend forwards `/api` requests to the backend (see `frontend/proxy.conf.json`).

To stop: press `Ctrl+C` in the backend and frontend terminals, then run `docker compose down`.
Your data is kept in a Docker volume. `docker compose down -v` deletes it.

## Run the tests

Docker must be running: the tests start their own temporary PostgreSQL container, so they never touch your real data.

```bash
cd backend
./mvnw test                   # Windows: .\mvnw.cmd test
```

## Configuration

The backend reads its database connection from environment variables. The defaults match `docker-compose.yml`:

| Variable | Default |
|----------|---------|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `jobtracker` |
| `DB_USER` | `jobtracker` |
| `DB_PASSWORD` | `jobtracker` |

To use a hosted database such as **AWS Aurora PostgreSQL**, set these variables before starting the backend. No code changes are needed.

## REST API

Base URL: `http://localhost:8080/api`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/applications` | List all applications |
| `GET` | `/applications/{id}` | Get one application |
| `POST` | `/applications` | Create (status defaults to `WISHLIST`) |
| `PUT` | `/applications/{id}` | Update all fields |
| `PATCH` | `/applications/{id}/status` | Change status only, e.g. `{"status": "INTERVIEW"}` |
| `DELETE` | `/applications/{id}` | Delete (its history is deleted too) |
| `GET` | `/applications/{id}/events` | Status history, oldest first |
| `GET` | `/stats` | Count per status |

Example request (bash or Git Bash; in Windows PowerShell, `curl` is a different command):

```bash
curl -X POST http://localhost:8080/api/applications \
  -H "Content-Type: application/json" \
  -d '{"company":"Acme","title":"Java Developer","salaryMin":90000,"salaryMax":110000,"status":"APPLIED"}'
```

Invalid input (missing company/title, min salary above max, unknown status) returns `400 Bad Request`.
A missing id returns `404 Not Found`.

## Project structure

```
job-tracker/
├── docker-compose.yml          # database + backend + frontend containers
├── backend/                    # Spring Boot API (+ Dockerfile)
│   └── src/main/
│       ├── java/com/jobtracker/
│       │   ├── model/          # JPA entities + status enum
│       │   ├── repository/     # Spring Data repositories
│       │   ├── service/        # business logic (status history, stats)
│       │   └── web/            # REST controller + request bodies
│       └── resources/
│           ├── application.properties
│           └── db/migration/   # Flyway SQL migrations
└── frontend/                   # Angular app (+ Dockerfile, nginx.conf)
    └── src/app/
        ├── sidebar/            # left navigation + pipeline counts
        ├── metrics/            # stats strip under the page title
        ├── board/              # kanban board (drag-and-drop)
        ├── applications-table/ # table view
        ├── overview/           # pipeline bars page
        ├── application-form/   # "Add a role" add/edit/delete pop-up
        ├── icon/               # small set of inline SVG icons
        └── application.service.ts  # HTTP calls to the API
```

## Database

Two tables, created by `backend/src/main/resources/db/migration/V1__create_tables.sql`:

- `job_application`: one row per application
- `status_event`: one row per status change (`from_status` → `to_status`, with a timestamp)

To change the schema, add a new migration file (e.g. `V2__add_column.sql`). Never edit one that has already run.
