// New-event form validation (spec §2) — pure, unit-tested, no DOM/network.
// The dialog component feeds raw input strings in and renders the Hungarian
// field errors out; the server route re-validates independently.

import type { NewEventInput } from "@/lib/data/store";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/data/types";

export interface EventFormValues {
  type: string; // "" while unselected
  date: string; // yyyy-mm-dd from <input type="date">, "" when empty
  odometerKm: string; // raw input strings — parsing is part of validation
  costHuf: string;
  note: string;
}

export interface EventFormErrors {
  type?: string;
  date?: string;
  odometerKm?: string;
  costHuf?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

// Field-level validation per spec §2: type + date required; odometer
// required and positive. Cost is optional but must be a non-negative number
// when given. Returns an empty object when the form is valid.
export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};

  if (!(values.type in EVENT_TYPE_LABELS)) {
    errors.type = "Válassz eseménytípust.";
  }
  if (!ISO_DATE.test(values.date)) {
    errors.date = "Add meg a dátumot.";
  }
  const odometer = parseNumber(values.odometerKm);
  if (odometer === null || odometer <= 0) {
    errors.odometerKm = "Adj meg egy pozitív kilométeróra-állást.";
  }
  const cost = parseNumber(values.costHuf);
  if (values.costHuf.trim() !== "" && (cost === null || cost < 0)) {
    errors.costHuf = "A költség nem lehet negatív.";
  }

  return errors;
}

// Odometer-regression rule (spec §2, S6): zero tolerance — any reading
// strictly below the car's current known reading warns (but never blocks).
export function isOdometerRegression(
  odometerKm: number,
  currentKm: number,
): boolean {
  return odometerKm < currentKm;
}

// Convert validated form values into the store's NewEventInput. Call only
// after validateEventForm() returned no errors.
export function toNewEventInput(
  values: EventFormValues,
  carId: string,
): NewEventInput {
  const cost = parseNumber(values.costHuf);
  const note = values.note.trim();
  return {
    carId,
    type: values.type as EventType,
    date: values.date,
    odometerKm: parseNumber(values.odometerKm) as number,
    ...(cost !== null ? { costHuf: cost } : {}),
    ...(note ? { note } : {}),
  };
}
