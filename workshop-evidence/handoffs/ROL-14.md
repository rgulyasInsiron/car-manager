# Handoff — ROL-14 Guideline conformance: timeline cost type scale + suggestion severity label
- Branch: rgulyas/rol-14-guideline-conformance-timeline-cost-type-scale-suggestion · base: a75e464 · head: 1d97463
- Fix round: 0

## What was done
Two guideline-conformance fixes from the ROL-8 review findings:
1. Timeline cost (`timeline-card.tsx`) restyled from `text-sm font-medium
   tabular-nums` to `text-xs text-muted-foreground tabular-nums` — the cost is
   secondary metadata per DESIGN-GUIDELINE §Typography ("Secondary metadata
   (dates, costs on the timeline): text-xs text-muted-foreground").
2. Suggestion severity (`suggestions-card.tsx`) is no longer conveyed by a
   colored dot alone. Each row now shows the same `Badge` chip the status
   cards use — soft background + severity text color + dot + visible
   Hungarian label from `SEVERITY_LABELS` (e.g. "Sürgős") — per
   DESIGN-GUIDELINE §Colors ("always paired with an icon or label, never
   color alone").

## Files touched
- src/components/timeline-card.tsx
- src/components/suggestions-card.tsx

## Gates evidence
- typecheck: `tsc --noEmit` — clean, no errors
- lint: `eslint` — clean, no errors
- test: vitest — 8 files passed, 49 tests passed

## Spec coverage
- Scenarios addressed: none directly — this is design-guideline conformance
  (spec §5 "single glance" dashboard readability); behavior unchanged.
- Deviations from the spec: none.

## Decisions taken within scope
- Chose the visible `Badge` chip (identical pattern to `status-card.tsx`,
  reusing `SEVERITY_STYLES` + `SEVERITY_LABELS`) over an sr-only label: an
  sr-only label would still leave sighted color-blind users with color-only
  information, which the guideline forbids. No new components, colors, or
  tokens were introduced.
- Kept `tabular-nums` on the timeline cost as the task specified.

## Open questions / risks
- The Badge makes suggestion rows slightly taller/busier than the bare dot;
  reviewer should confirm this matches the intended density. Verified in a
  running dev server (SSR HTML) that costs render with the new classes and
  every suggestion row shows the dot + label chip; no database writes were
  performed.
