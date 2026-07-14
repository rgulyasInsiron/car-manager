# Handoff — ROL-17 Residual docs drift: spec §5 ".dark tokens" wording + guideline changelog phrasing
- Branch: rgulyas/rol-17-residual-docs-drift-spec-5-dark-tokens-wording-guideline · base: 4c92b69 · head: a6652ec
- Fix round: 0

## What was done
Two surgical docs-only edits removing wording drift found during the ROL-15
review:

1. `docs/spec/spec.md` §5 (UI requirements): the theme bullet claimed dark
   mode uses "the starter's existing `.dark` tokens" — stale since T3.
   Verified against `src/app/globals.css`: the dark token block and the
   `dark:` custom variant key off the `prefers-color-scheme` media query and
   no `.dark` class exists. Reworded the bullet to name the actual mechanism
   while keeping its intent (theme follows the system setting, no manual
   toggle).
2. `DESIGN-GUIDELINE.md` §Colors, dark-mode bullet: dropped the sentence
   "Token values are unchanged." — changelog-style phrasing relative to an
   unstated baseline. The bullet already names `globals.css` as the
   mechanism, and the §Colors base-palette bullet already declares the
   token set in `globals.css` as the single source of truth, so no
   replacement statement was needed.

No renumbering; no other sections touched.

## Files touched
- docs/spec/spec.md (§5, one bullet reworded)
- DESIGN-GUIDELINE.md (§Colors, one sentence removed)
- workshop-evidence/handoffs/ROL-17.md (this file)

## Gates evidence
- typecheck: `tsc --noEmit` — clean, no errors
- lint: `eslint` — clean, no errors
- test: `vitest run` — Test Files 8 passed (8), Tests 49 passed (49)

## Spec coverage
- Scenarios addressed: none directly — docs-only consistency fix; keeps
  spec §5's theme requirement aligned with the implemented mechanism.
- Deviations from the spec: none.

## Decisions taken within scope
- For finding 2 the task allowed either a standing statement or dropping
  the sentence; chose to drop it, since the mechanism (globals.css) and the
  single source of truth (base-palette bullet) are already stated in the
  same section — a replacement would have been redundant.
- Spec §5 rewording names `globals.css` and the media query explicitly,
  mirroring the phrasing already used in DESIGN-GUIDELINE.md §Colors for
  style consistency.

## Open questions / risks
- None. Grep confirms no remaining `.dark` references or "unchanged"
  phrasing in either document.
