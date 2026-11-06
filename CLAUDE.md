# OF Smile — instrucciones para el agente

## Qué es este proyecto
MVP web en español para el consultorio dental de la Dra. Laura (1 doctora + 1 asistente).
Meta de negocio: reducir inasistencias (~30%) y evitar que los pacientes abandonen tratamientos de varias sesiones.
Alcance de esta entrega: **solo el feature de registro de pacientes** (ver `specs/001-registro-pacientes.md`).
Citas, tratamientos, recordatorios `wa.me` y seguimiento están fuera de esta entrega (fase posterior).

## Usuario
Una persona no técnica (la asistente) que debe registrar un paciente en menos de 20 segundos, desde celular o computador.
Es un solo usuario operativo: **no hay login, roles ni usuario admin** en este alcance.
Prioriza pocos clics, textos claros y mensajes de error que digan cómo corregir.

## Stack
- Backend: Python 3.12+ / FastAPI / SQLite (módulo `sqlite3` estándar, sin ORM).
- Frontend: React 18 + Vite, JavaScript, CSS plano con variables (sin Tailwind ni librerías de UI).
- Despliegue: Docker Compose. La base SQLite vive en un volumen nombrado (`ofsmile_data`) para que los datos persistan.

## Estructura
- `specs/` — especificaciones. Fuente de verdad del comportamiento.
- `backend/app/` — API; `backend/tests/` — pruebas pytest.
- `frontend/src/` — UI.
- `.claude/skills/of-smile-brand/` — skill de identidad visual. **Úsala siempre que toques UI.**

## Flujo de trabajo (Spec Driven Development)
1. Cambia o crea la spec primero.
2. Implementa contra los criterios de aceptación de la spec.
3. Si el resultado no cumple un criterio, **corrige la spec antes que el prompt o el código**, y vuelve a implementar.
4. No agregues funcionalidad que la spec no pida.

## Convenciones
- Todo texto visible al usuario, mensajes de error de la API, comentarios y nombres de dominio (`paciente`, `nombre`, `whatsapp`) en **español**. Identificadores técnicos genéricos (`create_app`, `get_conn`) pueden ir en inglés.
- Teléfonos: se guardan normalizados, solo dígitos con código de país (ej. `573001234567`), listos para `https://wa.me/<numero>`.
- Validación en backend (autoridad) y en frontend (comodidad). El backend responde errores por campo: `{"errores": {"campo": "mensaje"}}`.
- Diseño mobile-first; probar a 375 px de ancho sin scroll horizontal.

## Privacidad (datos personales de pacientes)
- Nunca poner nombre, teléfono ni email en URLs ni query strings; solo en el cuerpo de la petición.
- No registrar (log) datos personales ni imprimirlos en consola.
- No commitear la base de datos (`*.db`) ni archivos `.env`.

## Comandos
- Levantar todo: `docker compose up --build` → UI en http://localhost:8080
- Pruebas backend: `cd backend && pip install -r requirements-dev.txt && pytest`
- Desarrollo frontend: `cd frontend && npm install && npm run dev` (proxy a la API en :8000)

## Fuera de alcance (no implementar sin spec)
Login/roles, facturación, expediente clínico, integración con Google Calendar o WhatsApp Business API.
