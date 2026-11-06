# OF Smile

MVP for Dr. Laura's dental clinic, built with Spec Driven Development.
Current feature: **patient registration** ([spec](specs/001-patient-registration.md)).

## Layout
- [CLAUDE.md](CLAUDE.md): persistent context for the agent.
- [.claude/skills/of-smile-brand](.claude/skills/of-smile-brand/SKILL.md): visual identity skill.
- [specs/](specs/): specifications with acceptance criteria.
- `backend/` (FastAPI + SQLite) and `frontend/` (React + Vite).

## Run
```bash
docker compose up --build
```
Open http://localhost:8080. Data is stored in the `ofsmile_data` volume.
To wipe it: `docker compose down -v`.

## Backend tests
```bash
cd backend && pip install -r requirements-dev.txt && pytest
```
