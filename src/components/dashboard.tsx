"use client";

// Dashboard (spec §1): car header, top-3 status cards, suggestions, cost
// summary, timeline, FAB. Client component: it loads the persisted user
// delta via fetchState() and computes everything with the pure logic in
// src/lib/logic — today's date is always an explicit input (S10).

import { useEffect, useState } from "react";

import { fetchState } from "@/lib/data/api-client";
import { intervalsForModel, MODEL_CATALOG } from "@/lib/data/seed";
import {
  activeCar,
  applyCar,
  applyEvent,
  currentKmForCar,
  eventsForCar,
  seedState,
  setActiveCar,
  type StoreState,
} from "@/lib/data/store";
import { costTotals } from "@/lib/logic/costs";
import { formatKm } from "@/lib/logic/format";
import { computeItemStatuses, topStatusCards } from "@/lib/logic/status";
import { buildSuggestions } from "@/lib/logic/suggestions";

import { CarFormDialog } from "./car-form-dialog";
import { CarSwitcher } from "./car-switcher";
import { CostsCard } from "./costs-card";
import { EventFormDialog } from "./event-form-dialog";
import { StatusCard } from "./status-card";
import { SuggestionsCard } from "./suggestions-card";
import { TimelineCard } from "./timeline-card";

export function Dashboard() {
  // The deterministic seed renders immediately (S10); the server-persisted
  // user delta merges in when /api/state answers. If the database is
  // unreachable, the seed stays visible with an advisory note — no crash.
  const [state, setState] = useState<StoreState>(seedState);
  const [loadError, setLoadError] = useState(false);
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    let cancelled = false;
    fetchState()
      .then((merged) => {
        if (!cancelled) setState(merged);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const car = activeCar(state);
  const model = MODEL_CATALOG.find((m) => m.id === car.modelId);
  const carName = car.nickname ?? model?.name ?? "Ismeretlen modell";
  const events = eventsForCar(state, car.id);
  const currentKm = currentKmForCar(state, car.id);
  const intervals = intervalsForModel(car.modelId);
  const statuses = computeItemStatuses(events, intervals, currentKm, todayIso);
  const cards = topStatusCards(statuses);
  const suggestions = buildSuggestions(events, intervals, currentKm, todayIso);
  const totals = costTotals(events, todayIso);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-24 md:gap-8 md:p-8 md:pb-28">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm text-muted-foreground">MyCar Logbook</p>
            <h1 className="text-2xl font-semibold">
              {carName}, {car.year}
            </h1>
          </div>
          {/* Car switcher (spec §1): visible with 2+ cars; switching swaps
              every dashboard element via setActiveCar (S14). „Új autó" is
              always available; a saved car becomes active via applyCar
              (spec §2a, S13). */}
          <div className="flex flex-wrap items-center gap-2">
            {state.cars.length >= 2 && (
              <CarSwitcher
                cars={state.cars}
                activeCarId={state.activeCarId}
                onSelect={(carId) =>
                  setState((prev) => setActiveCar(prev, carId))
                }
              />
            )}
            <CarFormDialog
              currentYear={Number(todayIso.slice(0, 4))}
              onSaved={(newCar) => setState((prev) => applyCar(prev, newCar))}
            />
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-4xl font-semibold tabular-nums">
            {formatKm(currentKm)}
          </p>
          <p className="text-xs text-muted-foreground">
            Jelenlegi kilométeróra-állás
          </p>
        </div>
      </header>

      {loadError && (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          A mentett adatok betöltése nem sikerült — a beépített demóadatok
          láthatók.
        </p>
      )}

      <section aria-label="Állapot" className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <StatusCard key={item.type} item={item} />
        ))}
      </section>

      <section
        aria-label="Javaslatok és költségek"
        className="grid gap-4 lg:grid-cols-[2fr_1fr]"
      >
        <SuggestionsCard suggestions={suggestions} />
        <CostsCard totals={totals} year={todayIso.slice(0, 4)} />
      </section>

      <TimelineCard events={events} />

      {/* New-event FAB + dialog (T4, spec §2): saves attach to the active
          car; applying the saved event to state recomputes timeline, status
          cards, suggestions, and costs (S4, S8). */}
      <EventFormDialog
        carId={car.id}
        currentKm={currentKm}
        todayIso={todayIso}
        onSaved={(event) => setState((prev) => applyEvent(prev, event))}
      />
    </div>
  );
}
