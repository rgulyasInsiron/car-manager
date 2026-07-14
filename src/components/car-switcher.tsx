"use client";

// Header car switcher (spec §1, T6): a Select over every known car; the
// dashboard renders it only when 2+ cars exist. Selecting a car calls back
// into the dashboard's state (setActiveCar), so every dashboard element
// recomputes for the selected car (S14).

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_CATALOG } from "@/lib/data/seed";
import type { Car } from "@/lib/data/types";

interface CarSwitcherProps {
  cars: Car[];
  activeCarId: string;
  onSelect: (carId: string) => void;
}

// Same display-name rule as the header title: nickname wins over the model
// name; the year keeps same-model cars distinguishable.
function carLabel(car: Car): string {
  const modelName =
    MODEL_CATALOG.find((m) => m.id === car.modelId)?.name ??
    "Ismeretlen modell";
  return `${car.nickname ?? modelName}, ${car.year}`;
}

export function CarSwitcher({ cars, activeCarId, onSelect }: CarSwitcherProps) {
  const labels = Object.fromEntries(cars.map((car) => [car.id, carLabel(car)]));
  return (
    <Select
      items={labels}
      value={activeCarId}
      onValueChange={(value) => {
        if (value) onSelect(value);
      }}
    >
      <SelectTrigger aria-label="Aktív autó kiválasztása">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {cars.map((car) => (
          <SelectItem key={car.id} value={car.id}>
            {labels[car.id]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
