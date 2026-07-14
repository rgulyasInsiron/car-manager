# Spec — MyCar Logbook

A modern, clean web application for logging and anticipating car maintenance.
Workshop demo MVP; see `constitution.md` for scale and guardrails.

> Scope decision (2026-07-14, human): no runtime AI/LLM. Event entry is
> manual-form only; the one "smart" feature is the deterministic, rule-based
> service suggestion engine. LLM entry modes are recorded in §7 as a possible
> later phase.

## 0. Product summary

- **Name:** MyCar Logbook
- **Goal:** show, on a single glance dashboard, *what happened*, *what comes
  next*, and *what state the car is in* — with a rule-based suggestion engine
  turning the service history into readable maintenance advice.
- **Look & feel:** modern, minimalist, **Material Design–inspired** styling
  implemented with the repo's Tailwind + shadcn/ui stack (no MUI package;
  decided per AGENTS.md rule 3).
- **UI language:** Hungarian; `hu-HU` formatting (e.g. `236 400 km`,
  `2026.07.14`).

## 1. Dashboard (home page)

Header:
- Car name and year (e.g. **Skoda Octavia 1.6 TDI, 2012**).
- Current odometer reading, prominently displayed (e.g. **236 400 km**).
- Car switcher: when more than one car exists, a select in the header switches
  the active car; every dashboard element (status cards, suggestions,
  timeline) shows the active car's data. An „Új autó" action next to it opens
  the add-car form (§2a).

Status cards — three large cards, each with a colored status indicator
(🟢 ok / 🟡 due soon / 🔴 urgent), a title, and the key figure. The three
cards are the **3 most urgent tracked items** of the active car (ties broken
by a fixed priority order: műszaki vizsga, motorolaj, fékfolyadék, fékbetét,
vezérlés, pollenszűrő, egyéb); items with no history show the careful
no-history hint (§3). Example:

| Card | Example content |
|---|---|
| Motorolaj | „Következő csere: 245 000 km" — 🟢 |
| Pollenszűrő | „Kb. 1 500 km múlva" — 🟡 |
| Műszaki vizsga | „34 nap múlva" — 🔴 |

Status thresholds (distance-based items, from remaining km): 🟢 > 3 000 km,
🟡 ≤ 3 000 km, 🔴 ≤ 500 km or overdue. Time-based items (from remaining days):
🟢 > 60 days, 🟡 ≤ 60 days, 🔴 ≤ 45 days or overdue. Items tracked by both
km **and** days get the more severe of the two statuses. Values derive from
the event history + the service-interval table (§3).

Service suggestions card — see §3.

Cost summary card — **„Szervizköltségek"**: the active car's current-year and
all-time service cost totals, computed from events that have a cost (events
without a cost are excluded from the sums), formatted as `45 000 Ft`
(`hu-HU` grouping).

Timeline — „Legutóbbi események": reverse-chronological list of the active
car's events, each showing type icon, title, odometer, date, and cost when
known (formatted as `45 000 Ft`). All events are listed (scrollable); a car
with no events shows an empty state. Example items: Olajcsere (235 000 km,
2026.07.14), Pollenszűrő csere, Fékbetét csere, Műszaki vizsga.

Floating action button — a „+" FAB fixed to the bottom-right corner opens the
new-event form.

## 2. New event — manual form

The FAB opens a dialog/sheet with the event form:

- Esemény típusa (select: olajcsere, szűrőcsere, fékbetét, műszaki vizsga,
  vezérlés, fékfolyadék, egyéb szerviz)
- Dátum (date, default today)
- Kilométer (number)
- Költség (number, HUF, optional)
- Megjegyzés (textarea, optional)

Validation: type and date required; odometer required and positive. Any
odometer below the active car's last known reading (zero tolerance) triggers
a visible warning but can be confirmed and saved — this is how old events are
backfilled. The event is always recorded for the **active car**. Saving
updates the timeline and, when the new odometer is the highest known, the
dashboard's current-km value.

## 2a. Cars — add and switch

> Scope change (2026-07-14, human): multi-car support approved. The app
> manages multiple cars for the single demo user; constitution §2 updated
> accordingly.

The „Új autó" action opens a dialog with the add-car form:

- Modell (select from the seeded **model catalog**, e.g. Skoda Octavia
  1.6 TDI, VW Golf VII 1.6 TDI, Toyota Corolla 1.8 Hybrid, …)
- Évjárat (number, required, sane range 1980–current year)
- Kilométeróra-állás (number, required, positive)
- Becenév (text, optional — display name defaults to the model name)

Behavior:
- Saving creates the car, makes it the active car, and shows its dashboard.
- A newly added car has no event history: status cards and suggestions fall
  back to the careful "check the manufacturer schedule" hints (§3) — never a
  fabricated due date; the timeline shows an empty state.
- The model catalog is curated, versioned demo data; a model may carry its
  own service-interval table and otherwise falls back to a generic default
  table.
- The seeded demo car is always present after a demo reset and cannot be
  deleted; car deletion is otherwise out of scope for the MVP. The „demo
  visszaállítása" reset clears **all** user data — added events and added
  cars alike (full localStorage clear); only the seed remains.

## 3. Service suggestion engine (rule-based)

A dedicated dashboard card: **„Következő javasolt szervizek"**.

Input: current odometer, full event history (types, dates, odometer
readings), today's date, and the **service-interval table** (per event type:
`everyKm` and/or `everyDays`, seeded for the demo car).

Logic (pure, deterministic, unit-tested):
- For each tracked item, find the last matching event, compute remaining km
  and/or days against its interval, and produce a short Hungarian
  recommendation sentence from templates.
- Items never seen in the history produce a "check the manufacturer
  schedule" style hint instead of a fabricated due date.
- **Date estimate for km-based items:** from the first and last known
  odometer readings compute the average daily km; when the history has at
  least 2 readings spanning at least 30 days, km-based recommendations also
  include an approximate due date („várhatóan 2026. október körül").
  Otherwise no date estimate is shown. Deterministic (today's date is an
  input) and always phrased as an estimate.

Output: up to 5 bullet recommendations, ordered by descending urgency.
Example tone:

- „A motorolaj cseréje várhatóan kb. 2 000 km múlva lesz esedékes."
- „A pollenszűrő több mint egy éve nem volt cserélve."
- „A fékfolyadék cseréjének ideje közeledik."
- „A vezérlés utoljára 175 000 km-nél volt cserélve. Érdemes ellenőrizni a
  gyártó által ajánlott csereintervallumot."

Constraints: recommendations, **never diagnosis**; derived only from recorded
history + the interval table; no network dependency.

**Interval data source:** the table ships as curated, versioned demo data.
Whether a model-specific external source (manufacturer schedule databases,
VIN-based APIs) can replace or feed it is under investigation — see the
research note in `docs/spec/` and `plan.md` §8.

## 4. Demo data

The app starts pre-seeded and works without any user setup:

- Car: **Skoda Octavia 1.6 TDI, 2012**; current odometer **236 400 km**.
- ~10 past service events spanning several years and odometer readings,
  covering at least: olajcsere (multiple), pollenszűrő, fékbetét, fékfolyadék,
  vezérlés (at 175 000 km), műszaki vizsga — consistent with the status-card
  examples in §1.
- Service-interval table for the demo car (e.g. oil 10 000 km / 365 days,
  pollen filter 15 000 km / 365 days, brake fluid 730 days, inspection
  730 days, timing belt per manufacturer guidance). The table records that
  the demo car follows the **fixed service regime** (owner's manual baseline:
  15 000 km / 1 year; the seed uses the curated, more conservative values
  above), and each row carries its source (plan §8/3).
- Model catalog: a curated list of ~8–10 common models for the add-car form
  (§2a), each with its own service-interval table or the generic default.
- Seed data lives in a versioned module; user-added cars and events persist
  **server-side in Neon Postgres** (scope change 2026-07-14; see `plan.md`
  §3) on top of the code-resident seed. The seeded Octavia is always
  restored by the demo reset (which deletes the user rows).

## 5. UI requirements

- Material Design–inspired: elevated cards, clear hierarchy, status chips,
  icons per event type, generous spacing, subtle motion.
- Components from `src/components/ui/` (shadcn/ui); missing ones added via
  `npx shadcn@latest add <component>`.
- Responsive: single column on mobile, multi-column dashboard on desktop;
  FAB stays reachable on all sizes.
- Theme follows the system setting (`prefers-color-scheme`) using the
  starter's existing `.dark` tokens; no manual theme toggle.
- The dashboard must communicate at a glance: what happened, what comes next,
  what state the car is in.

## 6. Out of scope (explicit)

Authentication, multi-user (multi-car moved into scope 2026-07-14, see §2a),
car deletion, event editing/deletion, JSON export/import, timeline
filtering, manual theme toggle (the server database moved INTO scope
2026-07-14: Neon Postgres persists user data, see §4 and plan §3) (may arrive in a later
workshop block), notifications, PDF export, service-shop integrations, chat
UI, native mobile — and, until a human approves an AI API key: **any runtime
LLM call**, free-text event parsing, photo/receipt OCR.

## 7. Possible later phase (recorded, not planned)

If an AI API key is approved later: free-text event entry and photo/receipt
parsing prefilling the same form, and an LLM-written suggestion summary on
top of the rule engine. The suggestion engine's interface is the seam where
these plug in; nothing else in the app should need to change.
