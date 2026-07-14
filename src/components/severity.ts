// Status palette per DESIGN-GUIDELINE.md — the only chromatic accents in the
// app. Status is never communicated by color alone: always dot + label.

import type { Severity } from "@/lib/logic/status";

export const SEVERITY_STYLES: Record<
  Severity,
  { text: string; softBg: string; dot: string }
> = {
  ok: {
    text: "text-emerald-600 dark:text-emerald-400",
    softBg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  "due-soon": {
    text: "text-amber-600 dark:text-amber-400",
    softBg: "bg-amber-500/10",
    dot: "bg-amber-500",
  },
  urgent: {
    text: "text-red-600 dark:text-red-400",
    softBg: "bg-red-500/10",
    dot: "bg-red-500",
  },
  unknown: {
    text: "text-muted-foreground",
    softBg: "bg-muted",
    dot: "bg-muted-foreground",
  },
};

// Hungarian chip labels for the status badge.
export const SEVERITY_LABELS: Record<Severity, string> = {
  ok: "Rendben",
  "due-soon": "Hamarosan",
  urgent: "Sürgős",
  unknown: "Nincs adat",
};
