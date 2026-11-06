# Spec 002 — App shell (visual layout)

Status: draft, validated · Scope: frontend only · Depends on: spec 001

## 1. Problem
Patient registration alone is one bare screen. Dr. Laura needs to see what the full product will feel like (sidebar, overview, other sections) before the remaining features are built, while the one working feature — patients — stays usable inside that layout. Reference design: https://of-smile.v0.build/ (structure only; the look follows the `of-smile-brand` skill: dark theme, green accent, English copy).

## 2. Solution

### Layout
- **Desktop (≥900 px):** fixed left sidebar (brand, clinic card, menu, settings) + top bar (breadcrumb, search, notifications, user chip) + scrollable content, max width 1100 px.
- **Mobile (<900 px):** no sidebar; a bottom tab bar with the four main menu items, and a top bar with the brand mark and user chip.

### Menu
| Item | Behavior |
|---|---|
| Overview | Works. Route `#/` — static visual mock (home) |
| Schedule (badge 4) | Visual only. Does nothing |
| Patients | **Works.** Route `#/patients` — the registration form and list from spec 001 |
| Treatments | Visual only. Does nothing |
| Settings | Visual only. Does nothing |

Other inert controls (search, bell, "New appointment", "Send", "Mark contacted", "…", "Edit template", links) also do nothing: no navigation, no request, no state change.

### Working-feature cue
So a visitor knows Patients is the only working section:
- **"Live" tag:** a small pill next to "Patients" in the menu, always visible (desktop and mobile).
- **Welcome tooltip (coachmark):** on first visit to Overview, a bubble points at Patients: "Patients is the working feature. Start here." with a "Got it" button. It closes with "Got it", with Esc, or by opening Patients, and does not reappear in that browser (remembered in `localStorage`; if storage is unavailable it simply shows again).

### Overview (static mock)
Greeting with today's date; three stat cards (today's appointments, pending reminders, patients to contact); "Today's schedule" list with status badges; "Pending reminders" list with a "Send" button each and an "Edit template" link; "Patients to contact" list with treatment progress bar ("2 of 3 sessions") and a "Mark contacted" button. All data is fictional and hard-coded in `frontend/src/data/mock.js`. The screen makes no API calls.

### Patients page
Header "Patients"; on desktop the form sits left and the list right, on mobile they stack. Behavior is exactly spec 001.

### Scope decisions
- No router library: the two routes use `location.hash`. Hashes never carry personal data.
- No icon library: small inline SVG icons.
- The v0 footer "Your information is protected…" is omitted: there is no login yet, so the claim would be false.
- All of this is visual; real Overview data comes with the appointments, reminders and follow-up specs.

## 3. Acceptance criteria
1. **Navigation.** Clicking "Patients" shows the registration page and sets the URL hash to `#/patients`; clicking "Overview" returns to `#/`. Clicking Schedule, Treatments or Settings changes nothing (same page, same URL, no network request). *Test: manual in browser.*
2. **Patients still works in the shell.** Registering a patient from the Patients page behaves as in spec 001 (saved message, list updates, validation errors, duplicate rejection). *Test: manual in browser + existing pytest.*
3. **Overview is a mock.** Opening Overview shows the three stat cards and the three lists with fictional data, and triggers no `/api/` request. *Test: browser network panel.*
4. **Responsive.** At ≥900 px the sidebar is visible; at 375 px the sidebar is hidden, the bottom tab bar shows four items, and there is no horizontal page scroll. *Test: browser inspection at both widths.*
5. **Brand.** Colors come only from tokens: no hex or `rgb()` literals in `frontend/src` outside `tokens.css`; primary buttons use `--brand` with `--on-brand` text. *Test: `grep -rnE '#[0-9a-fA-F]{3,6}|rgba?\(' frontend/src --include=*.css --include=*.jsx` returns nothing beyond `tokens.css`.*

6. **Working-feature cue.** The "Live" tag is always visible next to Patients. On a first visit the welcome tooltip appears pointing at Patients; after "Got it" (or Esc, or opening Patients) and a reload it no longer appears. *Test: manual in browser.*

## 4. Out of this spec
Real data on Overview, Schedule, Treatments, Settings, search, notifications, login.
