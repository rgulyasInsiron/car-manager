import { describe, expect, it } from "vitest";

import { formatDateHu } from "./format";

describe("formatDateHu", () => {
  it("renders an ISO date as a dotted hu-HU date", () => {
    expect(formatDateHu("2026-07-14")).toBe("2026.07.14");
  });

  it("keeps leading zeros", () => {
    expect(formatDateHu("2024-01-05")).toBe("2024.01.05");
  });
});
