"use client";

// Add-car dialog (spec §2a, T6): the header's „Új autó" action opens a form
// for a new car from the seeded model catalog. Validation lives in the pure
// module src/lib/logic/car-form.ts; persistence goes through createCar() and
// the parent applies the saved car to client state, which also activates it
// (applyCar — S13).

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCar } from "@/lib/data/api-client";
import { MODEL_CATALOG } from "@/lib/data/seed";
import type { Car } from "@/lib/data/types";
import {
  MIN_CAR_YEAR,
  toNewCarInput,
  validateCarForm,
  type CarFormErrors,
  type CarFormValues,
} from "@/lib/logic/car-form";

interface CarFormDialogProps {
  currentYear: number; // explicit input, mirrors the dashboard's todayIso
  onSaved: (car: Car) => void;
}

const MODEL_LABELS = Object.fromEntries(
  MODEL_CATALOG.map((m) => [m.id, m.name]),
);

function emptyForm(): CarFormValues {
  return { modelId: "", year: "", currentKm: "", nickname: "" };
}

export function CarFormDialog({ currentYear, onSaved }: CarFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CarFormValues>(emptyForm);
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  function update(patch: Partial<CarFormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validateCarForm(form, currentYear);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return; // nothing is saved

    setSaving(true);
    setSaveError(false);
    try {
      const car = await createCar(toNewCarInput(form));
      onSaved(car);
      toast.success("Autó hozzáadva.");
      setForm(emptyForm());
      setErrors({});
      setOpen(false);
    } catch {
      // Keep the dialog open with the entered values — no data loss.
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSaveError(false);
      }}
    >
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <Plus className="size-4" aria-hidden />
        Új autó
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Új autó</DialogTitle>
          <DialogDescription>
            Vegyél fel egy autót a modellkatalógusból — mentés után ez lesz az
            aktív autó.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="car-model">Modell</Label>
            <Select
              items={MODEL_LABELS}
              value={form.modelId || null}
              onValueChange={(value) => update({ modelId: value ?? "" })}
            >
              <SelectTrigger
                id="car-model"
                className="w-full"
                aria-invalid={errors.modelId ? true : undefined}
              >
                <SelectValue placeholder="Válassz modellt" />
              </SelectTrigger>
              <SelectContent>
                {MODEL_CATALOG.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modelId && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.modelId}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="car-year">Évjárat</Label>
            <Input
              id="car-year"
              type="number"
              inputMode="numeric"
              min={MIN_CAR_YEAR}
              max={currentYear}
              placeholder={`pl. ${currentYear - 8}`}
              value={form.year}
              onChange={(e) => update({ year: e.target.value })}
              aria-invalid={errors.year ? true : undefined}
            />
            {errors.year && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.year}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="car-odometer">Kilométeróra-állás</Label>
            <Input
              id="car-odometer"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="pl. 89000"
              value={form.currentKm}
              onChange={(e) => update({ currentKm: e.target.value })}
              aria-invalid={errors.currentKm ? true : undefined}
            />
            {errors.currentKm && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.currentKm}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="car-nickname">Becenév (nem kötelező)</Label>
            <Input
              id="car-nickname"
              type="text"
              placeholder="pl. Családi kombi"
              value={form.nickname}
              onChange={(e) => update({ nickname: e.target.value })}
            />
          </div>

          {saveError && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400"
            >
              A mentés nem sikerült. A megadott adatok megmaradtak — próbáld
              újra.
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Mégse
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Mentés…" : "Mentés"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
