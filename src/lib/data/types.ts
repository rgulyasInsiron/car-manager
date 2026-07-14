// Data model for MyCar Logbook — see docs/spec/plan.md §2.
// Multi-car from the start: events reference their car via `carId`.

export type EventType =
  | "olajcsere"
  | "szurocsere"
  | "fekbetet"
  | "muszaki_vizsga"
  | "vezerles"
  | "fekfolyadek"
  | "egyeb";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  olajcsere: "Olajcsere",
  szurocsere: "Pollenszűrő csere",
  fekbetet: "Fékbetét csere",
  muszaki_vizsga: "Műszaki vizsga",
  vezerles: "Vezérlés csere",
  fekfolyadek: "Fékfolyadék csere",
  egyeb: "Egyéb szerviz",
};

export interface ServiceEvent {
  id: string;
  carId: string;
  type: EventType;
  title: string; // display label, Hungarian
  date: string; // ISO yyyy-mm-dd
  odometerKm: number;
  costHuf?: number;
  note?: string;
}

export interface ServiceInterval {
  type: EventType;
  everyKm?: number;
  everyDays?: number;
  // Provenance per plan.md §8/3; a row with neither everyKm nor everyDays is
  // tracked but interval-less (e.g. timing belt: "per manufacturer guidance").
  source?: string;
}

export interface CarModel {
  id: string;
  name: string; // "Skoda Octavia 1.6 TDI"
  regime?: "fixed" | "longlife";
  intervals?: ServiceInterval[]; // falls back to GENERIC_INTERVALS
}

export interface Car {
  id: string;
  modelId: string;
  nickname?: string; // display name defaults to the model name
  year: number;
  currentKm: number; // reading at creation; live value derives in the store
}
