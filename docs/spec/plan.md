# Plan — MyCar Logbook

Technical plan for implementing `spec.md` within the starter's stack and the
constitution's guardrails. No runtime AI/LLM (decided 2026-07-14).

## 1. Architecture overview

- **Next.js App Router**, existing starter layout. Routes:
  - `/` — dashboard (car header, status cards, suggestions card, timeline,
    FAB)
  - New-event form as a client-side dialog/sheet opened by the FAB.
- **No API routes needed**: all logic is client-side pure computation over
  seed + localStorage data. (If the interval-source research lands on an
  external API, a single thin route would be added behind the same seam.)
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

## 3. Persistence (demo-grade, deliberate)

- **Seed data**: `src/lib/data/seed.ts` — the demo car, the model catalog,
  ~10 events, and the service-interval tables (per model + generic default),
  versioned in the repo (deterministic demo).
- **User-added cars and events**: `localStorage` on the client, merged over
  the seed at load (`src/lib/data/store.ts`); the store also keeps
  `activeCarId`. A "demo visszaállítása" reset simply clears localStorage
  (seeded Octavia always comes back).
- **No server database.** Neon/Postgres arrives in a later workshop block;
  the store module is the single seam where it will plug in.

## 4. Status & suggestion logic (the core)

- `src/lib/logic/status.ts` — pure functions: for each tracked item compute
  remaining km / days from history + intervals, and map to 🟢/🟡/🔴 per the
  thresholds in `spec.md` §1.
- `src/lib/logic/suggestions.ts` — pure function producing 3–5 Hungarian
  recommendation sentences from templates over the same computation; items
  with no history produce the careful "check the manufacturer schedule" hint
  (never a fabricated due date).
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
  math, store merge logic, odometer-regression warning rule.
- No network in tests; everything deterministic.
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
