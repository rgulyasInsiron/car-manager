import { describe, expect, it } from "vitest";

import { intervalsForModel, SEED_CAR, SEED_EVENTS } from "@/lib/data/seed";
import type { ServiceEvent } from "@/lib/data/types";
import { buildSuggestions, estimateDailyKm } from "./suggestions";

const TODAY = "2026-07-14";
const OCTAVIA = intervalsForModel(SEED_CAR.modelId);

function mkEvent(overrides: Partial<ServiceEvent>): ServiceEvent {
  return {
    id: "t-1",
    carId: "car-1",
    type: "olajcsere",
    title: "Olajcsere",
    date: "2026-01-01",
    odometerKm: 100_000,
    ...overrides,
  };
}

describe("buildSuggestions on the seed (S7)", () => {
  const suggestions = buildSuggestions(
    SEED_EVENTS,
    OCTAVIA,
    SEED_CAR.currentKm,
    TODAY,
  );

  it("produces at most 5 recommendations, most urgent first", () => {
    expect(suggestions.length).toBeLessThanOrEqual(5);
    expect(suggestions[0].type).toBe("muszaki_vizsga");
    expect(suggestions[0].text).toBe("A műszaki vizsga 34 nap múlva esedékes.");
  });

  it("grounds the oil recommendation in the history (~8 600 km)", () => {
    const oil = suggestions.find((s) => s.type === "olajcsere");
    expect(oil?.text).toContain("kb. 8 600 km múlva");
    expect(oil?.text).toMatch(/^A motorolaj cseréje várhatóan/);
  });

  it("gives the timing belt the careful manufacturer hint", () => {
    const timing = suggestions.find((s) => s.type === "vezerles");
    expect(timing?.text).toBe(
      "A vezérlés utoljára 175 000 km-nél volt cserélve. Érdemes ellenőrizni a gyártó által ajánlott csereintervallumot.",
    );
  });

  it("phrases everything as advice — no diagnosis vocabulary", () => {
    for (const s of suggestions) {
      expect(s.text).not.toMatch(/hiba|meghibásod|rossz|veszélyes/i);
    }
  });
});

describe("date estimate (S17)", () => {
  it("appends an approximate month to km-based items on the seed", () => {
    const suggestions = buildSuggestions(
      SEED_EVENTS,
      OCTAVIA,
      SEED_CAR.currentKm,
      TODAY,
    );
    const oil = suggestions.find((s) => s.type === "olajcsere");
    expect(oil?.text).toContain("(várhatóan 2026. december körül)");
  });

  it("omits the estimate when the history cannot support one", () => {
    // Single reading → no daily-km estimate.
    const events = [mkEvent({ date: "2026-06-01", odometerKm: 100_000 })];
    const suggestions = buildSuggestions(
      events,
      [{ type: "olajcsere", everyKm: 10_000 }],
      101_000,
      TODAY,
    );
    expect(suggestions[0].text).not.toContain("körül");
  });
});

describe("estimateDailyKm guards (spec §3)", () => {
  it("needs at least two readings", () => {
    expect(estimateDailyKm([])).toBeNull();
    expect(estimateDailyKm([mkEvent({})])).toBeNull();
  });

  it("needs at least 30 days of span", () => {
    const events = [
      mkEvent({ id: "a", date: "2026-06-01", odometerKm: 100_000 }),
      mkEvent({ id: "b", date: "2026-06-30", odometerKm: 102_000 }),
    ];
    expect(estimateDailyKm(events)).toBeNull(); // 29 days
    const wide = [
      mkEvent({ id: "a", date: "2026-06-01", odometerKm: 100_000 }),
      mkEvent({ id: "b", date: "2026-07-01", odometerKm: 102_000 }),
    ];
    expect(estimateDailyKm(wide)).toBeCloseTo(2_000 / 30);
  });

  it("needs a positive km delta", () => {
    const events = [
      mkEvent({ id: "a", date: "2026-01-01", odometerKm: 100_000 }),
      mkEvent({ id: "b", date: "2026-06-01", odometerKm: 100_000 }),
    ];
    expect(estimateDailyKm(events)).toBeNull();
  });
});

describe("no-history hints (S9)", () => {
  it("every tracked item gets a careful hint instead of a due date", () => {
    const suggestions = buildSuggestions([], OCTAVIA, 45_000, TODAY);
    expect(suggestions).toHaveLength(5);
    for (const s of suggestions) {
      expect(s.severity).toBe("unknown");
      expect(s.text).toContain("Érdemes ellenőrizni");
      expect(s.text).not.toMatch(/\d+\s?km múlva|\d+ nap múlva/);
    }
  });
});
