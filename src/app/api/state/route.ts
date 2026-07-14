import { sql } from "@/lib/db/client";
import { rowToCar, rowToEvent } from "@/lib/db/mappers";

// User-added cars and events (the seed lives in code, not in the database).
export async function GET() {
  const db = sql();
  const [cars, events] = await Promise.all([
    db`SELECT id, model_id, nickname, year, current_km
       FROM cars ORDER BY created_at`,
    db`SELECT id, car_id, type, title, date::text AS date, odometer_km,
              cost_huf, note
       FROM service_events ORDER BY date, odometer_km`,
  ]);
  return Response.json({
    userCars: cars.map(rowToCar),
    userEvents: events.map(rowToEvent),
  });
}
