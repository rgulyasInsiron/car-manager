// Store core: seed + server-persisted user data — see docs/spec/plan.md §3.
// Everything here is pure (unit-testable in node). Persistence lives in Neon
// behind the /api routes; the browser talks to it via api-client.ts.

import { SEED_CAR, SEED_EVENTS } from "./seed";
import { EVENT_TYPE_LABELS, type Car, type EventType, type ServiceEvent } from "./types";

export interface StoreState {
  cars: Car[]; // seed car first, then user-added cars
  events: ServiceEvent[];
  activeCarId: string;
}

// The user-added delta served by GET /api/state; the seed comes from code.
export interface UserData {
  userCars: Car[];
  userEvents: ServiceEvent[];
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

export function seedState(): StoreState {
  return {
    cars: [SEED_CAR],
    events: [...SEED_EVENTS],
    activeCarId: SEED_CAR.id,
  };
}

// Merge the server's user data over the seed. Active-car selection is
// client-side UI state; it falls back to the seed car when unknown.
export function mergeUserData(
  data: Partial<UserData> | null | undefined,
  activeCarId?: string,
): StoreState {
  const seed = seedState();
  const userCars = Array.isArray(data?.userCars) ? data.userCars : [];
  const userEvents = Array.isArray(data?.userEvents) ? data.userEvents : [];
  const cars = [...seed.cars, ...userCars];
  const active =
    activeCarId && cars.some((c) => c.id === activeCarId)
      ? activeCarId
      : seed.activeCarId;
  return { cars, events: [...seed.events, ...userEvents], activeCarId: active };
}

// Record builders — used by the API route handlers (single id source).
export function buildEvent(input: NewEventInput): ServiceEvent {
  return {
    id: crypto.randomUUID(),
    carId: input.carId,
    type: input.type,
    title: EVENT_TYPE_LABELS[input.type],
    date: input.date,
    odometerKm: input.odometerKm,
    ...(input.costHuf !== undefined ? { costHuf: input.costHuf } : {}),
    ...(input.note ? { note: input.note } : {}),
  };
}

export function buildCar(input: NewCarInput): Car {
  return {
    id: crypto.randomUUID(),
    modelId: input.modelId,
    year: input.year,
    currentKm: input.currentKm,
    ...(input.nickname ? { nickname: input.nickname } : {}),
  };
}

// Client-side state application after a successful save.
export function applyEvent(state: StoreState, event: ServiceEvent): StoreState {
  return { ...state, events: [...state.events, event] };
}

// Adding a car makes it the active car (spec §2a).
export function applyCar(state: StoreState, car: Car): StoreState {
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
