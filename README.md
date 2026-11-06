# OF Smile

MVP for Dr. Laura's dental clinic, built with Spec Driven Development.
Features: **patient registration** ([spec 001](specs/001-patient-registration.md)) inside a visual-only **app shell** ([spec 002](specs/002-app-shell.md)), deployed as a **cloud demo** ([spec 003](specs/003-cloud-deployment.md)).

## Layout
- [CLAUDE.md](CLAUDE.md): persistent context for the agent.
- [.claude/skills/of-smile-brand](.claude/skills/of-smile-brand/SKILL.md): visual identity skill.
- [specs/](specs/): specifications with acceptance criteria.
- `backend/` (FastAPI + PostgreSQL), `frontend/` (React + Vite), root `Dockerfile` (UI + API in one image).

## Run locally
```bash
docker compose up --build
```
Open http://localhost:8080. Patient data lives in the `ofsmile_pgdata` volume and survives restarts.
To wipe it: `docker compose down -v`.

## Backend tests
```bash
docker compose up -d db
cd backend && pip install -r requirements-dev.txt && pytest
```

## Deploy (Neon + Render, free tiers)
1. **Neon:** create a project and copy its connection string (`postgresql://…?sslmode=require`).
2. **Render:** New → Blueprint → pick this repo. When prompted, paste the connection string as `DATABASE_URL`. `render.yaml` does the rest.
3. Open the Render URL. The demo banner reminds visitors to use fictional data only: there is no login yet.

The free services sleep when idle, so the first request after a pause can take several seconds.
