# Handoff — ROL-8 T3 — Dashboard UI
- Branch: rgulyas/rol-8-t3-dashboard-ui · base: f8ee885c89dff70a1b8e3b006fd59c22d91d4529 · head: a7189e148543df759951bdb567f14e4335e35a2f
- Fix round: 0

## What was done
The dashboard (spec §1) now exists at `/`: car header (name + year, hu-HU
formatted odometer hero figure), the three most-urgent status cards with
severity chips (dot + Hungarian label, design-guideline status palette),
the „Következő javasolt szervizek" card (up to 5 advisory bullets in
descending urgency, with severity dots), the „Szervizköltségek" card
(current-year + all-time totals), the scrollable full timeline with lucide
event-type icons and an empty state, and the fixed bottom-right FAB
(aria-labelled, no-op until T4 wires the event form dialog).

Data flow: the client `Dashboard` component renders the deterministic seed
immediately (so the seed dashboard works server-side and without the DB —
S10), then merges the Neon-persisted user delta via `fetchState()`. If
`/api/state` fails, the seed stays visible with an advisory Hungarian note —
the page never crashes. All statuses/suggestions/costs are computed
client-side with the unmodified T2 pure functions, `todayIso` passed in as
input; intervals come from `intervalsForModel()`.

Theme now genuinely follows the system: the starter's `dark` variant and the
dark token block were class-based (`.dark`) with nothing ever applying the
class; both are now keyed off `prefers-color-scheme` (token values
unchanged, no toggle — spec §5). App metadata is „MyCar Logbook" and
`<html lang="hu">`.

## Files touched
- `src/app/page.tsx` — replaced starter page with the dashboard
- `src/app/layout.tsx` — `lang="hu"`, MyCar Logbook metadata
- `src/app/globals.css` — dark variant + dark tokens moved from `.dark`
  class to `@media (prefers-color-scheme: dark)` (values unchanged)
- `src/components/dashboard.tsx` — client component: data loading, layout,
  header, FAB
- `src/components/status-card.tsx`, `suggestions-card.tsx`,
  `costs-card.tsx`, `timeline-card.tsx` — the four card types
- `src/components/severity.ts` — status palette + Hungarian chip labels
  (from DESIGN-GUIDELINE.md)
- `src/components/event-icon.ts` — event-type → lucide icon mapping
  (from DESIGN-GUIDELINE.md)
- `src/components/ui/badge.tsx` — added via `npx shadcn@latest add badge`
- `src/lib/logic/format.ts` — additive `formatDateHu()` (+ new
  `src/lib/logic/format.test.ts`)
- `package.json` / `package-lock.json` — `lucide-react` added

## Gates evidence
- `npm run typecheck` — clean (tsc --noEmit, no output)
- `npm run lint` — clean (eslint, no output)
- `npm run test` — Test Files 8 passed (8), Tests 49 passed (49)

## Spec coverage
- Scenarios addressed: S1, S2, S3, S7, S10, S12, S16 (S17's date-estimate
  suffix visibly renders in the suggestions; logic is T2's)
- Verified in a live dev server (SSR HTML + Playwright): S1 header
  („Skoda Octavia 1.6 TDI, 2012", „236 400 km"), S2 cards (Műszaki vizsga
  urgent „34 nap múlva", Pollenszűrő due-soon „Kb. 1 500 km múlva",
  Motorolaj ok „Következő csere: 245 000 km"), S3 timeline order/icons/
  costs, S7 five bullets in descending urgency, S16 totals (Idén 60 000 Ft,
  Összesen 531 000 Ft), S12 at 375 px (no horizontal scroll, FAB visible
  and fixed while scrolling), dark/light both render via emulated
  `prefers-color-scheme`, and the DB-failure path (mocked 500 on
  `/api/state`) renders the seed + advisory note without crashing.
- Deviations from the spec: none.

## Decisions taken within scope
- **`formatDateHu` added to `src/lib/logic/format.ts`** — the guideline
  forbids hand-formatting dates in components and designates format.ts as
  the formatting home, but T2 shipped no full-date formatter. Additive
  export (`2026-07-14` → `2026.07.14`, per spec §0's example), unit-tested;
  no existing logic touched.
- **Dark mode trigger moved from `.dark` class to a media query** — the
  guideline says "follows the system via the existing `.dark` tokens", but
  nothing ever applied the `.dark` class, so dark mode was dead code. Token
  values are byte-identical; only the trigger changed to
  `prefers-color-scheme` (the spec §5 requirement). No toggle added.
- **`lucide-react` installed via npm** — it was not yet a dependency;
  `components.json` (`iconLibrary: lucide`) and DESIGN-GUIDELINE.md declare
  it the stack's icon library, and the task needs the event icons + FAB
  „+". The badge component itself came from the official shadcn CLI.
- **FAB is an enabled no-op button** (not disabled), aria-label
  „Új esemény rögzítése" — T4 attaches the dialog; disabling it would make
  S12's "FAB reachable" check awkward and it reads as broken.
- **Seed-first loading instead of a spinner** — the deterministic seed
  renders synchronously (also in SSR HTML), the user delta swaps in when
  the API answers; no blank loading state needed.
- Layout adds `pb-24 / md:pb-28` bottom padding beyond the guideline's
  `p-4 md:p-8` so the fixed FAB never covers the last timeline row.
- Severity chip labels (Rendben / Hamarosan / Sürgős / Nincs adat) are new
  Hungarian UI copy, advisory in tone.

## Open questions / risks
- The dark-mode trigger change technically edits a starter token file;
  DESIGN-GUIDELINE.md's wording ("via the existing `.dark` tokens") was not
  updated because the orchestrator forbade modifying that file — if the
  reviewer wants the guideline wording synced, that is a one-line follow-up.
- `todayIso` is computed once per mount from the client clock
  (`new Date().toISOString().slice(0, 10)`, UTC). Around midnight a
  server-rendered page hydrated just after a UTC day boundary could log a
  one-off hydration warning; considered acceptable for the demo MVP.
- Timeline scroll container is capped at `max-h-96`; with very long
  histories the card stays compact (spec: "all events are listed
  (scrollable)").
