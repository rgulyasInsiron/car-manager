// Thin browser-side client for the /api persistence routes (Neon-backed).
// Deliberately untested by unit tests — no network in tests (plan §7); the
// pure logic it feeds lives in store.ts.

import {
  mergeUserData,
  type NewCarInput,
  type NewEventInput,
  type StoreState,
  type UserData,
} from "./store";
import type { Car, ServiceEvent } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchState(activeCarId?: string): Promise<StoreState> {
  const data = await request<UserData>("/api/state");
  return mergeUserData(data, activeCarId);
}

export async function createEvent(input: NewEventInput): Promise<ServiceEvent> {
  return request<ServiceEvent>("/api/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createCar(input: NewCarInput): Promise<Car> {
  return request<Car>("/api/cars", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// „Demo visszaállítása": deletes every user-added row; the seed remains.
export async function resetDemo(): Promise<void> {
  await request<{ ok: boolean }>("/api/reset", { method: "POST" });
}
