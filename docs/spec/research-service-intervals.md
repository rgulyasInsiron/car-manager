# Research note — external sources for model-specific service intervals

> Date: 2026-07-14 · Method: web research with claims verified against vendor
> pages · Feeds `plan.md` §8/3 (open decision: interval data source).
> Reference vehicle: 2012 Skoda Octavia 1.6 TDI (EU market).

## Key structural finding

The market splits in two, and neither half fits a free demo:

- **EU-focused professional workshop-data vendors** (HaynesPro, TecAlliance
  TecRMI, Autodata) — the only ones that actually cover a European-market
  Octavia 1.6 TDI. All are enterprise-priced with sales-contact onboarding;
  no self-serve signup.
- **US-market developer APIs** (CarMD, Vehicle Databases, CarAPI) — self-serve
  and cheap, but built on US-market vehicle databases; a Euro-only Skoda
  diesel effectively does not resolve.

**No free or government API anywhere provides service intervals.** OEM
maintenance data in the EU is licensed IP distributed via paid RMI channels
(EU Block Exemption rules) — the absence of a free structured source is by
design.

## 1. Commercial / professional databases

| Source | Data | API | Access | Demo feasibility |
|---|---|---|---|---|
| **HaynesPro** (WorkshopData/VESA) | OEM-based schedules, km/time intervals, lubricants, repair times; strong EU incl. Skoda | Yes (sold to integrators) | Enterprise B2B; reseller subscriptions from ~£99/mo; API negotiated | **Low** |
| **TecAlliance TecRMI** | OEM-compliant maintenance plans; "ServiceFinder": mileage + first registration → due items; EU coverage | Yes — publicly documented SOAP **and** REST, dedicated Maintenance module, token auth | Enterprise contract; no free tier | **Low** (hobby) / **Medium** with trial credentials — best-documented EU option |
| **Autodata** (Solera) | Schedules, specs, 550k procedures; EU incl. VW Group | Yes — REST, OAuth2, dev portal | Commercial agreement required | **Low** |
| **MOTOR** (US) | OEM schedules + labour times (DaaS) | Yes | Enterprise, US-market | **Low** |
| **Mitchell 1 ProDemand** | OEM schedules — workshop app, not a data API | Integrations only | US workshop subscription | **Low** |
| **Edmunds Maintenance API** | Was the classic free option | Docs still online, but **open API retired (access disabled 2018-02-15)**, partners only | Closed | **None** |

## 2. Free / public / government sources — verified negative

| Source | Has | Intervals? |
|---|---|---|
| NHTSA vPIC (US) | free VIN decode, specs, recalls | **No** — VIN→model resolution only, US-biased |
| UK DVSA MOT History API | MOT results, odometer history, advisories (OAuth2) | **No** — inspection history, not schedules |
| EU / Hungarian open data | type-approval, emissions, recalls | **No** — no open-data source publishes OEM maintenance schedules |

## 3. Manufacturer (VW Group / Skoda) sources

- **Skoda erWin** (skoda.erwin-store.com) — official RMI portal (EU
  regulatory obligation). Contains the real maintenance tables, VIN-specific
  data. Free registration, **paid time-based access (an hour pass is cheap)**
  — enough to transcribe the official Octavia 1.6 TDI (CR 77kW) tables
  manually. **No API; HTML/PDF behind login; not legally scrapable for
  redistribution** (transcribing interval *facts* for our own table is fine).
- **MySkoda / Digital Service Schedule** — per-vehicle service *records*, not
  a schedule source; no public API.
- **Owner's manuals (free PDFs)** — authoritative generic rule for the 2012
  Octavia II 1.6 TDI: fixed regime **15 000 km / 1 year**, or LongLife (QG1)
  up to **30 000 km / 2 years**, plus item intervals (fuel filter, brake
  fluid 2y, timing belt, DSG oil). Good reference for hand-curating.

## 4. VIN-decoder APIs with maintenance data

| Source | Maintenance data | EU coverage | Feasibility here |
|---|---|---|---|
| CarMD | Yes (`maintenance` by VIN/year/make/mileage); self-serve, small free daily credit allowance | **US/NA 1996+ only** — EU Octavia won't resolve | Low |
| Vehicle Databases | Yes — OEM schedules 1999–2023, JSON; free trial then paid | US-market | Medium/Low |
| TorqueNode | Yes — intervals by VIN | US-oriented | Medium/Low |
| Vincario / vindecoder.eu | **No** intervals (explicitly); good EU VIN decode | EU | VIN→model step only |
| CarAPI | No maintenance endpoint | US | Low |

## 5. Recommendation

**Nothing that covers an EU-market 2012 Octavia is integrable in hours.**
Every self-serve API is US-market; every EU-covering source is
enterprise-contract.

For the demo:

1. **Curated local table stays the primary source — this is the honest,
   correct architecture.** Upgrade it from "hardcoded" to a data-driven
   table (model, engine code, regime fixed/LongLife, item, km interval,
   month interval, source URL + retrieved date). Seed from the owner's
   manual; for exactness, a one-hour erWin pass to transcribe the official
   tables for the demo vehicle.
2. **Provider interface** (`MaintenanceScheduleProvider`) with the local
   table as default implementation, so a TecRMI/HaynesPro adapter can slot
   in if the project ever gets commercial credentials. **TecRMI is the best
   future candidate**: EU coverage, public REST docs, and its ServiceFinder
   model (mileage + first registration → due items) matches exactly what the
   app computes.
3. **Optional garnish:** Vincario/NHTSA free tier for VIN→model prefill;
   DVSA MOT API only if UK vehicles are ever demoed. Neither provides
   intervals.

**Bottom line:** curated local table now (structured, with cited sources),
pluggable provider seam for TecRMI/HaynesPro later. Any claim that a free
API can supply EU model-specific service schedules today would be false.

## Source links

- TecRMI docs: <https://tecrmi-services.tecalliance.net/docs/ServiceOverview.html> · product: <https://www.tecalliance.net/tecrmi-rmi/>
- HaynesPro: <https://www.infopro-digital-automotive.com/haynespro/> · <https://acc.haynespro.com/products/workshopdata-tech>
- Autodata API: <https://www.autodata-group.com/corporate/api/> · dev portal: <https://developer.autodata-group.com/>
- Edmunds API retirement: <https://help.edmunds.com/hc/en-us/articles/4414038118679-Edmunds-Developer-API>
- CarMD: <https://www.carmd.com/api/> · Vehicle Databases: <https://vehicledatabases.com/vehicle-maintenance-api>
- NHTSA vPIC: <https://vpic.nhtsa.dot.gov/api/> · DVSA MOT API: <https://documentation.history.mot.api.gov.uk/>
- Skoda erWin: <https://skoda.erwin-store.com/erwin/showHome.do> · Vincario: <https://vincario.com/> · CarAPI: <https://carapi.app/>
