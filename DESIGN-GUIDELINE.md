# Design guideline

The house style rulebook — the agent follows it in every UI task.
You fill it in during the workshop (v0 / shadcn will help); an empty section
is still a section: it tells the agent that the decision is still open.

> You may write your VALUES in Hungarian if that feels more comfortable —
> English is recommended, as models follow English instructions best.

> Decided 2026-07-14 for MyCar Logbook (human-delegated decision, recorded in
> plan.md §8/7). Material Design–inspired, implemented purely with the
> existing Tailwind + shadcn/ui stack (constitution §2: no MUI).

## Brand & tone

Calm, trustworthy, workshop-clean. A digital service book: information-dense
but never cluttered — the dashboard must answer "what happened / what's next /
what state" at a single glance (spec §5). UI language is Hungarian; tone of
all copy is advisory, never alarming or diagnostic (constitution §3).

## Colors

- **Base palette:** the starter's neutral oklch tokens in `globals.css` are
  the single source of truth (`bg-background`, `text-foreground`, `bg-card`,
  `text-muted-foreground`, `border-border`, …). Do not add new base colors.
- **Primary** stays the neutral near-black/near-white token (`bg-primary`) —
  buttons and the FAB use it. The app's visual character comes from the
  status palette, not from a brand hue.
- **Status palette** (the only chromatic accents; always paired with an icon
  or label, never color alone):
  | Severity (`src/lib/logic/status.ts`) | Foreground | Soft background | Dot | Chip label (`src/components/severity.ts`) |
  |---|---|---|---|---|
  | `ok` | `text-emerald-600 dark:text-emerald-400` | `bg-emerald-500/10` | `bg-emerald-500` | Rendben |
  | `due-soon` | `text-amber-600 dark:text-amber-400` | `bg-amber-500/10` | `bg-amber-500` | Hamarosan |
  | `urgent` | `text-red-600 dark:text-red-400` | `bg-red-500/10` | `bg-red-500` | Sürgős |
  | `unknown` | `text-muted-foreground` | `bg-muted` | `bg-muted-foreground` | Nincs adat |
- Status is shown as a colored dot / `Badge` chip + text, NOT as literal
  emoji (the spec's 🟢/🟡/🔴 is shorthand for these tokens).
- **Dark mode:** follows the system (spec §5): the dark token block and the
  `dark:` variant in `globals.css` key off the `prefers-color-scheme` media
  query — there is no `.dark` class and no toggle. Every custom color must be
  legible in both themes — the `dark:` variants above are mandatory.

## Typography

- **Family:** Geist (`font-sans`) for everything; `font-heading` (already
  mapped to Geist) for card titles. Geist Mono only for odometer/date values
  if tabular alignment is ever insufficient — prefer `tabular-nums` first.
- **Scale:**
  - App/page title: `text-2xl font-semibold`
  - Hero figure (current odometer): `text-4xl font-semibold tabular-nums`
  - Card title: `text-base font-medium` (shadcn CardTitle default)
  - Key figure on status cards: `text-lg font-semibold tabular-nums`
  - Body / list rows: `text-sm`
  - Secondary metadata (dates, costs on the timeline): `text-xs text-muted-foreground`
- All numbers (km, Ft, days) come from `src/lib/logic/format.ts` — never
  hand-format numbers or dates in components.

## Layout & spacing

- Mobile-first. Single column below `md`; the dashboard is `max-w-5xl mx-auto`
  with `p-4 md:p-8`.
- Status cards: `grid gap-4 md:grid-cols-3`. Suggestions + costs cards side
  by side on `lg` (`lg:grid-cols-[2fr_1fr]`), stacked below.
- Vertical rhythm: `gap-4` inside sections, `gap-6 md:gap-8` between sections.
- FAB: `fixed bottom-6 right-6 size-14 rounded-full shadow-lg` using the
  primary Button; must stay reachable on every viewport (S12). FAB clearance:
  the page container reserves bottom padding (`pb-24 md:pb-28`) so the fixed
  FAB never covers the last timeline row.
- Elevation, Material-style: cards are the elevated surface (shadcn Card's
  ring + `shadow-sm`); dialogs use the default shadcn overlay. No nested
  cards.

## Components

- Building blocks come from `src/components/ui/` only; missing ones are added
  with `npx shadcn@latest add <component>` (AGENTS.md rule 2). Expected set:
  `dialog`, `select`, `input`, `textarea`, `badge`, `separator`, `sonner`
  (+ existing `button`, `card`).
- Mapping:
  - Status cards / suggestions / costs / timeline container → `Card`
  - New-event and new-car forms → `Dialog` (sheet-like on mobile is fine)
  - Esemény típusa, modell, autóváltó → `Select`
  - Status chip → `Badge` with the status palette above
  - Save/confirm feedback + odometer-regression warning confirm → `sonner`
    toast / `Dialog` confirm
- Icons: **lucide-react** (the stack's icon library). Event-type mapping —
  use these consistently everywhere (timeline, cards, form):
  `olajcsere→Droplets`, `szurocsere→Fan`, `fekbetet→Disc`,
  `fekfolyadek→FlaskConical`, `muszaki_vizsga→ShieldCheck`,
  `vezerles→Cog`, `egyeb→Wrench`.
- Motion: subtle only — the stock tw-animate-css enter/exit on dialogs and a
  gentle fade/slide on newly added timeline rows. No decorative animation.
- Timeline: vertical list with icon, title, `odometer km · date`, cost on the
  right; reverse-chronological; scrollable within its card; empty state per
  S15.

## Don'ts

- No new UI libraries — specifically **no MUI** (constitution §2) and no
  icon set other than lucide.
- No inline `style=` attributes; no raw hex/oklch colors in components —
  Tailwind tokens and the status palette table only.
- Never communicate status by color alone (add dot+label or icon) — and no
  emoji as UI elements.
- No hand-rolled number/date formatting in components — use
  `src/lib/logic/format.ts`.
- Don't restyle `src/components/ui/` primitives ad hoc; extend via variants
  and record the decision here.
- No layout that breaks S12: no horizontal scrolling at 375 px, FAB always
  visible.
- Any new token or component rule an agent introduces MUST be written back
  into this file in the same change.

---

## Agent-driven design chain (2026-07 state)

You don't design by hand and you don't prompt blindly: the agent drives a design
tool FOR you, from the spec you approved. Two proven paths — both end back in
this file, because **this guideline is the contract: agents follow it, humans
approve it.**

**Prerequisites** (once, before the design step):
- Claude in Chrome/Edge browser extension installed and signed in →
  official guide: <https://claude.ai/chrome>
- OR for the Codex path: the Codex IDE/browser integration →
  official guide: <https://developers.openai.com/codex>
- An APPROVED spec package (constitution/spec/given-when-then/plan/tasks —
  module 3 output). Design starts from the spec, never from vibes.

### Path A — Claude Code drives Claude Design

1. In your Claude Code session run `/design consent` — this lets the agent
   read/write your Claude Design projects.
2. Fill (or let the agent draft) the token sections above — the agent can
   extract them from an existing brand site if you have one.
3. Give the agent this prompt (adjust the bracketed parts):

   > Using the approved spec package in `docs/spec/` and the tokens in
   > `DESIGN-GUIDELINE.md`: (1) sync the tokens and one reference page as a
   > design-system project via Claude Design; (2) open claude.ai/design in my
   > browser, complete the design-system setup wizard with our brand blurb and
   > exact tokens, and run the generation; (3) when it finishes, review the
   > result against the guideline and list deviations. Do not invent colors or
   > fonts — everything comes from the guideline.

4. Review the generated system at claude.ai/design (your eyes are the gate).
5. Import: the agent copies accepted components into `src/components/` and
   writes every new token decision BACK into this file — one source of truth.

### Path B — v0 + shadcn (from Codex or Claude)

1. Prompt v0 (v0.dev) with the spec's screen list plus the tokens above:

   > Build the [screen name] screen for the app specified as: [2-3 sentence
   > summary from spec.md]. Use exactly these design tokens: [paste Colors +
   > Typography sections]. shadcn/ui components only, mobile-first, no new
   > libraries.

2. Iterate in v0 until the screen matches the guideline, then pull the result
   into the starter: `npx shadcn@latest add "<v0 component URL>"`.
3. Record any token or component decision v0 introduced back into this file,
   and have the agent run the usual gates (`npm run typecheck && npm run lint
   && npm run test`) before committing.

Whichever path you take: the spec says WHAT, this guideline says HOW IT LOOKS,
and the agent connects the two — with you approving at both gates.
