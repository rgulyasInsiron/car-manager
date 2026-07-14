# Repo-helyzetkép

> Készült: 2026-07-14 · Repo: `car-manager` (`https://github.com/rgulyasInsiron/car-manager`)
> Módszer: csak olvasás + egy read-only ellenőrző parancs; kód nem módosult.

## A repo célja

A Wenova AI-Assisted Development Workshop résztvevői starterének élesített
példánya: egy szándékosan minimális Next.js (App Router) + TypeScript +
Tailwind + shadcn/ui hordozó, amelyet a nap során agent-ready fejlesztési
rendszerré alakítunk (mission, spec-kapu, RUG, mechanikus ellenőrzések). A
később ráépülő alkalmazás — a nap munkadarabja a **KK-Regisztráció** nevű
kitalált üzleti kérés — a rendszer validációs workloadja, nem öncél.
(Forrás: `README.md`.)

## Amit az agent feltételezhet

- A stack: Next.js `16.2.10`, React `19.2.4`, TypeScript `^5`, Tailwind `^4`,
  shadcn/ui lokális forrásként, Vitest `^4.1.10`. (Forrás: `package.json`.)
- A kapuk léteznek és kötelezőek: `npm run typecheck && npm run lint && npm run test`
  zöldje nélkül semmi sincs kész. (Forrás: `AGENTS.md` 5. szabály.)
- Minden push a `main`-re és minden PR lefuttatja a CI-t: `npm ci → typecheck →
  lint → test → build`, Node 22-n. (Forrás: `.github/workflows/ci.yml`.)
- A bázis zölden áll: mindkét eddigi CI-futás sikeres. (Forrás: `gh run list`
  eredménye, lásd Ellenőrzési mód.)
- A csomagnév `car-manager`, a `package.json` és a `package-lock.json`
  konzisztens. (Forrás: `c48320d` commit.)
- UI-építőelem csak a `src/components/ui/`-ból jöhet; új komponens a
  `npx shadcn@latest add <component>` eljárással. (Forrás: `AGENTS.md` 2. szabály.)
- Kód, komment és commit-üzenet angol. (Forrás: `AGENTS.md` 4. szabály.)
- Next.js-munka előtt a verzióhoz tartozó docs a forrás:
  `node_modules/next/dist/docs/`. (Forrás: `AGENTS.md` fejléce.)
- MCP-szerverek bekötve: Linear, GitHub, Neon, Vercel; a `.mcp.json` titkot nem
  tartalmazhat. (Forrás: `.mcp.json` + `.claude/settings.json`.)

## Amit az agent nem feltételezhet

- **Hogy létezik spec.** A `docs/spec/` mappa, amire a `DESIGN-GUIDELINE.md`
  hivatkozik, nem létezik — nincs jóváhagyott „mit építünk" szerződés.
- **Hogy vannak dizájn-döntések.** A `DESIGN-GUIDELINE.md` minden érdemi
  szakasza (Brand, Colors, Typography, Layout, Components, Don'ts) üres.
- **Hogy van adatréteg.** Nincs `.env`, nincs `DATABASE_URL`, nincs séma; a
  Neon MCP be van kötve, de adatbázis nincs provisioning-olva.
- **Hogy a lokális környezet fut.** `node_modules` nincs telepítve; a zöld
  állapot bizonyítéka kizárólag a CI (Linux, Node 22), nem a helyi gép.
- **Hogy deploy létezik.** A Vercel MCP bekötött, de projekt-összekötésről és
  preview-deployról nincs bizonyíték.
- **Hogy a scope-ot maga bővítheti.** Új library, pattern vagy absztrakció csak
  ha a feladat tényleg igényli (`AGENTS.md` 3. szabály); kifelé ható lépés
  (push, deploy, adat, titok) emberi kapu mögött van.

## Ellenőrzési mód

- Pontos parancs: `gh run list --limit 5` (a repo mappájában)
- Várt, megfigyelhető eredmény: a `main` push-jaihoz tartozó CI-futások
  `completed / success` állapotban, mind a négy kapu (typecheck, lint, test,
  build) lefutásával.
- Tényleges eredmény (2026-07-14):
  - `c48320d` „Rename package to car-manager" → **completed / success** (40s)
  - `552e7c1` „Initial commit: import participant-starter" → **completed / success** (43s)
- Állapot: **ELLENŐRZÖTT** — a bázis a CI referenciakörnyezetében zöld.
- Megjegyzés: a *lokális* zöld állapot ettől még ISMERETLEN (nincs telepítés);
  tisztázása mechanikus (`npm ci && npm run typecheck && npm run lint && npm run test`),
  döntést nem igényel, csak futtatást.

## Ismeretlenek

1. Kérdés: **Mi a KK-Regisztráció pontos, elfogadott specifikációja** (mezők,
   48 órás lemondási határ pontos szemantikája, duplikátum-védelem kulcsa)?
   Miért számít: enélkül az agent csak találgatni tudná az üzleti szabályokat;
   minden implementáció vitatható lenne.
   Válaszadó szerep: **ember** (termékgazda-szerep a workshopon) — a 3. modul
   spec-csomagja rögzíti, emberi elfogadással.
   Addig tiltott feltételezés: az agent nem kezdhet feature-implementációt és
   nem találhat ki üzleti szabályt „ésszerű defaultként".

2. Kérdés: **Milyen adatbázis- és környezet-paraméterekkel dolgozunk**
   (Neon-projekt, `DATABASE_URL`, branch-stratégia, séma-kezelés)?
   Miért számít: a munkadarab duplikátum-védelme és lemondási ablaka
   perzisztencia nélkül nem valósítható meg; a DB-provisioning kifelé ható,
   fiókhoz kötött lépés.
   Válaszadó szerep: **ember** engedélyezi (fiók, költség), az agent ezután
   MCP-n át végrehajthatja.
   Addig tiltott feltételezés: az agent nem vezethet be adatréteget, ORM-et
   vagy sémát, és nem írhat `DATABASE_URL`-t sehova.

3. Kérdés: **Mik a dizájn-tokenek és a house style** (színek, tipográfia,
   spacing, don'ts)?
   Miért számít: az `AGENTS.md` 1. szabálya minden vizuális munkát a
   guideline-hoz köt; üres guideline mellett minden UI-döntés az agent
   ízlése lenne — pont az, amit a rendszer tiltani akar.
   Válaszadó szerep: **ember** hagyja jóvá; a tervezetet készítheti agent
   (v0 / Claude Design útvonal, lásd `DESIGN-GUIDELINE.md`).
   Addig tiltott feltételezés: az agent nem választhat brand-színt, fontot vagy
   új vizuális mintát; marad a starter jelenlegi semleges defaultja.

4. Kérdés: **Lesz-e Vercel- és Linear-összekötés, és melyik fiókkal?**
   Miért számít: a preview-deploy és az „issue = spec" munkamódszer csak
   hitelesített, összekötött szolgáltatásokkal működik; OAuth-hoz emberi
   böngészős belépés kell.
   Válaszadó szerep: **ember** (fiók-tulajdonos).
   Addig tiltott feltételezés: az agent nem állíthat be deployt és nem hozhat
   létre külső szolgáltatásban erőforrást.

## Szerephatárok

- **Modell:** nyelvi/kód-javaslatokat generál a kapott kontextusból — spec-
  tervezetet, kódot, magyarázatot. Nincs eszköze, állapota, jogosultsága;
  önmagában semmit nem hajt végre és semmit nem hagy jóvá.
- **Coding agent:** a modell + harness (Claude Code / Codex): fájlt olvas/ír,
  parancsot és kapukat futtat, MCP-t hív — **kizárólag a jóváhagyott scope-on
  belül**. Hibánál a scope-on belül javít és újrafuttatja a teljes ellenőrzést;
  a mandátumát maga nem bővítheti.
- **Ember:** célt, scope-ot, szerződést (spec, guideline, DoD) határoz meg és
  fogad el; minden kifelé ható vagy nehezen visszafordítható lépés (push,
  merge, deploy, fiók, titok, költség) az ő kapuja; a felelősség nála marad.
- **Független ellenőrző:** a makertől elkülönített verifikáció — a gépi rétege
  a CI (typecheck/lint/test/build, már él és zöld), az érdemi rétege a második,
  független agent-harness (RUG-review) és/vagy emberi review, amely a maker
  kontextusától függetlenül ítéli meg az eredményt a spec ellenében. Ez a
  workshop C4–C5 blokkjában kerül bekötésre.

## Következő emberi döntés

**A KK-Regisztráció spec-csomagjának megírása és elfogadása** (3. modul:
constitution / spec / given-when-then / plan / tasks a `docs/spec/` alatt).

Miért ez: az identitás-döntés (név, első commit) már megszületett és
végrehajtva; a fenti ismeretlenek közül a spec az, amelyik az összes többit
sorrendbe rakja — a DB-paraméterek és a dizájn-tokenek is a spec által
meghatározott igényekből következnek. Amíg nincs elfogadott spec, az agent
számára minden feature-munka tiltott; a repo készen áll, a kapuk élnek, a
következő lépés tisztán emberi döntés.
