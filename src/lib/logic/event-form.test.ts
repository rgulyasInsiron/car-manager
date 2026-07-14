import { describe, expect, it } from "vitest";

import {
  isOdometerRegression,
  toNewEventInput,
  validateEventForm,
  type EventFormValues,
} from "./event-form";

function values(overrides: Partial<EventFormValues> = {}): EventFormValues {
  return {
    type: "olajcsere",
    date: "2026-07-14",
    odometerKm: "236500",
    costHuf: "",
    note: "",
    ...overrides,
  };
}

describe("validateEventForm", () => {
  it("accepts a fully valid form", () => {
    expect(validateEventForm(values())).toEqual({});
  });

  it("accepts optional cost and note", () => {
    expect(
      validateEventForm(values({ costHuf: "45000", note: "olaj + szűrő" })),
    ).toEqual({});
  });

  // S5 — missing type and date produce field-level errors.
  it("requires a known event type", () => {
    expect(validateEventForm(values({ type: "" })).type).toBeTruthy();
    expect(validateEventForm(values({ type: "nem-tipus" })).type).toBeTruthy();
  });

  it("requires an ISO date", () => {
    expect(validateEventForm(values({ date: "" })).date).toBeTruthy();
    expect(validateEventForm(values({ date: "2026.07.14" })).date).toBeTruthy();
  });

  it("collects both errors when type and date are missing", () => {
    const errors = validateEventForm(values({ type: "", date: "" }));
    expect(errors.type).toBeTruthy();
    expect(errors.date).toBeTruthy();
    expect(errors.odometerKm).toBeUndefined();
  });

  it("requires a positive odometer", () => {
    expect(validateEventForm(values({ odometerKm: "" })).odometerKm).toBeTruthy();
    expect(validateEventForm(values({ odometerKm: "0" })).odometerKm).toBeTruthy();
    expect(validateEventForm(values({ odometerKm: "-5" })).odometerKm).toBeTruthy();
    expect(validateEventForm(values({ odometerKm: "abc" })).odometerKm).toBeTruthy();
  });

  it("rejects a negative or malformed cost, allows empty and zero", () => {
    expect(validateEventForm(values({ costHuf: "-1" })).costHuf).toBeTruthy();
    expect(validateEventForm(values({ costHuf: "abc" })).costHuf).toBeTruthy();
    expect(validateEventForm(values({ costHuf: "" })).costHuf).toBeUndefined();
    expect(validateEventForm(values({ costHuf: "0" })).costHuf).toBeUndefined();
  });
});

describe("isOdometerRegression", () => {
  // S6 — zero tolerance: anything strictly below the current reading warns.
  it("flags any reading below the current km", () => {
    expect(isOdometerRegression(230_000, 236_400)).toBe(true);
    expect(isOdometerRegression(236_399, 236_400)).toBe(true);
  });

  it("does not flag equal or higher readings", () => {
    expect(isOdometerRegression(236_400, 236_400)).toBe(false);
    expect(isOdometerRegression(236_500, 236_400)).toBe(false);
  });
});

describe("toNewEventInput", () => {
  it("maps a full form to NewEventInput", () => {
    expect(
      toNewEventInput(
        values({ costHuf: "45000", note: " olaj + szűrő " }),
        "car-1",
      ),
    ).toEqual({
      carId: "car-1",
      type: "olajcsere",
      date: "2026-07-14",
      odometerKm: 236_500,
      costHuf: 45_000,
      note: "olaj + szűrő",
    });
  });

  it("omits empty optional fields", () => {
    const input = toNewEventInput(values(), "car-1");
    expect(input).toEqual({
      carId: "car-1",
      type: "olajcsere",
      date: "2026-07-14",
      odometerKm: 236_500,
    });
    expect("costHuf" in input).toBe(false);
    expect("note" in input).toBe(false);
  });
});
