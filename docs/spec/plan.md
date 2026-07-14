# Plan — MyCar Logbook

Technical plan for implementing `spec.md` within the starter's stack and the
constitution's guardrails. No runtime AI/LLM (decided 2026-07-14).

## 1. Architecture overview

- **Next.js App Router**, existing starter layout. Routes:
  - `/` — dashboard (car header, status cards, suggestions card, timeline,
    FAB)
  - New-event form as a client-side dialog/sheet opened by the FAB.
- **Thin API routes** (scope change 2026-07-14): route handlers under
  `src/app/api/` persist user data to Neon — `GET /api/state`,
  `POST /api/events`, `POST /api/cars`, `POST /api/reset`. All status/
  suggestion/cost logic stays client-side pure computation.
- **Suggestion seam**: the suggestion engine is exposed through one small
  interface (`suggestServices(history, car, intervals, today)`), so a later
  LLM- or external-API-backed implementation can replace the rule engine
  without touching the UI.

## 2. Data model

```ts
type EventType =
  | "olajcsere" | "szurocsere" | "fekbetet" | "muszaki_vizsga"
  | "vezerles" | "fekfolyadek" | "egyeb";

interface ServiceEvent {
  id: string;
  carId: string;
  type: EventType;
  title: string;          // display label, Hungarian
  date: string;           // ISO yyyy-mm-dd
  odometerKm: number;
  costHuf?: number;
  note?: string;
}

interface CarModel {
  id: string;
  name: string;           // "Skoda Octavia 1.6 TDI"
  intervals?: ServiceInterval[]; // falls back to the generic default table
}

interface Car {
  id: string;
  modelId: string;
  nickname?: string;      // display name defaults to the model name
  year: number;           // 2012
  currentKm: number;      // max(initial reading, last event odometer)
}

interface ServiceInterval {
  type: EventType;
  everyKm?: number;       // e.g. oil: 10 000 km
  everyDays?: number;     // e.g. inspection: 730 days
}
```

## 3. Persistence (Neon Postgres — decided 2026-07-14)

- **Seed data**: `src/lib/data/seed.ts` — the demo car, the model catalog,
  ~10 events, and the service-interval tables (per model + generic default),
  versioned in the repo (deterministic demo). The seed is NOT in the
  database.
- **User-added cars and events**: **Neon Postgres** (project
  `car-manager` / `wild-mode-78781588`, tables `cars` + `service_events`,
  no FK to the code-resident seed car). `DATABASE_URL` in `.env`
  (gitignored) and in the Vercel project env. Driver:
  `@neondatabase/serverless` (human-approved runtime dependency).
- **Flow**: the browser loads `GET /api/state` (user delta) and merges it
  over the seed via the pure `mergeUserData` (`src/lib/data/store.ts`);
  mutations go through `POST /api/events|cars`; ids are generated
  server-side (`buildEvent`/`buildCar`). Active-car selection stays
  client-side UI state.
- **Reset**: „demo visszaállítása" = `POST /api/reset` deletes all user
  rows; the seeded Octavia always comes back.
- The original localStorage layer was replaced behind the same store seam;
  offline-first is relaxed accordingly (S10 revised).

## 4. Status & suggestion logic (the core)

- `src/lib/logic/status.ts` — pure functions: for each tracked item compute
  remaining km / days from history + intervals, and map to 🟢/🟡/🔴 per the
  thresholds in `spec.md` §1.
- `src/lib/logic/suggestions.ts` — pure function producing up to 5 Hungarian
  recommendation sentences (descending urgency) from templates over the same
  computation; items with no history produce the careful "check the
  manufacturer schedule" hint (never a fabricated due date). Km-based items
  get an approximate due date from the average-daily-km estimate (first→last
  known reading; requires ≥ 2 readings spanning ≥ 30 days, otherwise no
  estimate).
- `src/lib/logic/costs.ts` — pure cost aggregation: current-year and all-time
  totals per car from events that have a cost.
- Both are **unit-tested with boundary cases** — this is the demo's testable
  heart, and deliberately deterministic (S10).

## 5. Interval data source (under investigation)

The interval table ships as curated seed data. In parallel, we research
whether model-specific service schedules can come from an external source
(professional databases like HaynesPro/Autodata/TecAlliance, VIN-decoder
APIs, manufacturer publications). Findings land in
`docs/spec/research-service-intervals.md`; adopting any source is a human
decision (licensing/cost). Until then: curated table, honestly labeled in
the UI as demo data.

## 6. UI composition

- shadcn/ui components; add as needed via `npx shadcn@latest add`:
  likely `dialog`, `tabs`, `input`, `select`, `textarea`, `badge`,
  `separator`, `sonner` (toast). Timeline and FAB are small custom
  Tailwind components in `src/components/`.
- Design tokens (colors, spacing, status palette) are recorded in
  `DESIGN-GUIDELINE.md` as they are decided; the agent follows that file for
  every visual choice.

## 7. Testing strategy

- Unit tests (Vitest): status computation, suggestion sentences, date/km
  math, store merge logic, row↔model mappers, record builders,
  odometer-regression warning rule.
- No network in tests; everything deterministic. The Neon-backed routes and
  the fetch client are exercised end-to-end against the live database
  manually / in demo passes, not in unit tests.
- Gates: `typecheck && lint && test` locally and in CI; build must pass.

## 8. Risks / open decisions (human gates)

1. ~~AI provider + API key~~ — **DECIDED (2026-07-14, human):** no runtime
   LLM in this phase. Recorded as possible later phase in `spec.md` §7.
2. ~~Material look on shadcn~~ — **DECIDED (2026-07-14, human):** Material-
   inspired styling on the existing Tailwind + shadcn/ui stack, per AGENTS.md
   rule 3.
3. ~~Interval data source~~ — **DECIDED (2026-07-14, human):** curated local
   table as primary source (data-driven, sourced from the owner's manual /
   erWin, with source URL + retrieved date per row), behind a
   `MaintenanceScheduleProvider` seam so a TecRMI/HaynesPro adapter can plug
   in later. Research evidence: `research-service-intervals.md` (no free
   source covers EU-market vehicles; EU-covering vendors are
   enterprise-contract only).
4. ~~Single vs multiple cars~~ — **DECIDED (2026-07-14, human):** multi-car
   support is in scope: add-car form (model from the curated catalog + year +
   odometer + optional nickname) and a header car switcher. Still one user,
   no auth, no car deletion. Spec §2a; constitution §2 updated.
5. ~~Spec completeness pass~~ — **DECIDED (2026-07-14, human):** gap-closing
   clarifications (worst-of-two status for km+days items, top-3-most-urgent
   cards, suggestion ordering, zero odometer tolerance with confirmable
   warning, active-car scoping, `45 000 Ft` formatting, full-timeline +
   empty state, reset clears added cars, fixed service regime recorded in
   seed, system-following dark mode) plus two additions: **cost summary
   card** (S16) and **date estimate on km-based suggestions** (S17).
   Rejected for the MVP: event editing/deletion, JSON export/import,
   timeline filtering, manual theme toggle, VIN prefill (spec §6/§7).
6. ~~Server database~~ — **DECIDED (2026-07-14, human):** Neon Postgres is
   the persistence for user-added data, replacing localStorage behind the
   store seam (option chosen over a hybrid offline fallback). S10 revised:
   deterministic seed + no AI stays; offline-first is relaxed. New task T7
   (ROL-13) ordered T2 → T7 → T3. `@neondatabase/serverless` approved as a
   runtime dependency (constitution §2 exception).
