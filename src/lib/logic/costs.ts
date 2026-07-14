// Cost aggregation (spec §1 „Szervizköltségek" card; S16). Events without a
// cost are excluded from the sums.

import type { ServiceEvent } from "@/lib/data/types";

export interface CostTotals {
  currentYear: number;
  allTime: number;
}

export function costTotals(
  events: ServiceEvent[],
  todayIso: string,
): CostTotals {
  const year = todayIso.slice(0, 4);
  return events.reduce(
    (totals, event) => {
      if (event.costHuf === undefined) return totals;
      return {
        allTime: totals.allTime + event.costHuf,
        currentYear:
          totals.currentYear +
          (event.date.startsWith(year) ? event.costHuf : 0),
      };
    },
    { currentYear: 0, allTime: 0 },
  );
}
