import { describe, expect, it } from "vitest";

import { SEED_CAR, SEED_EVENTS } from "./seed";
import {
  activeCar,
  addCar,
  addEvent,
  currentKmForCar,
  eventsForCar,
  mergeState,
  seedState,
  serializeDelta,
  setActiveCar,
} from "./store";

describe("mergeState", () => {
  it("returns the pure seed for null input", () => {
    const state = mergeState(null);
    expect(state.cars).toEqual([SEED_CAR]);
    expect(state.events).toHaveLength(SEED_EVENTS.length);
    expect(state.activeCarId).toBe(SEED_CAR.id);
  });

  it("falls back to the seed on invalid JSON", () => {
    expect(mergeState("{not json")).toEqual(seedState());
    expect(mergeState('{"userCars":"nope"}')).toEqual(seedState());
  });

  it("merges persisted user cars and events over the seed", () => {
    const withCar = addCar(seedState(), {
      modelId: "vw-golf-vii-16-tdi",
      year: 2018,
      currentKm: 89_000,
    });
    const withEvent = addEvent(withCar, {
      carId: withCar.activeCarId,
      type: "olajcsere",
      date: "2026-07-01",
      odometerKm: 89_500,
      costHuf: 52_000,
    });

    const restored = mergeState(serializeDelta(withEvent));

    expect(restored.cars).toHaveLength(2);
    expect(restored.events).toHaveLength(SEED_EVENTS.length + 1);
    expect(restored.activeCarId).toBe(withEvent.activeCarId);
  });

  it("resets activeCarId to the seed car when it points to a missing car", () => {
    const state = mergeState(
      JSON.stringify({ userCars: [], userEvents: [], activeCarId: "ghost" }),
    );
    expect(state.activeCarId).toBe(SEED_CAR.id);
  });
});

describe("currentKmForCar (odometer derivation)", () => {
  it("derives the seed car's odometer from the highest known reading", () => {
    // Seed events top out at 236 000; the car's initial reading is higher.
    expect(currentKmForCar(seedState(), SEED_CAR.id)).toBe(236_400);
  });

  it("rises when a new event has the highest odometer", () => {
    const state = addEvent(seedState(), {
      carId: SEED_CAR.id,
      type: "olajcsere",
      date: "2026-07-14",
      odometerKm: 237_100,
    });
    expect(currentKmForCar(state, SEED_CAR.id)).toBe(237_100);
  });

  it("does not drop when a backfilled event has a lower odometer", () => {
    const state = addEvent(seedState(), {
      carId: SEED_CAR.id,
      type: "fekbetet",
      date: "2022-01-10",
      odometerKm: 150_000,
    });
    expect(currentKmForCar(state, SEED_CAR.id)).toBe(236_400);
  });
});

describe("per-car scoping", () => {
  it("a newly added car becomes active and starts with no events", () => {
    const state = addCar(seedState(), {
      modelId: "toyota-corolla-18-hybrid",
      year: 2020,
      currentKm: 45_000,
      nickname: "Családi Corolla",
    });
    expect(activeCar(state).nickname).toBe("Családi Corolla");
    expect(eventsForCar(state, state.activeCarId)).toHaveLength(0);
    expect(currentKmForCar(state, state.activeCarId)).toBe(45_000);
  });

  it("events attach only to their own car", () => {
    const withCar = addCar(seedState(), {
      modelId: "vw-golf-vii-16-tdi",
      year: 2018,
      currentKm: 89_000,
    });
    const state = addEvent(withCar, {
      carId: withCar.activeCarId,
      type: "szurocsere",
      date: "2026-07-10",
      odometerKm: 89_200,
    });

    expect(eventsForCar(state, state.activeCarId)).toHaveLength(1);
    expect(eventsForCar(state, SEED_CAR.id)).toHaveLength(SEED_EVENTS.length);
    expect(currentKmForCar(state, SEED_CAR.id)).toBe(236_400);
  });

  it("setActiveCar switches only to existing cars", () => {
    const state = seedState();
    expect(setActiveCar(state, "ghost")).toBe(state);

    const withCar = addCar(state, {
      modelId: "bmw-320d-f30",
      year: 2015,
      currentKm: 160_000,
    });
    const back = setActiveCar(withCar, SEED_CAR.id);
    expect(back.activeCarId).toBe(SEED_CAR.id);
  });
});

describe("eventsForCar ordering", () => {
  it("lists events reverse-chronologically, ties broken by odometer", () => {
    const state = addEvent(seedState(), {
      carId: SEED_CAR.id,
      type: "egyeb",
      date: "2026-05-30", // same day as seed-ev-10 (236 000 km)
      odometerKm: 236_050,
    });
    const events = eventsForCar(state, SEED_CAR.id);
    const dates = events.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(events[0].odometerKm).toBe(236_050);
    expect(events[1].odometerKm).toBe(236_000);
  });
});

describe("addEvent", () => {
  it("derives the Hungarian title and keeps optional fields optional", () => {
    const state = addEvent(seedState(), {
      carId: SEED_CAR.id,
      type: "muszaki_vizsga",
      date: "2026-08-01",
      odometerKm: 237_000,
    });
    const added = eventsForCar(state, SEED_CAR.id)[0];
    expect(added.title).toBe("Műszaki vizsga");
    expect(added.costHuf).toBeUndefined();
    expect(added.note).toBeUndefined();
    expect(added.id).toBeTruthy();
  });
});
