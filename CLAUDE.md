# OF Smile — agent instructions

## What this project is
Web MVP for Dr. Laura's dental clinic (1 doctor + 1 assistant).
Business goal: cut no-shows (~30%) and stop patients from abandoning multi-session treatments.
Scope of this deliverable: **the patient registration feature** (`specs/001-patient-registration.md`) inside a **visual-only app shell** (`specs/002-app-shell.md`): only Overview (static mock) and Patients work; every other menu item is decorative.
Appointments, treatments, `wa.me` reminders and follow-up are out of scope (later phase).

## User
A non-technical person (the assistant) who must register a patient in under 20 seconds, from phone or computer.
There is a single operating user: **no login, roles or admin user** in this scope.
Prioritize few clicks, clear text, and error messages that say how to fix the problem.

## Stack
- Backend: Python 3.12+ / FastAPI / SQLite (standard `sqlite3` module, no ORM).
- Frontend: React 18 + Vite, JavaScript, plain CSS with variables (no Tailwind, no UI libraries).
- Deployment: Docker Compose. The SQLite database lives in a named volume (`ofsmile_data`) so data persists.

## Structure
- `specs/` — specifications. Source of truth for behavior.
- `backend/app/` — API; `backend/tests/` — pytest tests.
- `frontend/src/` — UI.
- `.claude/skills/of-smile-brand/` — visual identity skill. **Always use it when touching UI.**

## Workflow (Spec Driven Development)
1. Change or create the spec first.
2. Implement against the spec's acceptance criteria.
3. If the result fails a criterion, **fix the spec before the prompt or the code**, then re-implement.
4. Don't add functionality the spec doesn't ask for.

## Conventions
- Everything is in **English**: UI text, API messages and fields, code, comments, docs, commit messages. Domain terms are English too (`patient`, `name`, `whatsapp`, `notes`).
- Phones are stored normalized, digits only with country code (e.g. `573001234567`), ready for `https://wa.me/<number>`.
- Validate in the backend (authority) and in the frontend (convenience). The backend returns per-field errors: `{"errors": {"field": "message"}}`.
- Mobile-first design; test at 375 px wide with no horizontal scroll.
- Commits are authored by the user alone: no `Co-Authored-By` lines.

## Privacy (patients' personal data)
- Never put name, phone or email in URLs or query strings; only in the request body.
- Don't log personal data or print it to the console.
- Don't commit the database (`*.db`) or `.env` files.

## Commands
- Run everything: `docker compose up --build` → UI at http://localhost:8080
- Backend tests: `cd backend && pip install -r requirements-dev.txt && pytest`
- Frontend dev: `cd frontend && npm install && npm run dev` (proxies to the API on :8000)

## Out of scope (don't implement without a spec)
Login/roles, billing, clinical records, Google Calendar or WhatsApp Business API integration.
