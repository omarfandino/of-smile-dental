---
name: of-smile-brand
description: Visual identity and design system for the OF Smile app (Dr. Laura's dental clinic), inspired by Código Facilito - dark theme, green #00B16C, rounded cards, friendly tone. Use whenever you create or modify any screen, component, form, button, badge, CSS or color in this project, even if the user only says "build the screen for...", "style it" or "make it look good". Do not use colors or styles invented outside this skill.
---

# OF Smile — brand design

The app is used by a non-technical assistant, often from a phone and in the middle of other work. The style is dark, clean and high-contrast (reference: tech-education platforms like Código Facilito), but the content is a dental clinic: favor readability and obvious actions over decoration.

## Before writing UI
1. Import the tokens: `assets/tokens.css` from this skill (copy at `frontend/src/tokens.css`). Every color, radius and spacing comes from there as a CSS variable. Don't write loose hex values in components.
2. If you need a new color, add it to the tokens first; don't invent it in the component.

## Palette (summary; exact values in `assets/tokens.css`)
| Use | Token | Value |
|---|---|---|
| Page background | `--bg` | `#0b0f19` |
| Cards / surfaces | `--surface` | `#1e293b` |
| Borders | `--border` | `#334155` |
| Primary text | `--text` | `#ffffff` |
| Secondary text | `--text-muted` | `#94a3b8` |
| Brand accent | `--brand` | `#00b16c` |
| Info / Warning / Error | `--info` / `--warning` / `--danger` | blue / amber / soft red |

## Rules
- **Primary button**: `--brand` background, `--on-brand` (dark) text. White text on this green fails contrast; don't use it. Hover `--brand-hover`. One primary button per screen/form.
- **Cards**: `--surface`, 1px `--border`, `border-radius: var(--radius)`, padding `--space-4` (mobile) to `--space-6` (desktop).
- **Inputs**: `--bg` background, `--border` border, `--radius-sm`, minimum height 44px (they're used with a finger). Visible focus: `--brand` border and ring. Always a visible label above (not just a placeholder).
- **Errors**: `--danger` text under the field, in plain English, saying how to fix it ("Enter the number with 10 digits"), never technical codes. Color is not the only signal: include the text.
- **Success**: brief confirmation in `--success` that doesn't block the next step.
- **Status badges** (for future phases: scheduled, confirmed, attended, no-show, cancelled): small pill, background in the color at ~15% opacity, text in the full color. Green = confirmed/attended, amber = pending/to contact, blue = scheduled, red = no-show/cancelled.
- **Treatment progress** ("session 2 of 3"): thin bar filled with `--brand` over `--border`, plus the text.
- **Typography**: `--font`; headings 600–700, body 16px minimum (avoids iOS zoom), secondary text 14px in `--text-muted`.
- **Motion**: `--transition` only on color, border and shadow. No decorative animation.
- **App layout**: at ≥900px a fixed left sidebar (`--surface`, 1px `--border` on its right edge) plus a top bar and content capped at 1100px; below 900px the sidebar becomes a bottom tab bar (icon above label, four main items). Active menu item: `--brand-soft` background with `--brand` text. Forms and single-purpose pages may stay narrower (≤720px).
- **Responsive**: mobile-first, one column on mobile. No horizontal scroll at 375px.
- **Secondary buttons**: "soft" (`--brand-soft` background, `--brand` text) for repeated row actions like "Send"; "outline" (`--border` border, `--text` text) for neutral ones like "Mark contacted". They don't count against the one-primary-button rule.
- **Avatars**: circle with initials, background a tint of one state color (`--info`, `--warning`, `--brand`, `--danger`) via the `-soft` tokens, text `--text`.
- **Demo cues**: mark the working part of a visual-only prototype with a "Live" pill (`--brand-soft` background, `--brand` text, 11px, uppercase) and, on first visit, a coachmark bubble (`--surface-2`, 1px `--brand` border, `--radius`, arrow toward its target) with one sentence and a "Got it" button. Dismissible with Esc, never blocks the page, shown once.
- **Notices**: a full-width banner for global warnings (e.g. demo mode): `--warning-soft` background, `--warning` text, 14px, one sentence, above the top bar.
- **Icons**: small inline SVG (24×24 viewBox, 1.75 stroke, `currentColor`); no icon libraries. Pair icon-only buttons with an `aria-label`.

## Tone of the copy
Friendly, professional and direct, in plain English. Action verbs on buttons ("Save patient", not "Submit"). Messages that confirm what happened: "Patient saved: Ana Pérez". Avoid technical jargon and excessive exclamation marks; a warm greeting on the main screen is fine ("Hi, Laura!").

## What NOT to do
- Don't copy Código Facilito's logos, names or copy: only the visual feel is borrowed (dark + green + rounded cards).
- Don't use syntax-highlighted code blocks or level badges (Beginner/Advanced): those belong to the education domain, not this product.
- Don't add UI or icon libraries to satisfy these rules; plain CSS with tokens is enough.
- Don't put real patient data in examples: use fictional names.
- Don't claim things the product doesn't do (e.g. "your data is protected" while there is no login).

## Self-check before delivering
These are the rules that are easiest to forget and cheapest to fix before handing UI back. Go through them against the code you wrote, and fix anything that fails rather than reporting it.
- [ ] All colors come from tokens
- [ ] Single primary button, dark text on green
- [ ] Inputs ≥44px, with a label and visible focus
- [ ] Errors in plain English with the action to fix them
- [ ] Looks right at 375px and at 1280px
