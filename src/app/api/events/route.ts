import { buildEvent, type NewEventInput } from "@/lib/data/store";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/data/types";
import { sql } from "@/lib/db/client";

function parseInput(body: unknown): NewEventInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.carId !== "string" ||
    typeof b.type !== "string" ||
    !(b.type in EVENT_TYPE_LABELS) ||
    typeof b.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
    typeof b.odometerKm !== "number" ||
    b.odometerKm <= 0
  ) {
    return null;
  }
  return {
    carId: b.carId,
    type: b.type as EventType,
    date: b.date,
    odometerKm: b.odometerKm,
    ...(typeof b.costHuf === "number" ? { costHuf: b.costHuf } : {}),
    ...(typeof b.note === "string" && b.note ? { note: b.note } : {}),
  };
}

export async function POST(request: Request) {
  const input = parseInput(await request.json().catch(() => null));
  if (!input) {
    return Response.json({ error: "invalid event input" }, { status: 400 });
  }
  const event = buildEvent(input);
  await sql()`
    INSERT INTO service_events (id, car_id, type, title, date, odometer_km, cost_huf, note)
    VALUES (${event.id}, ${event.carId}, ${event.type}, ${event.title},
            ${event.date}, ${event.odometerKm}, ${event.costHuf ?? null},
            ${event.note ?? null})`;
  return Response.json(event, { status: 201 });
}
