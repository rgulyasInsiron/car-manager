# Agent orchestration — MyCar Logbook

Operating model for autonomous task execution (decided 2026-07-14, human).
Complements `AGENTS.md` (rule 6 is the intake rule) and the constitution;
conflicts resolve in favor of `docs/spec/constitution.md`.

## 1. Roles

- **Orchestrator** — a single long-running agent session. The ONLY actor
  allowed to pick up Linear issues and to spawn subagents. Never writes
  product code itself.
- **Maker** — subagent spawned per task, in an isolated git worktree.
  Validates, implements, commits, writes the handoff file.
- **Reviewer** — subagent spawned per review, with a FRESH context: it never
  sees the maker's conversation, only the artifacts listed in §5.
- **Human** — releases work (Backlog → Todo), merges PRs, decides
  escalations. Constitution §5 applies.

## 2. Linear state model

| State | Meaning | Who sets it |
|---|---|---|
| Backlog | not released for agents (or returned as under-specified) | human / orchestrator |
| Todo | released — agents may claim | human only |
| In Progress | claimed; maker working (incl. fix rounds, label `needs-fix`) | orchestrator |
| In Review | PR open, review passed, awaiting human merge | orchestrator |
| Done | PR merged to main | orchestrator (after merge detected) |

Setup prerequisite: the team needs an **In Review** state (create once in
Linear team settings). Fix rounds are marked with a `needs-fix` label +
comment, the issue stays In Progress.

## 3. Intake (orchestrator only)

Per AGENTS.md rule 6:
1. Poll Linear for issues in **Todo** that are **not blocked** by any open
   issue.
2. Quick-validate the issue against `docs/spec/constitution.md` (in scope,
   traceable to the spec package, gates defined). If it fails → move back to
   Backlog with a comment explaining what is missing; notify the human; stop.
3. Claim: set **In Progress** + assignee + comment
   (`claimed by orchestrator, run <timestamp>`), then spawn a maker.

Concurrency: several tasks may run in parallel, **one task = one maker = one
git worktree** (`git worktree add`), branch named per Linear's suggestion
(`rgulyas/rol-<n>-...`). Blocked tasks are never started, so parallel tasks
are independent by construction; merge conflicts are the maker's job to
resolve (rebase on main before handoff).

## 4. Maker protocol

1. **Validate first**: is the task sufficiently specified and executable
   (spec §refs resolve, acceptance scenarios exist, no missing human
   decision)? If not → return `VETO` + reasons; the orchestrator moves the
   issue to Backlog with the reasons as a comment and notifies the human.
2. Implement inside the worktree, following `AGENTS.md`,
   `DESIGN-GUIDELINE.md`, and the spec package. Next.js work requires
   reading the version-matched docs first (AGENTS.md).
3. Gates must be green before handoff:
   `npm run typecheck && npm run lint && npm run test`. If they cannot be
   made green within the task's scope → return `BLOCKED` + evidence;
   orchestrator escalates to the human.
4. Commit(s) on the task branch (English, focused; reference the ROL id).
5. Write the **handoff file**: `workshop-evidence/handoffs/ROL-<n>.md`
   (template in §7), commit it on the branch.
6. Return control to the orchestrator (summary = handoff file path + branch
   + head SHA).

## 5. Review protocol

The orchestrator spawns a reviewer with exactly these inputs — nothing else:
- the Linear issue (title, description, comments),
- the spec package (`docs/spec/`), `AGENTS.md`, `DESIGN-GUIDELINE.md`,
- the handoff file,
- the branch diff vs `main` (and the worktree to run things in).

The reviewer:
1. Re-runs the gates itself (never trusts the handoff's claim).
2. Judges the diff against the acceptance scenarios (S-numbers) the task
   covers, the constitution's guardrails, and the design guideline.
3. Produces findings, each with severity:
   - **critical** — spec violation, broken scenario, data loss, security;
   - **major** — wrong behavior or missing required part of the task;
   - **minor** — style, naming, small cleanup, nice-to-have.
4. Verdict: `APPROVE` (no critical/major) or `NEEDS_FIX` (any
   critical/major). Findings are posted as a Linear comment on the issue.

## 6. Verdict handling (orchestrator)

- **NEEDS_FIX** → label `needs-fix`, hand the findings back to the SAME
  maker (same worktree). Max **2 fix rounds**: if the 2nd re-review still
  finds critical/major, the issue gets label `escalated` + a summary
  comment; the orchestrator notifies the human and abandons the task (branch
  is left in place for inspection).
- **APPROVE** →
  1. minor findings become new **Backlog** issues (one per theme, linked to
     the original);
  2. push the task branch, open a **PR** to `main` (`gh pr create`), body =
     handoff summary + review verdict, linked to the Linear issue;
  3. set the issue to **In Review** and notify the human;
  4. the human merges (or rejects) the PR — merging to `main` stays a human
     act;
  5. on the next poll after merge, the orchestrator sets the issue to
     **Done**, removes the worktree, deletes the merged branch.

## 7. Handoff file template

```markdown
# Handoff — ROL-<n> <title>
- Branch: <name> · base: <main sha> · head: <sha>
- Fix round: 0 | 1 | 2 (with the findings addressed)

## What was done
<short prose — what exists now that didn't before>

## Files touched
<list>

## Gates evidence
typecheck / lint / test outputs (summary lines)

## Spec coverage
- Scenarios addressed: S…
- Deviations from the spec (if any) + why

## Decisions taken within scope
<judgment calls a reviewer should double-check>

## Open questions / risks
<anything the reviewer or human should know>
```

## 8. Authorization boundaries

- Pushing **task branches** and opening PRs is pre-authorized by this
  document (constitution §5 amended accordingly). Pushing or merging to
  `main` is NOT — that stays human-only.
- Deploys, external services, API keys, cost decisions: human-only,
  unchanged.
- The orchestrator never edits the spec package; spec gaps go back to the
  human via Backlog + comment.

## 9. Stop rules

- 2 failed fix rounds → escalate (§6).
- Maker `VETO` / `BLOCKED` → escalate, never guess.
- Any gate red at handoff → the handoff is invalid; orchestrator rejects it.
- The orchestrator stops claiming new tasks when the human says stop, or
  when no eligible Todo issue exists.
