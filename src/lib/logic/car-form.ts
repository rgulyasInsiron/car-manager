// Add-car form validation (spec §2a) — pure, unit-tested, no DOM/network.
// The dialog component feeds raw input strings in and renders the Hungarian
// field errors out; the server route (/api/cars) re-validates independently.
// The current year is an explicit input to stay deterministic (S10 style).

import { MODEL_CATALOG } from "@/lib/data/seed";
import type { NewCarInput } from "@/lib/data/store";

export const MIN_CAR_YEAR = 1980;

export interface CarFormValues {
  modelId: string; // "" while unselected
  year: string; // raw input strings — parsing is part of validation
  currentKm: string;
  nickname: string;
}

export interface CarFormErrors {
  modelId?: string;
  year?: string;
  currentKm?: string;
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

// Field-level validation per spec §2a: model from the seeded catalog,
// year an integer in the sane 1980–current-year range, odometer required
// and positive. Nickname is optional free text — never invalid.
// Returns an empty object when the form is valid.
export function validateCarForm(
  values: CarFormValues,
  currentYear: number,
): CarFormErrors {
  const errors: CarFormErrors = {};

  if (!MODEL_CATALOG.some((m) => m.id === values.modelId)) {
    errors.modelId = "Válassz modellt.";
  }
  const year = parseNumber(values.year);
  if (
    year === null ||
    !Number.isInteger(year) ||
    year < MIN_CAR_YEAR ||
    year > currentYear
  ) {
    errors.year = `Adj meg egy évjáratot ${MIN_CAR_YEAR} és ${currentYear} között.`;
  }
  const km = parseNumber(values.currentKm);
  if (km === null || km <= 0) {
    errors.currentKm = "Adj meg egy pozitív kilométeróra-állást.";
  }

  return errors;
}

// Convert validated form values into the store's NewCarInput. Call only
// after validateCarForm() returned no errors.
export function toNewCarInput(values: CarFormValues): NewCarInput {
  const nickname = values.nickname.trim();
  return {
    modelId: values.modelId,
    year: parseNumber(values.year) as number,
    currentKm: parseNumber(values.currentKm) as number,
    ...(nickname ? { nickname } : {}),
  };
}
