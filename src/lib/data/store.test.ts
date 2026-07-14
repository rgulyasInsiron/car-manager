import { describe, expect, it } from "vitest";

import { SEED_CAR, SEED_EVENTS } from "./seed";
import {
  activeCar,
  applyCar,
  applyEvent,
  buildCar,
  buildEvent,
  currentKmForCar,
  eventsForCar,
  mergeUserData,
  seedState,
  setActiveCar,
  type StoreState,
} from "./store";

function withNewCar(state: StoreState = seedState()) {
  const car = buildCar({
    modelId: "vw-golf-vii-16-tdi",
    year: 2018,
    currentKm: 89_000,
  });
  return { car, state: applyCar(state, car) };
}

describe("mergeUserData", () => {
  it("returns the pure seed for empty server data", () => {
    for (const empty of [null, undefined, {}]) {
      const state = mergeUserData(empty);
      expect(state.cars).toEqual([SEED_CAR]);
      expect(state.events).toHaveLength(SEED_EVENTS.length);
      expect(state.activeCarId).toBe(SEED_CAR.id);
    }
  });

  it("merges server-side user cars and events over the seed", () => {
    const car = buildCar({ modelId: "bmw-320d-f30", year: 2015, currentKm: 160_000 });
    const event = buildEvent({
      carId: car.id,
      type: "olajcsere",
      date: "2026-07-01",
      odometerKm: 160_500,
      costHuf: 52_000,
    });
    const state = mergeUserData(
      { userCars: [car], userEvents: [event] },
      car.id,
    );
    expect(state.cars).toHaveLength(2);
    expect(state.events).toHaveLength(SEED_EVENTS.length + 1);
    expect(state.activeCarId).toBe(car.id);
  });

  it("falls back to the seed car when activeCarId is unknown", () => {
    expect(mergeUserData({}, "ghost").activeCarId).toBe(SEED_CAR.id);
  });
});

describe("record builders (server-side id source)", () => {
  it("buildEvent derives the Hungarian title and keeps optionals optional", () => {
    const event = buildEvent({
      carId: SEED_CAR.id,
      type: "muszaki_vizsga",
      date: "2026-08-01",
      odometerKm: 237_000,
    });
    expect(event.title).toBe("Műszaki vizsga");
    expect(event.costHuf).toBeUndefined();
    expect(event.note).toBeUndefined();
    expect(event.id).toBeTruthy();
  });

  it("buildCar keeps the nickname optional", () => {
    const car = buildCar({ modelId: "kia-ceed-16-crdi", year: 2019, currentKm: 70_000 });
    expect(car.nickname).toBeUndefined();
    expect(car.id).toBeTruthy();
  });
});

describe("currentKmForCar (odometer derivation)", () => {
  it("derives the seed car's odometer from the highest known reading", () => {
    expect(currentKmForCar(seedState(), SEED_CAR.id)).toBe(236_400);
  });

  it("rises when a new event has the highest odometer", () => {
    const state = applyEvent(
      seedState(),
      buildEvent({
        carId: SEED_CAR.id,
        type: "olajcsere",
        date: "2026-07-14",
        odometerKm: 237_100,
      }),
    );
    expect(currentKmForCar(state, SEED_CAR.id)).toBe(237_100);
  });

  it("does not drop when a backfilled event has a lower odometer", () => {
    const state = applyEvent(
      seedState(),
      buildEvent({
        carId: SEED_CAR.id,
        type: "fekbetet",
        date: "2022-01-10",
        odometerKm: 150_000,
      }),
    );
    expect(currentKmForCar(state, SEED_CAR.id)).toBe(236_400);
  });
});

describe("per-car scoping", () => {
  it("an applied new car becomes active and starts with no events", () => {
    const { car, state } = withNewCar();
    expect(activeCar(state).id).toBe(car.id);
    expect(eventsForCar(state, car.id)).toHaveLength(0);
    expect(currentKmForCar(state, car.id)).toBe(89_000);
  });

  it("events attach only to their own car", () => {
    const { car, state: withCar } = withNewCar();
    const state = applyEvent(
      withCar,
      buildEvent({
        carId: car.id,
        type: "szurocsere",
        date: "2026-07-10",
        odometerKm: 89_200,
      }),
    );
    expect(eventsForCar(state, car.id)).toHaveLength(1);
    expect(eventsForCar(state, SEED_CAR.id)).toHaveLength(SEED_EVENTS.length);
    expect(currentKmForCar(state, SEED_CAR.id)).toBe(236_400);
  });

  it("setActiveCar switches only to existing cars", () => {
    const state = seedState();
    expect(setActiveCar(state, "ghost")).toBe(state);

    const { state: withCar } = withNewCar(state);
    expect(setActiveCar(withCar, SEED_CAR.id).activeCarId).toBe(SEED_CAR.id);
  });
});

describe("eventsForCar ordering", () => {
  it("lists events reverse-chronologically, ties broken by odometer", () => {
    const state = applyEvent(
      seedState(),
      buildEvent({
        carId: SEED_CAR.id,
        type: "egyeb",
        date: "2026-05-30", // same day as seed-ev-10 (236 000 km)
        odometerKm: 236_050,
      }),
    );
    const events = eventsForCar(state, SEED_CAR.id);
    const dates = events.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(events[0].odometerKm).toBe(236_050);
    expect(events[1].odometerKm).toBe(236_000);
  });
});
