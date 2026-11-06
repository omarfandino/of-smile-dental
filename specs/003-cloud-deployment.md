# Spec 003 — Cloud deployment and Postgres persistence

Status: draft, validated · Scope: backend, build and deploy config, one UI banner · Depends on: specs 001, 002

## 1. Problem
The course requires a live demo. The free hosting tier (Render) has an ephemeral filesystem, so the SQLite file would be wiped on every restart or spin-down. Patient data must live in a managed database that persists independently of the app container. The app also has no login, so a public demo must clearly tell visitors to use fictional data only.

## 2. Solution

### Architecture
- **Database:** PostgreSQL. In production a free Neon project; locally a Postgres container with a named volume. The backend reads `DATABASE_URL`; the SQLite code is removed.
- **App:** one container serving both the API (`/api/...`) and the built UI (`/`), listening on `$PORT` (default 8000). Deployed as a single Render web service from a blueprint (`render.yaml`).
- **Local:** `docker compose up --build` starts `db` (Postgres, volume `ofsmile_pgdata`) and `app` at http://localhost:8080.
- **Secrets:** `DATABASE_URL` is never committed, and surrounding quotes or whitespace pasted with it are ignored; in Render it is set in the dashboard (`sync: false` in the blueprint).

### Data model
Same fields as spec 001. In Postgres: `id` identity, `name`, `whatsapp` (unique), `email`, `notes`, `created_at` as `timestamptz`, returned to the client as an ISO-8601 UTC string. Duplicate detection uses a single atomic `INSERT ... ON CONFLICT (whatsapp) DO NOTHING`.

### Demo notice
When `DEMO_MODE=1`, `GET /api/health` also returns `"demo": true` and the UI shows a warning banner above the top bar: "Demo — use fictional data only. Anyone with this link can see what is registered." With `DEMO_MODE` unset or `0`, no banner.

### Scope decisions
- No ORM; plain `psycopg` 3 with parameterized queries.
- No migrations tool yet: `CREATE TABLE IF NOT EXISTS` at startup is enough for one table.
- The free Render service sleeps after inactivity and Neon scales to zero, so the first request after idle can take several seconds. Accepted for a demo.
- Authentication is still out of scope (see spec 001); the banner is the mitigation for the demo.

## 3. Acceptance criteria
1. **Postgres persistence locally.** After registering a patient, `docker compose restart app` and `docker compose down` + `up` (without `-v`) keep the patient. *Test: manual with Docker.*
2. **Spec 001 still holds on Postgres.** The existing backend tests (registration and normalization, persistence across app instances, per-field validation, duplicate in another format) pass against a Postgres database. *Test: pytest.*
3. **Single image, one URL.** A request to `/` returns the UI, `/api/health` returns `{"ok": true, ...}`, and `/api/patients` works, all from the same container and port. *Test: curl against the built image.*
4. **Deployable and secret-free.** `render.yaml` defines the web service with a health check on `/api/health`, and `DATABASE_URL` is not present anywhere in the repo. *Test: `grep -rn "postgresql://" . --exclude-dir=node_modules --exclude-dir=.git` shows only the local development URLs.*
5. **Live demo.** The Render URL loads the UI with the demo banner; a patient registered there is still listed after the service restarts. *Test: manual on the live URL.*

## 4. Out of this spec
Authentication, schema migrations, backups, custom domain, CI/CD beyond Render's auto-deploy from `main`.
