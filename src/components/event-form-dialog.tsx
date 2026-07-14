"use client";

// New-event dialog (spec §2, T4): the FAB opens a form for the ACTIVE car.
// Validation + the odometer-regression warning rule live in the pure module
// src/lib/logic/event-form.ts; persistence goes through createEvent() and the
// parent applies the saved event to client state (everything recomputes from
// state — S4, S8).

import { Plus, TriangleAlert } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/lib/data/api-client";
import { EVENT_TYPE_LABELS } from "@/lib/data/types";
import type { ServiceEvent } from "@/lib/data/types";
import {
  isOdometerRegression,
  toNewEventInput,
  validateEventForm,
  type EventFormErrors,
  type EventFormValues,
} from "@/lib/logic/event-form";
import { formatKm } from "@/lib/logic/format";

interface EventFormDialogProps {
  carId: string;
  currentKm: number;
  todayIso: string;
  onSaved: (event: ServiceEvent) => void;
}

function emptyForm(todayIso: string): EventFormValues {
  return { type: "", date: todayIso, odometerKm: "", costHuf: "", note: "" };
}

export function EventFormDialog({
  carId,
  currentKm,
  todayIso,
  onSaved,
}: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventFormValues>(() => emptyForm(todayIso));
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Zero-tolerance regression warning (S6): visible as soon as a valid
  // reading below the current known km is entered — warn, never block. The
  // submit button relabels to make saving an explicit confirmation.
  const odometer = Number(form.odometerKm.trim());
  const regression =
    form.odometerKm.trim() !== "" &&
    Number.isFinite(odometer) &&
    odometer > 0 &&
    isOdometerRegression(odometer, currentKm);

  function update(patch: Partial<EventFormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validateEventForm(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return; // S5: nothing is saved

    setSaving(true);
    setSaveError(false);
    try {
      const event = await createEvent(toNewEventInput(form, carId));
      onSaved(event);
      toast.success("Esemény mentve.");
      setForm(emptyForm(todayIso));
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
      <DialogTrigger
        render={
          <Button
            type="button"
            aria-label="Új esemény rögzítése"
            title="Új esemény rögzítése"
            className="fixed right-6 bottom-6 size-14 rounded-full shadow-lg"
          />
        }
      >
        <Plus className="size-6" aria-hidden />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Új esemény</DialogTitle>
          <DialogDescription>
            Rögzíts egy szervizeseményt az aktív autóhoz.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-type">Esemény típusa</Label>
            <Select
              items={EVENT_TYPE_LABELS}
              value={form.type || null}
              onValueChange={(value) => update({ type: value ?? "" })}
            >
              <SelectTrigger
                id="event-type"
                className="w-full"
                aria-invalid={errors.type ? true : undefined}
              >
                <SelectValue placeholder="Válassz típust" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.type}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-date">Dátum</Label>
            <Input
              id="event-date"
              type="date"
              value={form.date}
              onChange={(e) => update({ date: e.target.value })}
              aria-invalid={errors.date ? true : undefined}
            />
            {errors.date && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.date}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-odometer">Kilométer</Label>
            <Input
              id="event-odometer"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder={`pl. ${currentKm}`}
              value={form.odometerKm}
              onChange={(e) => update({ odometerKm: e.target.value })}
              aria-invalid={errors.odometerKm ? true : undefined}
            />
            {errors.odometerKm && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.odometerKm}
              </p>
            )}
            {regression && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  A megadott érték alacsonyabb a jelenlegi óraállásnál (
                  {formatKm(currentKm)}). Régebbi esemény pótlásához így is
                  elmentheted.
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-cost">Költség (Ft, nem kötelező)</Label>
            <Input
              id="event-cost"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="pl. 45000"
              value={form.costHuf}
              onChange={(e) => update({ costHuf: e.target.value })}
              aria-invalid={errors.costHuf ? true : undefined}
            />
            {errors.costHuf && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.costHuf}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-note">Megjegyzés (nem kötelező)</Label>
            <Textarea
              id="event-note"
              rows={3}
              value={form.note}
              onChange={(e) => update({ note: e.target.value })}
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
              {saving
                ? "Mentés…"
                : regression
                  ? "Mentés mindenképp"
                  : "Mentés"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
