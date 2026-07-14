# Acceptance scenarios — MyCar Logbook

Given–When–Then scenarios; the independent reviewer judges the implementation
against these. UI strings are Hungarian; scenario language is English.

## Dashboard

**S1 — Dashboard shows the car and odometer**
- Given the app starts with the seeded demo data
- When I open the home page
- Then I see "Skoda Octavia 1.6 TDI" with year 2012 and the current odometer
  "236 400 km" formatted with `hu-HU` grouping.

**S2 — Three status cards with correct severity**
- Given the seeded history (last oil change 235 000 km, interval to 245 000 km;
  pollen filter due in ~1 500 km; inspection due in 34 days)
- When I open the dashboard
- Then I see three status cards: Motorolaj marked green, Pollenszűrő marked
  yellow, Műszaki vizsga marked red, each with its key figure.

**S3 — Timeline lists recent events**
- Given the seeded history
- When I view "Legutóbbi események"
- Then events appear in reverse-chronological order, each with type icon,
  title, odometer, date, and cost when known.

## New event (manual form)

**S4 — Manual entry appears on the timeline**
- Given I open the new-event form from the FAB
- When I fill type=Olajcsere, date=today, odometer=236 500, cost=45 000 and save
- Then the event appears at the top of the timeline and the current odometer
  updates to 236 500 km.

**S5 — Validation blocks incomplete input**
- Given the new-event form
- When I try to save without type or date
- Then the form shows field-level errors and nothing is saved.

**S6 — Odometer regression warns but does not block**
- Given the current odometer is 236 400 km
- When I save an event with odometer 230 000 km
- Then I get a visible warning about the lower reading, and I can still
  confirm and save (e.g. backfilling an old event).

## Service suggestions (rule-based)

**S7 — Suggestions are grounded in the history**
- Given the seeded history and current odometer 236 400 km
- When the "Következő javasolt szervizek" card renders
- Then it shows up to 5 short Hungarian bullet recommendations in descending
  urgency, consistent with the history (e.g. oil change expected in ~8 600 km;
  timing belt last done at 175 000 km), phrased as advice, with no diagnosis
  claims and no invented events.

**S8 — Suggestions react to new events**
- Given the suggestions card shows the oil change as due soon
- When I record a new Olajcsere event at the current odometer
- Then the oil-related suggestion and the Motorolaj status card recompute
  (due date moves out by one interval, status returns to green).

**S9 — Unknown history yields a careful hint**
- Given an item in the interval table has no matching event in the history
- When the suggestions are computed
- Then that item gets a "check the manufacturer's schedule" style hint rather
  than a fabricated due date.

**S16 — Cost summary card sums real costs only**
- Given the seeded history where some events have a cost and some do not
- When the „Szervizköltségek" card renders
- Then the current-year and all-time totals equal the exact sums of the
  events that have a cost, formatted with `hu-HU` grouping (e.g. „45 000 Ft"),
  and events without a cost are excluded.

**S17 — Km-based suggestions carry a date estimate**
- Given the seeded history with at least two odometer readings spanning at
  least 30 days
- When the suggestions are computed
- Then km-based recommendations also include an approximate due date phrased
  as an estimate („várhatóan … körül"); and given fewer than two readings or
  a span under 30 days, no date estimate appears.

## Cars (add & switch)

**S13 — Add a car from the model catalog**
- Given I open the add-car form via „Új autó"
- When I pick a model from the model list, enter year 2018 and odometer
  89 000 and save
- Then the new car is created and becomes active, and the header shows its
  name, year, and "89 000 km".

**S14 — Switching cars swaps all dashboard data**
- Given two cars exist with different histories
- When I switch the active car in the header select
- Then the status cards, suggestions, and timeline all show only the selected
  car's data, and the odometer in the header updates.

**S15 — A new car has an honest empty state**
- Given a freshly added car with no event history
- When its dashboard renders
- Then status cards and suggestions show the careful "check the
  manufacturer's schedule" hints with no fabricated due dates, and the
  timeline shows an empty state.

## Non-functional

**S10 — Deterministic and offline**
- Given the network is unavailable
- When I load the dashboard and use the app
- Then everything works: no runtime AI/API dependency exists, and the same
  seed always produces the same statuses and suggestions.

**S11 — Gates are green**
- Given the implemented feature set
- When `npm run typecheck && npm run lint && npm run test` and the CI pipeline
  run
- Then all pass.

**S12 — Responsive layout**
- Given a 375 px wide viewport
- When I open the dashboard
- Then cards stack in one column, the FAB remains visible, and no horizontal
  scrolling occurs.
