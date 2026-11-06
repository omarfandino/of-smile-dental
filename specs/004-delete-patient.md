# Spec 004 — Delete a patient

Status: draft, pending validation · Scope: API + Patients page · Depends on: specs 001, 003

## 1. Problem
Today a patient can be registered but never removed. That causes three real problems for the assistant:
- **Mistakes.** A wrong name, a test entry or a double registration stays in the list forever.
- **A wrong number blocks the right one.** The WhatsApp number is unique, so a patient saved with a typo'd number can't be registered again correctly until the bad record is gone (there is no edit yet either).
- **Personal data.** A patient may ask for their data to be removed, and the clinic has no way to do it.

## 2. Solution

### API
- `DELETE /api/patients/{id}` — removes the patient permanently. `204` with no body on success; `404` with `{"errors": {"general": "Patient not found"}}` if the id doesn't exist (including a second delete of the same patient). The path carries only the numeric id, never name, phone or email.

### UI (Patients page, registered-patients list)
- Each row gets a trash-icon button with `aria-label="Delete <name>"`, touch target ≥44 px.
- Clicking it does **not** delete. The row switches to an inline confirmation: "Delete <name>? This can't be undone." with two buttons, "Cancel" and "Delete". Only one row can be in confirmation at a time; Esc or "Cancel" restores the row.
- Confirming deletes, removes the row without reloading, updates the counter, and shows "Patient deleted: <name>" in the same status style as the save message.
- If the server answers `404` (already deleted elsewhere) the row is removed anyway; any other failure shows "Could not delete. Please try again." and keeps the row.

### Decisions
- **Hard delete.** The row is removed from the database, not hidden. It matches the privacy goal (the data is really gone) and frees the WhatsApp number for re-registration.
- **Inline confirmation instead of a modal:** fewer clicks, works well on a phone, nothing to trap focus in.
- **Destructive styling:** "Delete" uses `--danger` (see the brand skill); it is never the primary green button.
- **Public demo caveat:** with no login, anyone who opens the demo can delete patients. Accepted because the demo only holds fictional data (spec 003).
- **Future appointments:** when appointments exist, deleting a patient who has upcoming appointments must be blocked or must ask what to do with them. Out of scope here; revisit in the appointments spec.

## 3. Acceptance criteria
1. **Delete removes and persists.** `DELETE /api/patients/{id}` returns `204`; the patient no longer appears in `GET /api/patients`, and is still gone after the app restarts. *Test: pytest.*
2. **Unknown id.** Deleting an id that doesn't exist, or the same id twice, returns `404` with the error above and changes nothing. *Test: pytest.*
3. **Frees the WhatsApp.** After deleting a patient, registering a new patient with the same WhatsApp (even in another format) returns `201`. *Test: pytest.*
4. **Confirmation required.** Clicking the trash button never deletes by itself: it shows the inline confirmation with the patient's name; "Cancel" or Esc keeps the patient; "Delete" removes the row, updates the counter and shows "Patient deleted: <name>". *Test: manual in browser.*
5. **Mobile and brand.** At 375 px the row and its confirmation fit with no horizontal scroll, buttons are ≥44 px tall, colors come only from tokens, and the only data in the request URL is the numeric id. *Test: browser inspection at 375 px and network panel; token grep from spec 002.*

## 4. Out of this spec
Editing a patient, undo or trash bin, bulk delete, soft delete, audit log, permissions (no login yet).
