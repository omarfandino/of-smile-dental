# Spec 001 — Registro de pacientes

Estado: borrador validado · Alcance: UI + API mínima con persistencia

## 1. Problema
La asistente de la Dra. Laura agenda hoy en Google Calendar, que no sabe quién es el paciente ni cómo contactarlo. Sin un registro de pacientes con WhatsApp no se pueden enviar recordatorios ni dar seguimiento a tratamientos (las dos causas de pérdida: ~30% de inasistencias y tratamientos abandonados). El registro es el primer paso de todo el flujo y la regla de negocio es: **no se agenda a alguien no registrado**.

Usuario: la asistente (no técnica), en celular o computador, atendiendo a una persona al mismo tiempo. Debe poder registrar un paciente en menos de 20 segundos.

## 2. Solución

### Datos del paciente
| Campo | Obligatorio | Regla |
|---|---|---|
| `nombre` | Sí | 2–100 caracteres tras quitar espacios sobrantes |
| `whatsapp` | Sí | Se aceptan espacios, guiones, paréntesis y `+`. Se normaliza a solo dígitos con código de país. Si trae 10 dígitos se antepone el código de país por defecto (`DEFAULT_COUNTRY_CODE`, por defecto `57`). Debe quedar entre 11 y 15 dígitos |
| `email` | No | Si se llena, formato válido básico |
| `notas` | No | Máx. 300 caracteres. Solo contacto/preferencias, **no** información clínica |

Además: `id`, `creado_en` (UTC). El `whatsapp` normalizado es **único**.

### API
- `POST /api/pacientes` — crea. Cuerpo JSON (los datos nunca van en la URL). Respuestas: `201` con el paciente; `422` con `{"errores": {"campo": "mensaje en español"}}`; `409` si el WhatsApp ya existe, con `{"errores": {"whatsapp": "Ya existe un paciente con este WhatsApp: <nombre>"}}`.
- `GET /api/pacientes` — lista, más recientes primero.
- `GET /api/salud` — chequeo de vida.

### UI (una sola pantalla)
- Formulario "Nuevo paciente" arriba y lista "Pacientes registrados" abajo, con el estilo de la skill `of-smile-brand`.
- Solo `Nombre` y `WhatsApp` visibles al inicio; `Email` y `Notas` en un bloque "Más datos (opcional)" plegado.
- Al guardar con éxito: mensaje "Paciente guardado: <nombre>", el formulario se limpia, el foco vuelve a `Nombre`, y el paciente aparece al inicio de la lista sin recargar.
- Enter en cualquier campo de una línea envía el formulario.
- Los errores se muestran bajo el campo correspondiente, en español, con la acción para corregir. Mientras se guarda, el botón se deshabilita para evitar duplicados por doble toque.
- Cada paciente en la lista muestra nombre, WhatsApp con formato legible y un estado vacío si no hay ninguno ("Aún no hay pacientes. Registra el primero arriba.").

### Persistencia
SQLite en un volumen Docker nombrado; los datos sobreviven a `docker compose down` y `docker compose restart`.

### Decisiones de alcance
- Sin login ni roles: la usa una sola persona en su equipo. Se añade autenticación antes de exponerla a internet (fase posterior).
- Sin editar ni borrar pacientes en esta entrega.
- Sin historial de citas todavía; se enlaza en la spec de citas.

## 3. Criterios de aceptación
Cada uno es verificable con la prueba indicada.

1. **Registro y persistencia.** Dado un nombre ("Ana Pérez") y un WhatsApp válido ("300 123 4567"), al guardar la API responde `201` con `whatsapp = "573001234567"`; el paciente aparece primero en la lista; y tras `docker compose restart` sigue apareciendo. *Prueba: pytest + verificación manual con Docker.*
2. **Validación en español por campo.** Con nombre vacío, WhatsApp con menos de 10 o más de 15 dígitos, o email mal formado, no se guarda nada, la API responde `422` con `errores` por campo y la UI muestra cada mensaje bajo su campo. *Prueba: pytest + UI.*
3. **Sin duplicados.** Registrar un WhatsApp ya existente (aunque se escriba con otro formato, p. ej. "+57 300-123-4567") responde `409`, no crea fila nueva y la UI muestra el nombre del paciente existente. *Prueba: pytest.*
4. **Rapidez y flujo de teclado.** Con solo dos campos obligatorios, completar nombre + WhatsApp y pulsar Enter registra al paciente; tras guardar, el foco está en `Nombre` y el formulario vacío. Doble clic rápido en "Guardar" no crea duplicados. *Prueba: verificación manual en navegador.*
5. **Móvil y marca.** A 375 px de ancho no hay scroll horizontal, los campos miden ≥44 px de alto, y el botón primario usa `--brand` con texto `--on-brand`; ningún dato personal aparece en la URL. *Prueba: inspección en navegador (DevTools) y revisión de peticiones de red.*

## 4. Fuera de esta spec
Citas, tratamientos, recordatorios, seguimiento, edición/borrado de pacientes, búsqueda, autenticación.
