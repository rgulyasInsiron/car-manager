// Pure row ↔ model mappers (unit-testable without a database).

import type { Car, EventType, ServiceEvent } from "@/lib/data/types";

type Row = Record<string, unknown>;

export function rowToCar(row: Row): Car {
  return {
    id: String(row.id),
    modelId: String(row.model_id),
    year: Number(row.year),
    currentKm: Number(row.current_km),
    ...(row.nickname ? { nickname: String(row.nickname) } : {}),
  };
}

export function rowToEvent(row: Row): ServiceEvent {
  // `date` arrives as text (the queries cast `date::text`), but tolerate a
  // driver-parsed Date as well.
  const date =
    row.date instanceof Date
      ? row.date.toISOString().slice(0, 10)
      : String(row.date);
  return {
    id: String(row.id),
    carId: String(row.car_id),
    type: String(row.type) as EventType,
    title: String(row.title),
    date,
    odometerKm: Number(row.odometer_km),
    ...(row.cost_huf !== null && row.cost_huf !== undefined
      ? { costHuf: Number(row.cost_huf) }
      : {}),
    ...(row.note ? { note: String(row.note) } : {}),
  };
}
