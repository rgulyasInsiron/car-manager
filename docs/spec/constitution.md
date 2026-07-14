# Constitution — MyCar Logbook

Non-negotiable principles for this project. Every spec, plan, task, and review
decision must comply. Conflicts are resolved here first.

## 1. Purpose and scale

- MyCar Logbook is a **workshop demo MVP**, presentable in ~10 minutes,
  built in a 3–4 hour window. It demonstrates AI-assisted development on an
  everyday application.
- It is explicitly **NOT** a complete car-management or enterprise system.
  No multi-user, no auth, no fleet, no admin, no i18n framework.
- When in doubt between "impressive demo" and "production completeness",
  choose the demo.

## 2. Scope guardrails

- One user, one locale (Hungarian UI text, `hu-HU` number/date formatting).
  Multiple cars are in scope since 2026-07-14 (human-approved spec change,
  see `spec.md` §2a) — still no multi-user, no fleet management.
- Feature set is fixed by `spec.md`. Anything not in the spec is out of scope
  until a human approves a spec change.
- No new runtime libraries beyond the approved stack (AGENTS.md rule 3).
  Specifically: **no Material UI (MUI) package** — the Material Design look is
  achieved with the existing Tailwind + shadcn/ui stack. Human-approved
  exception (2026-07-14): `@neondatabase/serverless` for the Neon
  persistence (plan §8/6).

## 3. Suggestion principles

- **No runtime LLM.** Decided 2026-07-14 (human): the app calls no AI API.
  The single "smart" feature is a **deterministic, rule-based service
  suggestion engine** (interval table + event history → recommendations).
  LLM-backed features (free-text parsing, photo OCR) are out of scope until a
  human approves an API key; the code keeps a clean seam for that upgrade.
- Suggestions are computed from **recorded history and the interval table
  only** — never from invented data.
- Maintenance texts are **advisory only — never a diagnosis**. Phrased as
  recommendations ("várhatóan", "érdemes ellenőrizni").
- The interval table is versioned data in the repo; where model-specific
  intervals come from (external source vs curated table) is a recorded
  decision, not an assumption (see `plan.md` §8 and the interval-source
  research note).

## 4. Engineering contract

- The repo rules in `AGENTS.md` apply in full (gates, shadcn workflow,
  English code/comments/commits).
- `npm run typecheck && npm run lint && npm run test` must be green before any
  task is declared done; CI must stay green on `main`.
- Secrets (AI API key) live only in `.env` (gitignored); never in code or
  `.mcp.json`.
- Demo data is deterministic and versioned in the repo, so the demo is
  reproducible. (Offline-first was relaxed 2026-07-14: user data persists
  in Neon; the seed itself still renders deterministically — S10.)

## 5. Role boundaries

- The **human** approves: this spec package, design tokens, external-facing
  steps (push, deploy, API keys, cost).
- The **coding agent** implements only within the approved spec and repo
  rules; it may not widen its own mandate.
- An **independent reviewer** (CI + second harness / human review) judges the
  result against this package, not against the maker's intent.
