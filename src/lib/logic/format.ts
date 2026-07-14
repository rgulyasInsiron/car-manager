// hu-HU display formatting (spec §0/§1). Hand-rolled instead of Intl so the
// output is identical in node (tests) and every browser build.

const NBSP = " ";

export function formatNumberHu(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function formatKm(n: number): string {
  return `${formatNumberHu(n)}${NBSP}km`;
}

export function formatHuf(n: number): string {
  return `${formatNumberHu(n)}${NBSP}Ft`;
}

const HU_MONTHS = [
  "január",
  "február",
  "március",
  "április",
  "május",
  "június",
  "július",
  "augusztus",
  "szeptember",
  "október",
  "november",
  "december",
];

// "2026. október" — for the suggestion date estimate (spec §3).
export function formatMonthYearHu(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  return `${year}. ${HU_MONTHS[month - 1]}`;
}

// --- ISO date math (yyyy-mm-dd, UTC, deterministic) -----------------------

const DAY_MS = 86_400_000;

export function parseIsoDate(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso) - parseIsoDate(fromIso)) / DAY_MS);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(parseIsoDate(iso) + days * DAY_MS);
  return date.toISOString().slice(0, 10);
}
