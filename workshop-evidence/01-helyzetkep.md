# 01 — Helyzetkép: a repó diagnózisa

> Készült: 2026-07-14 · Módszer: kizárólag olvasás, kódmódosítás nélkül.
> Tárgy: `car-manager` (a `participant-starter` kimásolt tartalma).

## 1. Mit találtam (tények)

**Identitás és eredet**
- A repó a workshop `participant-starter` sablonjának másolata; a `package.json`
  neve még mindig `participant-starter` (nem lett átnevezve `car-manager`-re).
- `origin` remote: `https://github.com/rgulyasInsiron/car-manager.git`.
- Git állapot: **nincs egyetlen commit sem** a `main` branchen, minden fájl
  `untracked`. A távoli repó üres.

**Tech stack (a `package.json` szerint)**
- Next.js `16.2.10` (App Router) + React `19.2.4` + TypeScript `^5`.
- Tailwind `^4` + shadcn/ui (lokális forrás: `src/components/ui/button.tsx`,
  `card.tsx`).
- Teszt: Vitest `^4.1.10` (egy minta-teszt: `src/lib/utils.test.ts`).

**Alkalmazás-állapot**
- Egyetlen „It works!" kezdőlap (`src/app/page.tsx`), placeholder tartalommal.
- Nincs üzleti logika, nincs adatréteg, nincs API. Ez szándékos (a README és az
  `AGENTS.md` is így írja): a starter csak a technikai hordozó.

**Gépi kapuk és automatizálás**
- npm scriptek: `dev`, `build`, `start`, `typecheck`, `lint`, `test`.
- CI: `.github/workflows/ci.yml` — push (`main`) és minden PR esetén lefuttat
  `npm ci → typecheck → lint → test → build`-et Node 22-n.
- Agent-szerződés: `AGENTS.md` (a `CLAUDE.md` erre mutat) — 5 szabály, köztük a
  „done előtt fusson zöldre typecheck + lint + test".
- MCP: `.mcp.json` négy szervert köt be (Linear, GitHub, Neon, Vercel);
  `.claude/settings.json` engedélyezi az összeset.

**Környezet**
- `node_modules` **nincs telepítve** → egyetlen kapu sem futott még le lokálisan.
- `.env` nincs (csak `.env.example`), de jelenleg nincs is szükség titokra.

## 2. Legalább három hiányzó információ

1. **A projekt saját azonosítója / átnevezése.** A `package.json` `name` mezője
   `participant-starter` maradt. Nem tudni, hogy a `car-manager` a végleges
   projektnév-e, vagy csak a repó neve. → Emberi döntést igényel.

2. **A `DATABASE_URL` és a Neon-adatbázis paraméterei.** A `.env.example` üres,
   a Neon MCP be van kötve, de nincs kapcsolati string, nincs séma, nincs
   branch-stratégia. Adat nélkül a „KK-Regisztráció" munkadarab (duplikátum-
   védelem, 48h lemondási ablak) nem implementálható. → Külső hozzáférés + döntés.

3. **A jóváhagyott spec-csomag.** Az `AGENTS.md`/`DESIGN-GUIDELINE.md` több
   helyen `docs/spec/`-re hivatkozik (constitution/spec/given-when-then/plan/
   tasks), de ez a mappa **nem létezik** a repóban. A „mit építünk" szerződés
   hiányzik. → Ez a 3. modul kimenete, emberi elfogadással.

4. **A dizájn-tokenek.** A `DESIGN-GUIDELINE.md` minden érdemi szakasza
   (Brand & tone, Colors, Typography, Layout, Components, Don'ts) üres HTML-
   kommentekkel van kitöltve — vagyis „a döntés még nyitott". → Emberi döntés.

5. **Zöld-e a kiindulópont?** Mivel `node_modules` nincs telepítve, nincs
   bizonyíték arról, hogy a `typecheck/lint/test/build` friss környezetben
   tényleg átmegy. A CI még soha nem futott (nincs commit). → Mechanikus lépéssel
   tisztázható (nem döntés).

## 3. A modell / agent / ember döntési határa

| Réteg | Mit dönt / mit csinál | Példa ebben a repóban |
|---|---|---|
| **Modell** (LLM) | Nyelvi/kód-generálás a kapott kontextusból. Nincs saját akarata, állapota vagy jogosultsága; javaslatot ad, nem hagy jóvá. | Megfogalmaz egy spec-tervezetet, kódot ír a jóváhagyott taskhoz, hibaüzenetet értelmez. |
| **Agent** (harness: Claude Code / Codex + toolok) | A modell köré épült végrehajtó: fájlt olvas/ír, parancsot futtat, MCP-t hív, kapukat ismételget — **a jóváhagyott scope-on belül**. Végrehajt, de nem terjeszti ki a mandátumot. | `npm install` és a preflight lefuttatása; `page.tsx` szerkesztése egy elfogadott spec szerint; PR nyitása. |
| **Ember** | Célt, scope-ot és szerződést határoz meg; kaput nyit vagy zár; irreverzibilis / kifelé ható lépéseket engedélyez. **A tulajdonjog és a felelősség itt van.** | Elfogadja a spec-csomagot; jóváhagyja a design-tokeneket; engedélyezi a push/merge/deploy lépést; eldönti a projektnevet és a DB-hozzáférést. |

**A határ rövid szabálya:** a modell *javasol*, az agent *végrehajt a jóváhagyott
határon belül*, az ember *dönt és jóváhagy* — különösen ott, ahol a lépés
nehezen visszafordítható vagy kifelé hat (push, deploy, adat, titok, névválasztás).

Ebben a repóban a határ ma **kifejezetten éles**: a `.mcp.json` komment maga
rögzíti, hogy titkot ide tenni tilos, a GitHub OAuth szándékosan nem megy, a
`gh` CLI-t emberi hitelesítés fedi — vagyis a kifelé ható műveletek emberi
kapun keresztül futnak.

## 4. A javasolt következő emberi döntés

**Döntsd el a projekt identitását és az első commit szerződését — mielőtt bármit
felpusholnánk.** Konkrétan egyetlen kérdés: *„A `car-manager` a végleges
projektnév, átnevezzem-e a `package.json`-t, és mehet-e egy első
`Initial commit: import participant-starter` a `main`-re (ezzel elindul a CI)?"*

Miért ez az első: minden további lépés (spec-írás, DB-bekötés, feature-munka)
erre a bázisra épül; a név és az első commit **irreverzibilis, kifelé ható**
döntés (publikus GitHub-repó, futó CI), tehát definíció szerint emberi kapu — és
addig blokkol minden agent-végrehajtást, amíg meg nem születik.

> Megjegyzés: ez a fájl diagnózis, nem beavatkozás — kód nem módosult, telepítés
> és commit nem történt.
