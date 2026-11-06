# Spec 001 — Patient registration

Status: draft, validated · Scope: UI + minimal API with persistence

## 1. Problem
Dr. Laura's assistant schedules in Google Calendar today, which doesn't know who the patient is or how to reach them. Without a patient registry with WhatsApp numbers, reminders can't be sent and treatments can't be followed up (the two causes of loss: ~30% no-shows and abandoned treatments). Registration is the first step of the whole flow, and the business rule is: **you can't schedule someone who isn't registered**.

User: the assistant (non-technical), on phone or computer, usually attending to a person at the same time. She must be able to register a patient in under 20 seconds.

## 2. Solution

### Patient data
| Field | Required | Rule |
|---|---|---|
| `name` | Yes | 2–100 characters after trimming extra spaces |
| `whatsapp` | Yes | Spaces, hyphens, parentheses and `+` are accepted. Normalized to digits only with country code. A 10-digit number gets the default country code prepended (`DEFAULT_COUNTRY_CODE`, default `57`). Must end up between 11 and 15 digits |
| `email` | No | Basic valid format if provided |
| `notes` | No | Max 300 characters. Contact/preferences only, **not** clinical information |

Also: `id`, `created_at` (UTC). The normalized `whatsapp` is **unique**.

### API
- `POST /api/patients` — create. JSON body (data never goes in the URL). Responses: `201` with the patient; `422` with `{"errors": {"field": "message"}}`; `409` if the WhatsApp already exists, with `{"errors": {"whatsapp": "A patient with this WhatsApp already exists: <name>"}}`.
- `GET /api/patients` — list, newest first.
- `GET /api/health` — liveness check.

### UI (single screen)
- "New patient" form on top and "Registered patients" list below, styled per the `of-smile-brand` skill.
- Only `Full name` and `WhatsApp` visible at first; `Email` and `Contact notes` inside a collapsed "More details (optional)" block.
- On success: message "Patient saved: <name>", the form clears, focus returns to `Full name`, and the patient appears at the top of the list without reloading.
- Enter in any single-line field submits the form.
- Errors appear under the matching field, in plain English, with the action needed to fix it. While saving, the button is disabled to avoid duplicates from a double tap.
- Each patient in the list shows name and a readable WhatsApp number, plus an empty state when there are none ("No patients yet. Register the first one above.").

### Persistence
SQLite in a named Docker volume; data survives `docker compose down` and `docker compose restart`.

### Scope decisions
- No login or roles: a single person uses it on their own machine. Authentication is added before exposing it to the internet (later phase).
- No editing or deleting patients in this deliverable.
- No appointment history yet; it links in with the appointments spec.

## 3. Acceptance criteria
Each one is verifiable with the test indicated.

1. **Registration and persistence.** Given a name ("Ana Pérez") and a valid WhatsApp ("300 123 4567"), saving makes the API respond `201` with `whatsapp = "573001234567"`; the patient shows first in the list; and after `docker compose restart` it still shows. *Test: pytest + manual check with Docker.*
2. **Per-field validation in plain English.** With an empty name, a WhatsApp with fewer than 10 or more than 15 digits, or a malformed email, nothing is saved, the API responds `422` with `errors` per field, and the UI shows each message under its field. *Test: pytest + UI.*
3. **No duplicates.** Registering an existing WhatsApp (even written in another format, e.g. "+57 300-123-4567") responds `409`, creates no new row, and the UI shows the existing patient's name. *Test: pytest.*
4. **Speed and keyboard flow.** With only two required fields, filling name + WhatsApp and pressing Enter registers the patient; after saving, focus is on `Full name` and the form is empty. A fast double click on "Save patient" doesn't create duplicates. *Test: manual check in the browser.*
5. **Mobile and brand.** At 375 px wide there is no horizontal scroll, fields are ≥44 px tall, and the primary button uses `--brand` with `--on-brand` text; no personal data appears in the URL. *Test: browser inspection (DevTools) and network request review.*

## 4. Out of this spec
Appointments, treatments, reminders, follow-up, editing/deleting patients, search, authentication.
