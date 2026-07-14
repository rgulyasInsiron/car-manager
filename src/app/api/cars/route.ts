import { MODEL_CATALOG } from "@/lib/data/seed";
import { buildCar, type NewCarInput } from "@/lib/data/store";
import { sql } from "@/lib/db/client";

const CURRENT_YEAR = 2100; // sanity ceiling; the form enforces the real range

function parseInput(body: unknown): NewCarInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.modelId !== "string" ||
    !MODEL_CATALOG.some((m) => m.id === b.modelId) ||
    typeof b.year !== "number" ||
    b.year < 1980 ||
    b.year > CURRENT_YEAR ||
    typeof b.currentKm !== "number" ||
    b.currentKm <= 0
  ) {
    return null;
  }
  return {
    modelId: b.modelId,
    year: b.year,
    currentKm: b.currentKm,
    ...(typeof b.nickname === "string" && b.nickname
      ? { nickname: b.nickname }
      : {}),
  };
}

export async function POST(request: Request) {
  const input = parseInput(await request.json().catch(() => null));
  if (!input) {
    return Response.json({ error: "invalid car input" }, { status: 400 });
  }
  const car = buildCar(input);
  await sql()`
    INSERT INTO cars (id, model_id, nickname, year, current_km)
    VALUES (${car.id}, ${car.modelId}, ${car.nickname ?? null}, ${car.year},
            ${car.currentKm})`;
  return Response.json(car, { status: 201 });
}
