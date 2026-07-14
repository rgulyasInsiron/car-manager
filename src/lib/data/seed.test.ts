import { describe, expect, it } from "vitest";

import {
  GENERIC_INTERVALS,
  intervalsForModel,
  MODEL_CATALOG,
  SEED_CAR,
  SEED_EVENTS,
} from "./seed";
import { EVENT_TYPE_LABELS } from "./types";

describe("seed consistency (spec §4)", () => {
  it("ships ~10 events, all belonging to the seed car", () => {
    expect(SEED_EVENTS).toHaveLength(10);
    expect(SEED_EVENTS.every((e) => e.carId === SEED_CAR.id)).toBe(true);
  });

  it("uses ISO dates and titles matching the type labels", () => {
    for (const event of SEED_EVENTS) {
      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.title).toBe(EVENT_TYPE_LABELS[event.type]);
    }
  });

  it("keeps every event odometer at or below the car's current reading", () => {
    const max = Math.max(...SEED_EVENTS.map((e) => e.odometerKm));
    expect(max).toBeLessThanOrEqual(SEED_CAR.currentKm);
  });

  it("odometer readings are non-decreasing in date order", () => {
    const sorted = [...SEED_EVENTS].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].odometerKm).toBeGreaterThanOrEqual(
        sorted[i - 1].odometerKm,
      );
    }
  });

  it("covers the event types required by the spec", () => {
    const types = new Set(SEED_EVENTS.map((e) => e.type));
    for (const required of [
      "olajcsere",
      "szurocsere",
      "fekbetet",
      "fekfolyadek",
      "vezerles",
      "muszaki_vizsga",
    ] as const) {
      expect(types.has(required)).toBe(true);
    }
    // Timing belt at 175 000 km (spec §3 example).
    const timing = SEED_EVENTS.find((e) => e.type === "vezerles");
    expect(timing?.odometerKm).toBe(175_000);
  });
});

describe("model catalog (spec §2a)", () => {
  it("offers ~8-10 models with unique ids and the seed car's model", () => {
    expect(MODEL_CATALOG.length).toBeGreaterThanOrEqual(8);
    expect(MODEL_CATALOG.length).toBeLessThanOrEqual(10);
    const ids = MODEL_CATALOG.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(SEED_CAR.modelId);
  });

  it("resolves the demo car's own table and falls back to the generic one", () => {
    const octavia = intervalsForModel(SEED_CAR.modelId);
    expect(octavia.find((i) => i.type === "olajcsere")?.everyKm).toBe(10_000);
    expect(octavia.every((i) => i.source)).toBe(true);

    expect(intervalsForModel("vw-golf-vii-16-tdi")).toBe(GENERIC_INTERVALS);
    expect(intervalsForModel("unknown-model")).toBe(GENERIC_INTERVALS);
  });

  it("records the demo car's fixed service regime", () => {
    const model = MODEL_CATALOG.find((m) => m.id === SEED_CAR.modelId);
    expect(model?.regime).toBe("fixed");
  });
});
