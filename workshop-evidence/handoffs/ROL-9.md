# Handoff — ROL-9 T4 — Manual event form
- Branch: rgulyas/rol-9-t4-manual-event-form · base: a75e464 · head: 36b5456
- Fix round: 0

## What was done
The dashboard FAB now opens the new-event dialog (spec §2). Fields with
Hungarian labels: Esemény típusa (shadcn Select over `EVENT_TYPE_LABELS`),
Dátum (native date input, defaults to today), Kilométer (number), Költség
(number, Ft, optional), Megjegyzés (textarea, optional).

Validation is a new pure module, `src/lib/logic/event-form.ts`
(`validateEventForm`, `isOdometerRegression`, `toNewEventInput`), fully
unit-tested with no DOM/network (plan §7). Type + date required, odometer
required and positive; optional cost must be non-negative when given.
Field-level Hungarian errors render under the inputs and nothing is saved
while any error exists (S5).

Odometer regression (S6, zero tolerance): as soon as a valid reading below
the active car's current known km is entered, an amber warning box
(icon + text, status palette `due-soon`) appears under the field and the
submit button relabels to „Mentés mindenképp" — saving is an explicit
confirmation, never blocked. The warning disappears if the value rises to
or above the current reading.

Save path: `createEvent()` → on success the parent Dashboard applies the
returned event via the unmodified `applyEvent()`, so timeline, status
cards, suggestions, and cost totals all recompute from state; current km
rises only when the new reading is the highest (existing
`currentKmForCar`). Events always attach to the active car (`carId` comes
from `activeCar(state)`). Success closes the dialog, resets the form, and
shows a sonner toast („Esemény mentve."). On API failure the dialog stays
open with every entered value intact and an inline advisory error line.

## Files touched
- `src/components/event-form-dialog.tsx` — new: FAB trigger + dialog + form
- `src/components/dashboard.tsx` — FAB replaced by `EventFormDialog`;
  `onSaved` applies the event to state
- `src/app/layout.tsx` — mounts the sonner `<Toaster />`
- `src/lib/logic/event-form.ts` + `event-form.test.ts` — new pure
  validation module + 11 unit tests
- `src/components/ui/{dialog,select,input,textarea,label,sonner}.tsx` —
  added via `npx shadcn@latest add`
- `src/components/ui/sonner.tsx` — edited after generation: dropped the
  CLI's `next-themes` import in favor of sonner's native `theme="system"`
- `package.json` / `package-lock.json` — `sonner` added; the CLI's
  `next-themes` was removed again

## Gates evidence
- `npm run typecheck` — clean (tsc --noEmit, no output)
- `npm run lint` — clean (eslint, no output)
- `npm run test` — Test Files 9 passed (9), Tests 60 passed (60)

## Spec coverage
- Scenarios addressed: S4, S5, S6, S8
- Verified end-to-end in a live dev server (Playwright): S5 (submit with
  cleared date, no type, no odometer → three field errors, nothing saved),
  S4 (Olajcsere / today / 236 500 / 45 000 → new top timeline row, header
  odometer 236 500 km, costs recomputed to 105 000 / 576 000 Ft), S8
  (Motorolaj card recomputed to „Következő csere: 246 500 km", stayed
  green; oil suggestion moved to „kb. 10 000 km múlva … 2027. január"),
  S6 (odometer 230 000 → visible warning naming the current reading,
  „Mentés mindenképp" confirm, saved as a backfilled row without lowering
  the header km), success toast text confirmed, persistence confirmed
  across reload, and a mocked 500 on POST /api/events left the dialog
  open with all values retained plus an inline error. The live Neon DB
  was cleaned afterwards via `POST /api/reset` (verified
  `{"userCars":[],"userEvents":[]}`).
- Deviations from the spec: none.

## Decisions taken within scope
- **Regression confirm = live warning + relabeled submit**, not a second
  dialog: the warning appears while typing and the single save button
  becomes „Mentés mindenképp". The guideline allows "sonner toast / Dialog
  confirm"; an in-dialog confirm affordance keeps the flow one-step and
  cannot be missed. Reviewer may prefer a two-step confirm — easy change.
- **`next-themes` removed after the shadcn CLI added it**: the generated
  sonner wrapper imported `next-themes`, an unapproved runtime library
  (constitution §2); the app has no theme provider (dark mode is a media
  query). Edited the local wrapper to `theme="system"` (sonner-native,
  same behavior) and uninstalled the package. `sonner` itself is
  explicitly in the guideline's expected component set.
- **Validation module placed in `src/lib/logic/`** as `event-form.ts` —
  a new file (no existing logic touched); that directory is the project's
  home for pure, unit-tested logic. The server route's validation is
  untouched and still the authority.
- **Cost field validated as non-negative when present** — spec only says
  "number, optional"; a negative cost is nonsensical and the server
  accepts any number, so the form catches it early (zero allowed).
- Note and cost are omitted (not sent as empty) when blank; note is
  trimmed — matches `buildEvent`'s optional-field handling.
- Form state resets only after a successful save; closing with „Mégse"
  keeps the entered values for reopening (no data loss).
- `todayIso` is passed down from Dashboard so the form's default date and
  the dashboard computations share one clock source.

## Open questions / risks
- The success toast uses sonner's default 4 s duration; during verification
  it was confirmed programmatically because it can expire between MCP
  round-trips — human demo will see it normally.
- `<input type="date">` relies on the browser's native picker; empty or
  partial input yields `""` which the validator rejects with the required
  error — acceptable for the MVP.
- The regression warning compares against the merged client state's
  current km; if another browser added a higher reading since page load,
  the warning threshold could be stale until reload. Server-side
  validation is unaffected. Considered acceptable single-user demo scope.
