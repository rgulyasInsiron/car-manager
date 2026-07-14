# Handoff — ROL-15 Docs write-back: dark-mode trigger wording, FAB clearance, severity labels, lucide approval
- Branch: rgulyas/rol-15-docs-write-back-dark-mode-trigger-wording-fab-clearance · base: a75e464 · head: c0be384
- Fix round: 0

## What was done
Docs-only write-back of what the merged T3 (ROL-8) implementation established,
so the governance docs match the code again. Every claim was verified against
the actual code in the worktree before writing:

1. `DESIGN-GUIDELINE.md` §Colors — dark-mode bullet rewritten: dark tokens and
   the `dark:` variant key off the `prefers-color-scheme` media query in
   `src/app/globals.css` (`@custom-variant dark (@media (prefers-color-scheme: dark))`
   plus a `@media (prefers-color-scheme: dark)` token block); the stale
   ".dark tokens" wording removed. Token VALUES unchanged.
2. `DESIGN-GUIDELINE.md` §Layout & spacing — FAB clearance rule recorded: the
   page container reserves `pb-24 md:pb-28` bottom padding so the fixed FAB
   never covers the last timeline row (verified in
   `src/components/dashboard.tsx`, container className
   `... p-4 pb-24 md:gap-8 md:p-8 md:pb-28`).
3. `DESIGN-GUIDELINE.md` §Colors — status palette table extended with a
   "Chip label (`src/components/severity.ts`)" column: Rendben / Hamarosan /
   Sürgős / Nincs adat (exact strings from `SEVERITY_LABELS`).
4. `docs/spec/constitution.md` §2 — `lucide-react` added to the human-approved
   dependency exceptions alongside `@neondatabase/serverless`, referencing the
   DESIGN-GUIDELINE mandate (plan §8/7). `docs/spec/plan.md` §8/7 — one
   sentence appended recording `lucide-react` as part of that approved
   decision (verified in `package.json`: `"lucide-react": "^1.24.0"`).

No product code, spec.md, tasks.md, or GWT files touched. No sections
renumbered.

## Files touched
- DESIGN-GUIDELINE.md
- docs/spec/constitution.md
- docs/spec/plan.md
- workshop-evidence/handoffs/ROL-15.md (this file)

## Gates evidence
- typecheck: `tsc --noEmit` — clean, no errors
- lint: `eslint` — clean, no errors
- test: `vitest run` — Test Files 8 passed (8), Tests 49 passed (49)

## Spec coverage
- Scenarios addressed: none directly (docs-only task); closes the four ROL-8
  review findings on doc/code drift:
  1. stale ".dark class" dark-mode trigger wording in DESIGN-GUIDELINE §Colors,
  2. undocumented FAB clearance padding (`pb-24 md:pb-28`),
  3. Hungarian severity chip labels missing next to the status palette table,
  4. `lucide-react` missing from the constitution §2 dependency exception and
     the plan §8/7 design-tokens decision record.
- Deviations from the spec: none.

## Decisions taken within scope
- Severity labels recorded as a new table column (rather than a separate
  bullet) so label and palette stay one source of truth per severity;
  the column header cites `src/components/severity.ts`.
- Constitution §2 wording changed from "exception" (singular) to
  "exceptions" listing both approved packages; sentence structure otherwise
  preserved.

## Open questions / risks
- None. Docs-only change; gates prove the code is untouched and green.
