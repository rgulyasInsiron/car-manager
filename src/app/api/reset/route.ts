import { sql } from "@/lib/db/client";

// „Demo visszaállítása" (spec §2a): every row is user-added (the seed lives
// in code), so the reset empties both tables.
export async function POST() {
  const db = sql();
  await db`DELETE FROM service_events`;
  await db`DELETE FROM cars`;
  return Response.json({ ok: true });
}
