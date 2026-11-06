# OF Smile

MVP para el consultorio dental de la Dra. Laura, construido con Spec Driven Development.
Feature actual: **registro de pacientes** ([spec](specs/001-registro-pacientes.md)).

## Cómo se organiza
- [CLAUDE.md](CLAUDE.md): contexto persistente para el agente.
- [.claude/skills/of-smile-brand](.claude/skills/of-smile-brand/SKILL.md): skill de identidad visual.
- [specs/](specs/): especificaciones con criterios de aceptación.
- `backend/` (FastAPI + SQLite) y `frontend/` (React + Vite).

## Ejecutar
```bash
docker compose up --build
```
Abre http://localhost:8080. Los datos se guardan en el volumen `ofsmile_data`.
Para borrarlos: `docker compose down -v`.

## Pruebas del backend
```bash
cd backend && pip install -r requirements-dev.txt && pytest
```
