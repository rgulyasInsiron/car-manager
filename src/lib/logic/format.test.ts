import { describe, expect, it } from "vitest";

import { formatDateHu, todayIsoLocal } from "./format";

describe("formatDateHu", () => {
  it("renders an ISO date as a dotted hu-HU date", () => {
    expect(formatDateHu("2026-07-14")).toBe("2026.07.14");
  });

  it("keeps leading zeros", () => {
    expect(formatDateHu("2024-01-05")).toBe("2024.01.05");
  });
});

describe("todayIsoLocal", () => {
  it("derives yyyy-mm-dd from the local calendar date", () => {
    // Date(y, m, d, h) constructs in LOCAL time — no clock or TZ reads here.
    expect(todayIsoLocal(new Date(2026, 6, 14, 12, 0, 0))).toBe("2026-07-14");
  });

  it("zero-pads single-digit month and day", () => {
    expect(todayIsoLocal(new Date(2024, 0, 5, 9, 30, 0))).toBe("2024-01-05");
  });

  it("keeps the local date just after local midnight (UTC would be yesterday)", () => {
    // 2026-07-14 00:30 local. In any zone ahead of UTC (e.g. CEST, UTC+2)
    // toISOString() would still say 2026-07-13; the local getters must not.
    expect(todayIsoLocal(new Date(2026, 6, 14, 0, 30, 0))).toBe("2026-07-14");
  });

  it("keeps the local date just before local midnight", () => {
    expect(todayIsoLocal(new Date(2026, 11, 31, 23, 59, 59))).toBe("2026-12-31");
  });
});
