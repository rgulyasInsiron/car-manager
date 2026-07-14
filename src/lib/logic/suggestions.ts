// Rule-based service suggestions (spec §3; plan §4). Advisory sentences only
// — never diagnosis, never invented data. Pure and deterministic.

import type { EventType, ServiceEvent, ServiceInterval } from "@/lib/data/types";
import {
  addDays,
  daysBetween,
  formatKm,
  formatMonthYearHu,
  formatNumberHu,
} from "./format";
import {
  computeItemStatuses,
  PRIORITY_ORDER,
  severityRank,
  type ItemStatus,
  type Severity,
} from "./status";

export interface Suggestion {
  type: EventType;
  severity: Severity;
  text: string;
}

// Lowercase names for sentence templates.
const SENTENCE_NAMES: Record<EventType, string> = {
  olajcsere: "motorolaj",
  szurocsere: "pollenszűrő",
  fekbetet: "fékbetét",
  muszaki_vizsga: "műszaki vizsga",
  vezerles: "vezérlés",
  fekfolyadek: "fékfolyadék",
  egyeb: "egyéb szerviz",
};

// Average daily km from the first and last known odometer readings.
// Guards (spec §3): at least 2 readings spanning at least 30 days, with a
// positive km delta — otherwise no estimate.
export function estimateDailyKm(events: ServiceEvent[]): number | null {
  const sorted = [...events].sort(
    (a, b) => a.date.localeCompare(b.date) || a.odometerKm - b.odometerKm,
  );
  if (sorted.length < 2) return null;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days = daysBetween(first.date, last.date);
  const km = last.odometerKm - first.odometerKm;
  if (days < 30 || km <= 0) return null;
  return km / days;
}

// "(várhatóan 2026. október körül)" — appended to km-based sentences when
// the daily-km estimate is available.
function dateEstimateSuffix(
  remainingKm: number,
  dailyKm: number | null,
  todayIso: string,
): string {
  if (dailyKm === null || remainingKm <= 0) return "";
  const dueIso = addDays(todayIso, Math.round(remainingKm / dailyKm));
  return ` (várhatóan ${formatMonthYearHu(dueIso)} körül)`;
}

function sentenceFor(
  status: ItemStatus,
  dailyKm: number | null,
  todayIso: string,
): string {
  const name = SENTENCE_NAMES[status.type];

  if (status.severity === "unknown") {
    if (status.lastEvent) {
      // Tracked without a concrete interval, e.g. timing belt (spec §3).
      return `A ${name} utoljára ${formatKm(status.lastEvent.odometerKm)}-nél volt cserélve. Érdemes ellenőrizni a gyártó által ajánlott csereintervallumot.`;
    }
    return `A(z) ${name} tételről nincs rögzített adat. Érdemes ellenőrizni a gyártó által ajánlott ütemezést.`;
  }

  // The dimension that produced the severity drives the sentence; km wins
  // ties, mirroring the status cards.
  const kmDriven =
    status.remainingKm !== undefined &&
    (status.remainingDays === undefined ||
      severityForKm(status.remainingKm) <= severityForDays(status.remainingDays));

  if (kmDriven && status.remainingKm !== undefined) {
    if (status.remainingKm < 0) {
      return `A ${name} cseréje esedékes — kb. ${formatKm(-status.remainingKm)} késésben.`;
    }
    return `A ${name} cseréje várhatóan kb. ${formatKm(status.remainingKm)} múlva lesz esedékes${dateEstimateSuffix(status.remainingKm, dailyKm, todayIso)}.`;
  }

  const days = status.remainingDays ?? 0;
  if (status.type === "muszaki_vizsga") {
    return days < 0
      ? `A műszaki vizsga lejárt ${formatNumberHu(-days)} napja.`
      : `A műszaki vizsga ${formatNumberHu(days)} nap múlva esedékes.`;
  }
  if (days < 0) {
    return `A ${name} cseréje esedékes — ${formatNumberHu(-days)} napja lejárt.`;
  }
  if (status.severity !== "ok") {
    return `A ${name} cseréjének ideje közeledik (${formatNumberHu(days)} nap múlva).`;
  }
  return `A ${name} cseréje ${formatNumberHu(days)} nap múlva esedékes.`;
}

// Rank helpers kept local so sentence selection matches status.ts exactly.
function severityForKm(remainingKm: number): number {
  if (remainingKm <= 500) return 0;
  if (remainingKm <= 3_000) return 1;
  return 2;
}
function severityForDays(remainingDays: number): number {
  if (remainingDays <= 45) return 0;
  if (remainingDays <= 60) return 1;
  return 2;
}

// Up to `max` recommendations, most urgent first (spec §3).
export function buildSuggestions(
  events: ServiceEvent[],
  intervals: ServiceInterval[],
  currentKm: number,
  todayIso: string,
  max = 5,
): Suggestion[] {
  const statuses = computeItemStatuses(events, intervals, currentKm, todayIso);
  const dailyKm = estimateDailyKm(events);
  return [...statuses]
    .sort(
      (a, b) =>
        severityRank(a.severity) - severityRank(b.severity) ||
        PRIORITY_ORDER.indexOf(a.type) - PRIORITY_ORDER.indexOf(b.type),
    )
    .slice(0, max)
    .map((status) => ({
      type: status.type,
      severity: status.severity,
      text: sentenceFor(status, dailyKm, todayIso),
    }));
}
