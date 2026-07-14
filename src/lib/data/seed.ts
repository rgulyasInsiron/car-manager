// Versioned, deterministic demo data — see docs/spec/spec.md §4.
// The demo works offline and is reproducible; the reference "today" for the
// seed's status examples is 2026-07-14 (docs/spec/given-when-then.md S2).

import type { Car, CarModel, ServiceEvent, ServiceInterval } from "./types";

// Generic fallback interval table for catalog models without their own.
export const GENERIC_INTERVALS: ServiceInterval[] = [
  { type: "olajcsere", everyKm: 15_000, everyDays: 365 },
  { type: "szurocsere", everyKm: 15_000, everyDays: 365 },
  { type: "fekfolyadek", everyDays: 730 },
  { type: "muszaki_vizsga", everyDays: 730 },
  { type: "vezerles" }, // tracked, interval per manufacturer guidance
];

// Demo car's curated table. Fixed service regime (owner's manual baseline:
// 15 000 km / 1 year); the oil row uses the more conservative curated value.
const OCTAVIA_INTERVALS: ServiceInterval[] = [
  {
    type: "olajcsere",
    everyKm: 10_000,
    everyDays: 365,
    source:
      "Skoda Octavia II owner's manual, fixed regime (curated), retrieved 2026-07-14",
  },
  {
    type: "szurocsere",
    everyKm: 15_000,
    everyDays: 365,
    source: "Skoda Octavia II owner's manual, retrieved 2026-07-14",
  },
  {
    type: "fekfolyadek",
    everyDays: 730,
    source: "Skoda Octavia II owner's manual, retrieved 2026-07-14",
  },
  {
    type: "muszaki_vizsga",
    everyDays: 730,
    source: "Hungarian periodic inspection rule for passenger cars",
  },
  {
    type: "vezerles",
    source: "Per manufacturer guidance (erWin) — no fixed demo interval",
  },
];

export const MODEL_CATALOG: CarModel[] = [
  {
    id: "skoda-octavia-16-tdi",
    name: "Skoda Octavia 1.6 TDI",
    regime: "fixed",
    intervals: OCTAVIA_INTERVALS,
  },
  { id: "vw-golf-vii-16-tdi", name: "VW Golf VII 1.6 TDI" },
  { id: "toyota-corolla-18-hybrid", name: "Toyota Corolla 1.8 Hybrid" },
  { id: "ford-focus-15-ecoboost", name: "Ford Focus 1.5 EcoBoost" },
  { id: "opel-astra-k-14-turbo", name: "Opel Astra K 1.4 Turbo" },
  { id: "suzuki-vitara-16", name: "Suzuki Vitara 1.6" },
  { id: "dacia-duster-15-dci", name: "Dacia Duster 1.5 dCi" },
  { id: "bmw-320d-f30", name: "BMW 320d (F30)" },
  { id: "kia-ceed-16-crdi", name: "Kia Ceed 1.6 CRDi" },
];

export function intervalsForModel(modelId: string): ServiceInterval[] {
  const model = MODEL_CATALOG.find((m) => m.id === modelId);
  return model?.intervals ?? GENERIC_INTERVALS;
}

export const SEED_CAR: Car = {
  id: "seed-octavia-2012",
  modelId: "skoda-octavia-16-tdi",
  year: 2012,
  currentKm: 236_400,
};

// ~10 events spanning several years, consistent with the status-card
// examples in spec §1 / S2 (oil green, pollen filter yellow ~1 500 km,
// inspection red ~34 days at 2026-07-14) and the timing belt at 175 000 km.
export const SEED_EVENTS: ServiceEvent[] = [
  {
    id: "seed-ev-01",
    carId: SEED_CAR.id,
    type: "vezerles",
    title: "Vezérlés csere",
    date: "2023-05-20",
    odometerKm: 175_000,
    costHuf: 185_000,
    note: "Vezérműszíj + vízpumpa",
  },
  {
    id: "seed-ev-02",
    carId: SEED_CAR.id,
    type: "olajcsere",
    title: "Olajcsere",
    date: "2023-06-01",
    odometerKm: 176_500,
    costHuf: 38_000,
  },
  {
    id: "seed-ev-03",
    carId: SEED_CAR.id,
    type: "olajcsere",
    title: "Olajcsere",
    date: "2024-04-15",
    odometerKm: 189_000,
    costHuf: 40_000,
  },
  {
    id: "seed-ev-04",
    carId: SEED_CAR.id,
    type: "muszaki_vizsga",
    title: "Műszaki vizsga",
    date: "2024-08-17",
    odometerKm: 198_000,
    costHuf: 38_000,
  },
  {
    id: "seed-ev-05",
    carId: SEED_CAR.id,
    type: "fekfolyadek",
    title: "Fékfolyadék csere",
    date: "2024-09-08",
    odometerKm: 199_500,
    costHuf: 25_000,
  },
  {
    id: "seed-ev-06",
    carId: SEED_CAR.id,
    type: "olajcsere",
    title: "Olajcsere",
    date: "2025-03-05",
    odometerKm: 214_000,
    costHuf: 42_000,
  },
  {
    id: "seed-ev-07",
    carId: SEED_CAR.id,
    type: "fekbetet",
    title: "Fékbetét csere",
    date: "2025-06-10",
    odometerKm: 220_500,
    costHuf: 85_000,
    note: "Első tengely",
  },
  {
    id: "seed-ev-08",
    carId: SEED_CAR.id,
    type: "szurocsere",
    title: "Pollenszűrő csere",
    date: "2025-11-20",
    odometerKm: 222_900,
    costHuf: 18_000,
  },
  {
    id: "seed-ev-09",
    carId: SEED_CAR.id,
    type: "olajcsere",
    title: "Olajcsere",
    date: "2026-03-10",
    odometerKm: 235_000,
    costHuf: 45_000,
  },
  {
    id: "seed-ev-10",
    carId: SEED_CAR.id,
    type: "egyeb",
    title: "Egyéb szerviz",
    date: "2026-05-30",
    odometerKm: 236_000,
    costHuf: 15_000,
    note: "Klímatisztítás",
  },
];
