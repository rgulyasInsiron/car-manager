// Client-side store: seed + localStorage merge — see docs/spec/plan.md §3.
// Core logic is pure (unit-testable in node); only load/persist/reset touch
// localStorage, and they no-op outside the browser.

import { SEED_CAR, SEED_EVENTS } from "./seed";
import { EVENT_TYPE_LABELS, type Car, type EventType, type ServiceEvent } from "./types";

export interface StoreState {
  cars: Car[]; // seed car first, then user-added cars
  events: ServiceEvent[];
  activeCarId: string;
}

export interface NewEventInput {
  carId: string;
  type: EventType;
  date: string; // ISO yyyy-mm-dd
  odometerKm: number;
  costHuf?: number;
  note?: string;
}

export interface NewCarInput {
  modelId: string;
  year: number;
  currentKm: number;
  nickname?: string;
}

// Only the user-added delta is persisted; the seed always comes from code.
interface PersistedState {
  userCars: Car[];
  userEvents: ServiceEvent[];
  activeCarId: string;
}

export const STORAGE_KEY = "mycar-logbook:v1";

function newId(): string {
  return crypto.randomUUID();
}

export function seedState(): StoreState {
  return {
    cars: [SEED_CAR],
    events: [...SEED_EVENTS],
    activeCarId: SEED_CAR.id,
  };
}

// Merge a persisted JSON payload over the seed. Tolerant: invalid or
// unexpected payloads fall back to the pure seed state.
export function mergeState(raw: string | null): StoreState {
  const seed = seedState();
  if (!raw) return seed;
  try {
    const persisted = JSON.parse(raw) as Partial<PersistedState>;
    const userCars = Array.isArray(persisted.userCars) ? persisted.userCars : [];
    const userEvents = Array.isArray(persisted.userEvents)
      ? persisted.userEvents
      : [];
    const cars = [...seed.cars, ...userCars];
    const activeCarId =
      typeof persisted.activeCarId === "string" &&
      cars.some((c) => c.id === persisted.activeCarId)
        ? persisted.activeCarId
        : seed.activeCarId;
    return { cars, events: [...seed.events, ...userEvents], activeCarId };
  } catch {
    return seed;
  }
}

// The persisted delta: everything not present in the seed.
export function serializeDelta(state: StoreState): string {
  const seedCarIds = new Set([SEED_CAR.id]);
  const seedEventIds = new Set(SEED_EVENTS.map((e) => e.id));
  const delta: PersistedState = {
    userCars: state.cars.filter((c) => !seedCarIds.has(c.id)),
    userEvents: state.events.filter((e) => !seedEventIds.has(e.id)),
    activeCarId: state.activeCarId,
  };
  return JSON.stringify(delta);
}

export function addEvent(state: StoreState, input: NewEventInput): StoreState {
  const event: ServiceEvent = {
    id: newId(),
    carId: input.carId,
    type: input.type,
    title: EVENT_TYPE_LABELS[input.type],
    date: input.date,
    odometerKm: input.odometerKm,
    ...(input.costHuf !== undefined ? { costHuf: input.costHuf } : {}),
    ...(input.note ? { note: input.note } : {}),
  };
  return { ...state, events: [...state.events, event] };
}

// Adding a car makes it the active car (spec §2a).
export function addCar(state: StoreState, input: NewCarInput): StoreState {
  const car: Car = {
    id: newId(),
    modelId: input.modelId,
    year: input.year,
    currentKm: input.currentKm,
    ...(input.nickname ? { nickname: input.nickname } : {}),
  };
  return { ...state, cars: [...state.cars, car], activeCarId: car.id };
}

export function setActiveCar(state: StoreState, carId: string): StoreState {
  if (!state.cars.some((c) => c.id === carId)) return state;
  return { ...state, activeCarId: carId };
}

export function activeCar(state: StoreState): Car {
  return state.cars.find((c) => c.id === state.activeCarId) ?? state.cars[0];
}

// Reverse-chronological (spec §1); same-day events ordered by odometer desc.
export function eventsForCar(state: StoreState, carId: string): ServiceEvent[] {
  return state.events
    .filter((e) => e.carId === carId)
    .sort(
      (a, b) => b.date.localeCompare(a.date) || b.odometerKm - a.odometerKm,
    );
}

// Live odometer: the highest known reading (initial value or any event).
export function currentKmForCar(state: StoreState, carId: string): number {
  const car = state.cars.find((c) => c.id === carId);
  const base = car?.currentKm ?? 0;
  return state.events
    .filter((e) => e.carId === carId)
    .reduce((max, e) => Math.max(max, e.odometerKm), base);
}

// --- Browser-only persistence -------------------------------------------

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadState(): StoreState {
  return mergeState(storage()?.getItem(STORAGE_KEY) ?? null);
}

export function persist(state: StoreState): void {
  storage()?.setItem(STORAGE_KEY, serializeDelta(state));
}

// „Demo visszaállítása": clears all user data, added cars included (spec §2a).
export function resetDemo(): StoreState {
  storage()?.removeItem(STORAGE_KEY);
  return seedState();
}
