import { describe, expect, it } from "vitest";

import { intervalsForModel, SEED_CAR, SEED_EVENTS } from "@/lib/data/seed";
import type { ServiceEvent, ServiceInterval } from "@/lib/data/types";
import { computeItemStatuses, topStatusCards } from "./status";

const TODAY = "2026-07-14"; // the seed's reference date (S2)
const OCTAVIA = intervalsForModel(SEED_CAR.modelId);

function statusOf(type: string) {
  const statuses = computeItemStatuses(
    SEED_EVENTS,
    OCTAVIA,
    SEED_CAR.currentKm,
    TODAY,
  );
  const found = statuses.find((s) => s.type === type);
  if (!found) throw new Error(`no status for ${type}`);
  return found;
}

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

describe("computeItemStatuses on the seed (S2)", () => {
  it("oil is green with the next change at 245 000 km", () => {
    const oil = statusOf("olajcsere");
    expect(oil.severity).toBe("ok");
    expect(oil.remainingKm).toBe(8_600);
    expect(oil.detail).toBe("Következő csere: 245 000 km");
  });

  it("pollen filter is yellow at ~1 500 km remaining", () => {
    const pollen = statusOf("szurocsere");
    expect(pollen.severity).toBe("due-soon");
    expect(pollen.remainingKm).toBe(1_500);
    expect(pollen.detail).toBe("Kb. 1 500 km múlva");
  });

  it("inspection is red at 34 days remaining", () => {
    const inspection = statusOf("muszaki_vizsga");
    expect(inspection.severity).toBe("urgent");
    expect(inspection.remainingDays).toBe(34);
    expect(inspection.detail).toBe("34 nap múlva");
  });

  it("timing belt is tracked without a fabricated due date", () => {
    const timing = statusOf("vezerles");
    expect(timing.severity).toBe("unknown");
    expect(timing.remainingKm).toBeUndefined();
    expect(timing.remainingDays).toBeUndefined();
    expect(timing.detail).toBe("Utoljára: 175 000 km");
  });
});

describe("topStatusCards (S2 card set)", () => {
  it("picks the 3 most urgent items: inspection, pollen filter, oil", () => {
    const statuses = computeItemStatuses(
      SEED_EVENTS,
      OCTAVIA,
      SEED_CAR.currentKm,
      TODAY,
    );
    const cards = topStatusCards(statuses);
    expect(cards.map((c) => c.name)).toEqual([
      "Műszaki vizsga",
      "Pollenszűrő",
      "Motorolaj",
    ]);
  });
});

describe("threshold boundaries (spec §1)", () => {
  const kmInterval: ServiceInterval[] = [{ type: "olajcsere", everyKm: 10_000 }];

  function kmStatus(currentKm: number) {
    const events = [mkEvent({ odometerKm: 100_000 })];
    return computeItemStatuses(events, kmInterval, currentKm, TODAY)[0];
  }

  it("km: > 3 000 green, ≤ 3 000 yellow, ≤ 500 red, overdue red", () => {
    expect(kmStatus(106_999).severity).toBe("ok"); // 3 001 remaining
    expect(kmStatus(107_000).severity).toBe("due-soon"); // 3 000
    expect(kmStatus(109_499).severity).toBe("due-soon"); // 501
    expect(kmStatus(109_500).severity).toBe("urgent"); // 500
    expect(kmStatus(110_500).severity).toBe("urgent"); // -500, overdue
    expect(kmStatus(110_500).detail).toBe("Késésben: 500 km");
  });

  const daysInterval: ServiceInterval[] = [
    { type: "muszaki_vizsga", everyDays: 100 },
  ];

  function daysStatus(eventDate: string) {
    const events = [mkEvent({ type: "muszaki_vizsga", date: eventDate })];
    return computeItemStatuses(events, daysInterval, 100_000, TODAY)[0];
  }

  it("days: > 60 green, ≤ 60 yellow, ≤ 45 red, overdue red", () => {
    expect(daysStatus("2026-06-05").severity).toBe("ok"); // 61 remaining
    expect(daysStatus("2026-06-04").severity).toBe("due-soon"); // 60
    expect(daysStatus("2026-05-21").severity).toBe("due-soon"); // 46
    expect(daysStatus("2026-05-20").severity).toBe("urgent"); // 45
    expect(daysStatus("2026-01-01").severity).toBe("urgent"); // overdue -94
    expect(daysStatus("2026-01-01").detail).toBe("Lejárt 94 napja");
  });

  it("worst of the two dimensions wins for km+days items", () => {
    const both: ServiceInterval[] = [
      { type: "olajcsere", everyKm: 10_000, everyDays: 50 },
    ];
    // km comfortable (9 000 remaining) but time overdue.
    const events = [mkEvent({ date: "2026-01-01", odometerKm: 100_000 })];
    const status = computeItemStatuses(events, both, 101_000, TODAY)[0];
    expect(status.severity).toBe("urgent");
    expect(status.detail).toBe("Lejárt 144 napja");
  });

  it("no history yields unknown with no due data (S9)", () => {
    const status = computeItemStatuses([], kmInterval, 100_000, TODAY)[0];
    expect(status.severity).toBe("unknown");
    expect(status.detail).toBe("Nincs adat");
  });
});
