import { describe, expect, it } from "vitest";

import {
  toNewCarInput,
  validateCarForm,
  type CarFormValues,
} from "./car-form";

const CURRENT_YEAR = 2026;

function values(overrides: Partial<CarFormValues> = {}): CarFormValues {
  return {
    modelId: "vw-golf-vii-16-tdi",
    year: "2018",
    currentKm: "89000",
    nickname: "",
    ...overrides,
  };
}

describe("validateCarForm", () => {
  it("accepts a fully valid form", () => {
    expect(validateCarForm(values(), CURRENT_YEAR)).toEqual({});
  });

  it("accepts an optional nickname", () => {
    expect(
      validateCarForm(values({ nickname: "Családi Golf" }), CURRENT_YEAR),
    ).toEqual({});
  });

  // S13 — the model must come from the seeded catalog.
  it("requires a catalog model", () => {
    expect(validateCarForm(values({ modelId: "" }), CURRENT_YEAR).modelId).toBeTruthy();
    expect(
      validateCarForm(values({ modelId: "trabant-601" }), CURRENT_YEAR).modelId,
    ).toBeTruthy();
  });

  // Spec §2a — sane year range 1980–current year, inclusive on both ends.
  it("requires a year between 1980 and the current year", () => {
    expect(validateCarForm(values({ year: "" }), CURRENT_YEAR).year).toBeTruthy();
    expect(validateCarForm(values({ year: "1979" }), CURRENT_YEAR).year).toBeTruthy();
    expect(validateCarForm(values({ year: "2027" }), CURRENT_YEAR).year).toBeTruthy();
    expect(validateCarForm(values({ year: "abc" }), CURRENT_YEAR).year).toBeTruthy();
    expect(validateCarForm(values({ year: "2018.5" }), CURRENT_YEAR).year).toBeTruthy();
    expect(validateCarForm(values({ year: "1980" }), CURRENT_YEAR).year).toBeUndefined();
    expect(
      validateCarForm(values({ year: String(CURRENT_YEAR) }), CURRENT_YEAR).year,
    ).toBeUndefined();
  });

  it("requires a positive odometer", () => {
    expect(validateCarForm(values({ currentKm: "" }), CURRENT_YEAR).currentKm).toBeTruthy();
    expect(validateCarForm(values({ currentKm: "0" }), CURRENT_YEAR).currentKm).toBeTruthy();
    expect(validateCarForm(values({ currentKm: "-5" }), CURRENT_YEAR).currentKm).toBeTruthy();
    expect(validateCarForm(values({ currentKm: "abc" }), CURRENT_YEAR).currentKm).toBeTruthy();
  });

  it("collects every field error at once", () => {
    const errors = validateCarForm(
      values({ modelId: "", year: "", currentKm: "" }),
      CURRENT_YEAR,
    );
    expect(errors.modelId).toBeTruthy();
    expect(errors.year).toBeTruthy();
    expect(errors.currentKm).toBeTruthy();
  });
});

describe("toNewCarInput", () => {
  it("maps a full form to NewCarInput", () => {
    expect(toNewCarInput(values({ nickname: " Családi Golf " }))).toEqual({
      modelId: "vw-golf-vii-16-tdi",
      year: 2018,
      currentKm: 89_000,
      nickname: "Családi Golf",
    });
  });

  it("omits an empty nickname", () => {
    const input = toNewCarInput(values());
    expect(input).toEqual({
      modelId: "vw-golf-vii-16-tdi",
      year: 2018,
      currentKm: 89_000,
    });
    expect("nickname" in input).toBe(false);
  });
});
