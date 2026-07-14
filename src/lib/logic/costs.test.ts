import { describe, expect, it } from "vitest";

import { SEED_EVENTS } from "@/lib/data/seed";
import type { ServiceEvent } from "@/lib/data/types";
import { costTotals } from "./costs";
import { formatHuf } from "./format";

const TODAY = "2026-07-14";

describe("costTotals (S16)", () => {
  it("sums the seed's costs for the current year and all time", () => {
    const totals = costTotals(SEED_EVENTS, TODAY);
    expect(totals.allTime).toBe(531_000);
    expect(totals.currentYear).toBe(60_000); // 2026: 45 000 + 15 000
  });

  it("excludes events without a cost", () => {
    const noCost: ServiceEvent = {
      id: "t-1",
      carId: "car-1",
      type: "egyeb",
      title: "Egyéb szerviz",
      date: "2026-07-01",
      odometerKm: 236_200,
    };
    const totals = costTotals([...SEED_EVENTS, noCost], TODAY);
    expect(totals).toEqual(costTotals(SEED_EVENTS, TODAY));
  });

  it("is empty for a car with no events", () => {
    expect(costTotals([], TODAY)).toEqual({ currentYear: 0, allTime: 0 });
  });
});

describe("formatHuf (hu-HU grouping)", () => {
  it("formats with non-breaking-space grouping and the Ft suffix", () => {
    expect(formatHuf(45_000)).toBe("45 000 Ft");
    expect(formatHuf(531_000)).toBe("531 000 Ft");
    expect(formatHuf(950)).toBe("950 Ft");
  });
});
