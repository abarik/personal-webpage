# Személyes weboldal (Astro)

Dr. Abari Kálmán kétnyelvű (magyar/angol), többoldalas weboldala.
A lefordított oldal a repó `docs/` mappájába kerül, ezt publikálja a GitHub Pages:
<https://kalman.abari.hu/> (a domain a `public/CNAME` fájlban van)

## Parancsok (a `site/` mappában)

```sh
npm install        # első alkalommal
npm run dev        # helyi előnézet: http://localhost:4321/
npm run build      # fordítás a ../docs mappába (ezt kell commitolni)
npm run preview    # a lefordított oldal kipróbálása
```

## Hol mit szerkesztek?

| Mit | Hol |
|---|---|
| Oldalszövegek (cím, leírás, bevezető, törzs) | `src/content/pages/hu/*.md`, `src/content/pages/en/*.md` |
| Kutatási területek | `src/data/research.ts` |
| Publikációk (BibTeX, APA formában jelennek meg) | `src/data/publications.bib` |
| Név, beosztás, felületi szövegek, linkek, oldalak útvonalai | `src/lib/i18n.ts` |
| Megjelenés (színek, betűk, mozgás) | `src/styles/global.css` |
| Fejléc, lábléc, téma- és nyelvváltás | `src/layouts/Base.astro` |

Új oldal: vegyél fel egy bejegyzést a `routes` és `nav` listába (`src/lib/i18n.ts`),
írd meg a két Markdown-fájlt, és hozd létre a két útvonalfájlt a `src/pages/` alatt
(minta: `src/pages/oktatas/index.astro` és `src/pages/en/teaching/index.astro`).

Aloldal (pl. az Oktatás alatt): a `parent` és a `subnav` listában is szerepeljen (`src/lib/i18n.ts`);
így a főmenüben a szülőoldal marad kiemelve, és megjelenik az aloldalak fülsora.

A Markdown-oldalakon minden `## Cím` külön szakasz lesz (bal oldali címoszlop, görgetéskor megjelenés).

## Dizájnirány

Lásd a repó gyökerében a `CLAUDE.md` „Design direction” részét: kifinomult, magabiztos,
nem harsány; karakteres tipográfia, gondos ritmus; egy belépő animáció a főoldalon;
sima téma-, nyelv- és oldalváltás; a szakaszok görgetéskor egyszer jelennek meg;
a listák nem mozognak.
