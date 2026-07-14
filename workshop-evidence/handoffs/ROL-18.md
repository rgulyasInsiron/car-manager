# Handoff — ROL-18 Orchestration protocol: explicit dev-server teardown in maker checklist
- Branch: rgulyas/rol-18-orchestration-protocol-explicit-dev-server-teardown-in-maker · base: 4c92b69 · head: e6aea00
- Fix round: 0

## What was done
Docs-only change to `docs/agents/orchestration.md`, closing the ROL-14 review
finding that a maker left its verification dev server running after handoff:

1. §4 (Maker protocol) step 6 extended into **"Teardown, then return"**:
   before returning control to the orchestrator, the maker must stop every
   process it started (dev servers, watchers, background jobs) so the
   worktree is quiescent. Extending the existing handoff step keeps the
   §4 numbering (1–6) intact — no steps renumbered.
2. §5 (Review protocol) gained a short mirrored step 5: the reviewer stops
   every process it started (dev servers included) before returning its
   verdict, referencing the §4 rule.

No other file touched; no product code, spec package, or templates changed.

## Files touched
- docs/agents/orchestration.md
- workshop-evidence/handoffs/ROL-18.md (this file)

## Gates evidence
- typecheck: `tsc --noEmit` — clean, no errors
- lint: `eslint` — clean, no errors
- test: `vitest run` — Test Files 8 passed (8), Tests 49 passed (49)

## Spec coverage
- Scenarios addressed: none directly (docs-only, process document); closes
  the ROL-14 review finding on missing dev-server teardown at handoff.
- Deviations from the spec: none.

## Decisions taken within scope
- Teardown folded into the existing §4 step 6 (handoff/return step) rather
  than inserted as a new step, so the section's numbering stays intact as
  the task required; the step is retitled "Teardown, then return" to keep
  the clause visible as a checklist item.
- The optional §5 mirror was added as a one-line step 5 that cross-references
  §4 step 6 instead of repeating the full wording, to avoid two divergent
  copies of the same rule.
- Wording covers "dev servers, watchers, background jobs" generically instead
  of naming `npm run dev`, so the rule survives tooling changes.

## Open questions / risks
- None. Docs-only change; gates prove the code is untouched and green.
