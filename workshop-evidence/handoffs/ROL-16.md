# Handoff — ROL-16 todayIso should use local date, not UTC
- Branch: rgulyas/rol-16-todayiso-should-use-local-date-not-utc · base: d913e9a · head: (this commit)
- Fix round: 0

## What was done
Added a pure helper `todayIsoLocal(date: Date = new Date()): string` to
`src/lib/logic/format.ts` that derives yyyy-mm-dd from LOCAL time
(`getFullYear`/`getMonth`/`getDate`, zero-padded). The dashboard's `todayIso`
state initializer now calls it instead of `new Date().toISOString().slice(0, 10)`
(which is UTC — between 00:00 and 02:00 local CET/CEST it produced yesterday's
date, so item statuses, suggestions, and cost totals computed against the wrong
day, and SSR/CSR hydration could mismatch at day boundaries).

`event-form-dialog.tsx` was checked for the same UTC pattern: it does NOT
compute its own date — it receives `todayIso` as a prop from the dashboard, so
its date default is fixed transitively. No change needed there.

## Files touched
- src/lib/logic/format.ts (new `todayIsoLocal` helper)
- src/lib/logic/format.test.ts (4 new unit tests for `todayIsoLocal`)
- src/components/dashboard.tsx (use `todayIsoLocal()` at the computation site)

## Gates evidence
- typecheck: `tsc --noEmit` — clean, exit 0
- lint: `eslint` — clean, exit 0
- test: vitest — 9 files, 64 tests passed (was 60; +4 new)

## Spec coverage
- Scenarios addressed: S10 (today's date is an explicit input to the pure
  logic) — this fix keeps that input correct in local time. Status/suggestion
  scenarios (S1–S7) consume `todayIso` unchanged.
- Deviations: none. The existing ISO date math (`parseIsoDate`, `daysBetween`,
  `addDays`) stays UTC-based on purpose — it operates on calendar-date strings,
  which is timezone-free and deterministic.

## Decisions taken within scope
- Tests pass explicit `Date` objects built with the local-time constructor
  `new Date(y, m, d, h, …)` — deterministic in any TZ, no clock reads in
  assertions (a `new Date()` default-argument path exists but is not asserted
  against the wall clock).
- Kept `todayIso` in a `useState` initializer (computed once per mount), as
  before — only the derivation changed.

## Open questions / risks
- If the app ever renders the dashboard on the server, "local time" would be
  the server's TZ, not the visitor's. Today the component is `"use client"`
  and the value is computed in a state initializer on the client, so this is
  theoretical.
