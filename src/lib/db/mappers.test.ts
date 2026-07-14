import { describe, expect, it } from "vitest";

import { rowToCar, rowToEvent } from "./mappers";

describe("rowToCar", () => {
  it("maps snake_case columns and drops a null nickname", () => {
    const car = rowToCar({
      id: "c1",
      model_id: "vw-golf-vii-16-tdi",
      nickname: null,
      year: 2018,
      current_km: 89_000,
    });
    expect(car).toEqual({
      id: "c1",
      modelId: "vw-golf-vii-16-tdi",
      year: 2018,
      currentKm: 89_000,
    });
  });
});

describe("rowToEvent", () => {
  it("maps columns, keeps ISO text dates, drops null optionals", () => {
    const event = rowToEvent({
      id: "e1",
      car_id: "c1",
      type: "olajcsere",
      title: "Olajcsere",
      date: "2026-07-01",
      odometer_km: 89_500,
      cost_huf: null,
      note: null,
    });
    expect(event).toEqual({
      id: "e1",
      carId: "c1",
      type: "olajcsere",
      title: "Olajcsere",
      date: "2026-07-01",
      odometerKm: 89_500,
    });
  });

  it("tolerates driver-parsed Date values and keeps a real cost", () => {
    const event = rowToEvent({
      id: "e2",
      car_id: "c1",
      type: "szurocsere",
      title: "Pollenszűrő csere",
      date: new Date(Date.UTC(2026, 6, 10)),
      odometer_km: 90_000,
      cost_huf: 18_000,
      note: "csere",
    });
    expect(event.date).toBe("2026-07-10");
    expect(event.costHuf).toBe(18_000);
    expect(event.note).toBe("csere");
  });
});
