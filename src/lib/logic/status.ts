// Status computation — pure and deterministic (spec §1, §3; plan §4).
// "today" is always an input; no clocks are read here.

import type { EventType, ServiceEvent, ServiceInterval } from "@/lib/data/types";
import { addDays, daysBetween, formatKm, formatNumberHu } from "./format";

export type Severity = "ok" | "due-soon" | "urgent" | "unknown";

// Card display names (spec §1 table).
export const CARD_NAMES: Record<EventType, string> = {
  olajcsere: "Motorolaj",
  szurocsere: "Pollenszűrő",
  fekbetet: "Fékbetét",
  muszaki_vizsga: "Műszaki vizsga",
  vezerles: "Vezérlés",
  fekfolyadek: "Fékfolyadék",
  egyeb: "Egyéb szerviz",
};

// Tie-break order for equally severe items (spec §1).
export const PRIORITY_ORDER: EventType[] = [
  "muszaki_vizsga",
  "olajcsere",
  "fekfolyadek",
  "fekbetet",
  "vezerles",
  "szurocsere",
  "egyeb",
];

export interface ItemStatus {
  type: EventType;
  name: string;
  severity: Severity;
  lastEvent?: ServiceEvent;
  remainingKm?: number;
  dueKm?: number;
  remainingDays?: number;
  dueDate?: string; // ISO
  detail: string; // card key figure, Hungarian
}

// Thresholds from spec §1.
function kmSeverity(remainingKm: number): Severity {
  if (remainingKm <= 500) return "urgent";
  if (remainingKm <= 3_000) return "due-soon";
  return "ok";
}

function daysSeverity(remainingDays: number): Severity {
  if (remainingDays <= 45) return "urgent";
  if (remainingDays <= 60) return "due-soon";
  return "ok";
}

const SEVERITY_RANK: Record<Severity, number> = {
  urgent: 0,
  "due-soon": 1,
  ok: 2,
  unknown: 3,
};

export function severityRank(severity: Severity): number {
  return SEVERITY_RANK[severity];
}

function lastEventOfType(
  events: ServiceEvent[],
  type: EventType,
): ServiceEvent | undefined {
  return events
    .filter((e) => e.type === type)
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.odometerKm - b.odometerKm,
    )
    .at(-1);
}

function detailText(status: Omit<ItemStatus, "detail">): string {
  const { severity, remainingKm, dueKm, remainingDays, lastEvent } = status;

  if (severity === "unknown") {
    return lastEvent ? `Utoljára: ${formatKm(lastEvent.odometerKm)}` : "Nincs adat";
  }

  // The dimension that produced the (worse) severity wins; ties go to km,
  // matching the spec §1 card examples.
  const kmSev = remainingKm !== undefined ? kmSeverity(remainingKm) : null;
  const daySev = remainingDays !== undefined ? daysSeverity(remainingDays) : null;
  const kmWins =
    kmSev !== null &&
    (daySev === null || SEVERITY_RANK[kmSev] <= SEVERITY_RANK[daySev]);

  if (kmWins && remainingKm !== undefined) {
    if (remainingKm < 0) return `Késésben: ${formatKm(-remainingKm)}`;
    if (severity === "ok" && dueKm !== undefined)
      return `Következő csere: ${formatKm(dueKm)}`;
    return `Kb. ${formatKm(remainingKm)} múlva`;
  }
  if (remainingDays !== undefined) {
    if (remainingDays < 0)
      return `Lejárt ${formatNumberHu(-remainingDays)} napja`;
    return `${formatNumberHu(remainingDays)} nap múlva`;
  }
  return "Nincs adat";
}

export function computeItemStatuses(
  events: ServiceEvent[],
  intervals: ServiceInterval[],
  currentKm: number,
  todayIso: string,
): ItemStatus[] {
  return intervals.map((interval) => {
    const lastEvent = lastEventOfType(events, interval.type);
    const base = {
      type: interval.type,
      name: CARD_NAMES[interval.type],
      ...(lastEvent ? { lastEvent } : {}),
    };

    // No history, or tracked without a concrete interval (e.g. timing belt):
    // never fabricate a due date (spec §3).
    if (!lastEvent || (!interval.everyKm && !interval.everyDays)) {
      const partial = { ...base, severity: "unknown" as const };
      return { ...partial, detail: detailText(partial) };
    }

    const kmPart =
      interval.everyKm !== undefined
        ? {
            dueKm: lastEvent.odometerKm + interval.everyKm,
            remainingKm: lastEvent.odometerKm + interval.everyKm - currentKm,
          }
        : {};
    const daysPart =
      interval.everyDays !== undefined
        ? {
            dueDate: addDays(lastEvent.date, interval.everyDays),
            remainingDays:
              interval.everyDays - daysBetween(lastEvent.date, todayIso),
          }
        : {};

    // Worst-of-two when both dimensions are tracked (spec §1).
    const severities: Severity[] = [];
    if (kmPart.remainingKm !== undefined)
      severities.push(kmSeverity(kmPart.remainingKm));
    if (daysPart.remainingDays !== undefined)
      severities.push(daysSeverity(daysPart.remainingDays));
    const severity = severities.reduce((worst, s) =>
      SEVERITY_RANK[s] < SEVERITY_RANK[worst] ? s : worst,
    );

    const partial = { ...base, ...kmPart, ...daysPart, severity };
    return { ...partial, detail: detailText(partial) };
  });
}

// The dashboard's three cards: most urgent first, ties broken by the fixed
// priority order (spec §1).
export function topStatusCards(
  statuses: ItemStatus[],
  count = 3,
): ItemStatus[] {
  return [...statuses]
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        PRIORITY_ORDER.indexOf(a.type) - PRIORITY_ORDER.indexOf(b.type),
    )
    .slice(0, count);
}
