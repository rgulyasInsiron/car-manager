# Handoff — ROL-12 T6 — Multi-car UI (add-car form + switcher)
- Branch: rgulyas/rol-12-t6-multi-car-ui-add-car-form-switcher · base: d913e9a · head: c98ef84
- Fix round: 0

## What was done
The dashboard header now supports multiple cars. An always-visible „Új autó"
button opens a shadcn Dialog (mirroring the T4 event-form pattern) with the
add-car form: Modell (Select over the seeded `MODEL_CATALOG`), Évjárat
(1980–current year), Kilométeróra-állás (positive), Becenév (optional).
Validation is a new pure, unit-tested module `src/lib/logic/car-form.ts`
(Hungarian field errors; the `/api/cars` route re-validates server-side —
unchanged). Saving goes through `createCar()` and `applyCar()`, which makes
the new car active (S13); a save failure keeps the dialog open with the
entered data. When 2+ cars exist, a header Select (`CarSwitcher`) switches
the active car via `setActiveCar()`, so status cards, suggestions, costs and
timeline all recompute (S14). A fresh car renders the pre-existing honest
empty state: "check the manufacturer schedule" hints, no fabricated dates,
empty timeline (S15 — verified, not reimplemented).

## Files touched
- `src/lib/logic/car-form.ts` (new — pure validation + input mapper)
- `src/lib/logic/car-form.test.ts` (new — unit tests)
- `src/components/car-form-dialog.tsx` (new — „Új autó" dialog)
- `src/components/car-switcher.tsx` (new — header Select)
- `src/components/dashboard.tsx` (header wiring: switcher + dialog,
  `applyCar`/`setActiveCar` state updates)

## Gates evidence
- typecheck: `tsc --noEmit` — clean
- lint: `eslint` — clean
- test: vitest — 10 files, 68 tests, all passed (rerun green after rebase)

## Spec coverage
- Scenarios addressed: S13, S14, S15 (spec §1 header/switcher, §2a add-car)
- Live E2E against the dev server + Neon: add VW Golf VII 2018 / 89 000 →
  becomes active, header shows "VW Golf VII 1.6 TDI, 2018" and "89 000 km"
  (S13); switch Octavia ⇄ Golf → all cards/suggestions/costs/timeline swap
  (S14); new car shows only "Nincs adat" statuses + careful hints + empty
  timeline (S15); nickname car ("Városi autó, 2020") verified in header and
  switcher labels; added cars survive a reload (Neon merge). DB reset at the
  end — `GET /api/state` returned `{"userCars":[],"userEvents":[]}`.
- Deviations: none.

## Decisions taken within scope
- Switcher/option label: `nickname ?? model name` + `, year` — same rule the
  header title already uses, so same-model cars stay distinguishable.
- `currentYear` for the year-range validation is derived from the
  dashboard's existing `todayIso` state and passed in as an explicit prop,
  keeping the validation module pure/deterministic (S10 style).
- Year must be an integer (spec says "évjárat"); odometer mirrors the
  event form's rule (any positive finite number).
- „Új autó" trigger is an outline Button at default size to match the
  switcher Select trigger height; both sit in a flex row under the H1
  (kept the odometer block untouched to minimize conflict surface with the
  parallel ROL-16 edit of dashboard.tsx).
- No new shadcn components were needed (dialog/select/input/label already
  present); no DESIGN-GUIDELINE.md changes — no new tokens or rules.

## Open questions / risks
- Active-car selection is client-side UI state by design (store.ts): after
  a full reload the dashboard falls back to the seed car. This matches T1's
  store contract; flagging it in case the reviewer expects persistence.
- ROL-16 had not merged into origin/main at handoff time (main still at
  d913e9a), so the mandated rebase was a no-op. If it merges before this
  branch, the only shared file is dashboard.tsx (they touch the todayIso
  line, untouched here) — conflict risk is low but nonzero on the import
  block.
