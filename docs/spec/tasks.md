# Tasks — MyCar Logbook

Ordered, reviewable increments. Each task ends with green gates
(`npm run typecheck && npm run lint && npm run test`) and maps back to
`spec.md` / `given-when-then.md`. One task ⇒ one focused commit (or PR).

## T0 — Preflight (mechanical)
Install dependencies (`npm ci`), run all gates, confirm local green matches
CI. No code changes. *Evidence: command outputs.*

## T1 — Data foundation
`src/lib/data/seed.ts` (car, ~10 events, interval table) +
`src/lib/data/store.ts` (seed + localStorage merge, add-event, reset).
Unit tests for merge and odometer derivation. *Covers spec §4; S1 data.*

## T2 — Status + suggestion logic
`src/lib/logic/status.ts` and `src/lib/logic/suggestions.ts` pure functions:
remaining km/days, 🟢/🟡/🔴 mapping, Hungarian recommendation sentences,
"no history" careful hint. Unit tests incl. boundary values.
*Covers spec §1 thresholds + §3; S2, S7, S9 logic.*

## T3 — Dashboard UI
Car header, three status cards, suggestions card, timeline with icons, FAB.
Hungarian labels, `hu-HU` formatting, responsive layout. Uses T1+T2.
*Covers S1, S2, S3, S7, S10, S12.*

## T4 — Manual event form
FAB opens dialog with the event form (type/date/km/cost/note), validation,
odometer-regression warning, save to store, timeline + status + suggestion
recompute. *Covers S4, S5, S6, S8.*

## T5 — Polish + demo pass
Icons, spacing, motion, empty/loading states, "demo visszaállítása" reset;
run the full 10-minute demo script once end-to-end; record deviations.
*Covers spec §5; S11 final check.*

## R1 — Interval-source research (parallel, non-blocking)
Review `docs/spec/research-service-intervals.md` (external sources for
model-specific service schedules); human decides adopt / defer. Outcome is
recorded in `plan.md` §8. *No implementation until decided.*

---

### Dependency notes
- T1 → T2 → T3 → T4 → T5 is the critical path; fully offline-demoable.
- R1 runs in parallel and must NOT block T1–T5; the curated seed table is the
  accepted default.
- Design-token decisions must land in `DESIGN-GUIDELINE.md` no later than T3.
