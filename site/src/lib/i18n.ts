export type Lang = "hu" | "en";
export const langs: Lang[] = ["hu", "en"];

/** Every page of the site, with its path in each language (without the base). */
export const routes = {
  home: { hu: "/", en: "/en/" },
  research: { hu: "/kutatas/", en: "/en/research/" },
  teaching: { hu: "/oktatas/", en: "/en/teaching/" },
  "teaching-notes": { hu: "/oktatas/jegyzetek/", en: "/en/teaching/notes/" },
  "teaching-reading": { hu: "/oktatas/irodalom/", en: "/en/teaching/reading/" },
  publications: { hu: "/publikaciok/", en: "/en/publications/" },
  "publications-year": { hu: "/publikaciok/idorendben/", en: "/en/publications/by-year/" },
  "publications-type": { hu: "/publikaciok/tipus-szerint/", en: "/en/publications/by-type/" },
  contact: { hu: "/elerhetoseg/", en: "/en/contact/" },
} as const;
export type PageId = keyof typeof routes;

/** Navigation order. */
export const nav: PageId[] = ["home", "research", "teaching", "publications", "contact"];

/** Subpages and the top-level page they belong to (highlighted in the main navigation). */
export const parent: Partial<Record<PageId, PageId>> = {
  "publications-year": "publications",
  "publications-type": "publications",
  "teaching-notes": "teaching",
  "teaching-reading": "teaching",
};
/** Second-level navigation shown on a section's pages. */
export const subnav: Partial<Record<PageId, PageId[]>> = {
  teaching: ["teaching-reading", "teaching-notes", "teaching"],
  publications: ["publications", "publications-year", "publications-type"],
};

/** Prefixes a site path with the configured base (e.g. /personal-webpage). */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + path;
}
export const href = (id: PageId, lang: Lang) => url(routes[id][lang]);

export const ui = {
  hu: {
    name: "Dr. Abari Kálmán",
    role: "egyetemi adjunktus",
    affiliation: "Szociál- és Munkapszichológiai Tanszék, Pszichológiai Intézet, Bölcsészettudományi Kar, Debreceni Egyetem",
    pages: {
      home: "Főoldal", research: "Kutatás", teaching: "Oktatás", publications: "Publikációk", contact: "Elérhetőség",
      "teaching-notes": "Jegyzetek", "teaching-reading": "Ajánlott irodalom kurzusokhoz",
      "publications-year": "Időrendben", "publications-type": "Típus szerint",
    },
    subnavLabels: { teaching: "Videók", publications: "Témakörök szerint" } as Partial<Record<PageId, string>>,
    subnavAria: "Aloldalak",
    teachingMaterials: "Tananyagok",
    teaching: "Oktatás",
    teachingDetails: "Részletek az oktatásról",
    readingLink: "Ajánlott irodalom",
    pubCount: (n: number) => `${n} publikáció`,
    scopusCount: (n: number) => `ebből ${n} Scopus`,
    topicPubs: "A témakör publikációi",
    pubTypes: {
      book: "Könyvek", edited: "Szerkesztett kötetek", chapter: "Könyvfejezetek", article: "Folyóiratcikkek",
      conference: "Konferenciaközlemények", abstract: "Absztraktok", thesis: "Disszertáció", other: "Egyéb",
    },
    scopus: "Scopus",
    courseMaterials: "Anyagok",
    videos: "Videó\u00ADsorozatok",
    watch: "Megnézem",
    inHungarian: "",
    skip: "Ugrás a tartalomra",
    nav: "Fő navigáció",
    switchLang: "Switch to English",
    otherLangCode: "EN",
    otherLangName: "English",
    darkMode: "Sötét mód",
    lightMode: "Világos mód",
    profileLink: "Egyetemi profil",
    updated: "Utolsó frissítés",
    backToTop: "Vissza az elejére",
    allPublications: "Összes publikáció",
    moreResearch: "Bővebben a kutatásról",
    researchAreas: "Kutatási területek",
    recentPublications: "Legutóbbi publikációk",
    contact: "Elérhetőség",
    books: "Könyvek",
    articles: "Tanulmányok",
    fullListMtmt: "A teljes publikációs lista az MTMT-ben érhető el.",
    photoAlt: "Dr. Abari Kálmán portréja",
  },
  en: {
    name: "Dr. Kálmán Abari",
    role: "Assistant Professor",
    affiliation: "Department of Social and Work Psychology, Institute of Psychology, Faculty of Humanities, University of Debrecen",
    pages: {
      home: "Home", research: "Research", teaching: "Teaching", publications: "Publications", contact: "Contact",
      "teaching-notes": "Notes", "teaching-reading": "Reading list by course",
      "publications-year": "By year", "publications-type": "By type",
    },
    subnavLabels: { teaching: "Videos", publications: "By topic" } as Partial<Record<PageId, string>>,
    subnavAria: "Subpages",
    teachingMaterials: "Materials",
    teaching: "Teaching",
    teachingDetails: "More about my teaching",
    readingLink: "Recommended reading",
    pubCount: (n: number) => `${n} publication${n === 1 ? "" : "s"}`,
    scopusCount: (n: number) => `${n} in Scopus`,
    topicPubs: "Publications in this area",
    pubTypes: {
      book: "Books", edited: "Edited volumes", chapter: "Book chapters", article: "Journal articles",
      conference: "Conference papers", abstract: "Abstracts", thesis: "Dissertation", other: "Other",
    },
    scopus: "Scopus",
    courseMaterials: "Materials",
    videos: "Video series",
    watch: "Watch",
    inHungarian: "In Hungarian",
    skip: "Skip to content",
    nav: "Main navigation",
    switchLang: "Váltás magyarra",
    otherLangCode: "HU",
    otherLangName: "Magyar",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    profileLink: "University profile",
    updated: "Last updated",
    backToTop: "Back to top",
    allPublications: "All publications",
    moreResearch: "More about my research",
    researchAreas: "Research areas",
    recentPublications: "Recent publications",
    contact: "Contact",
    books: "Books",
    articles: "Articles and papers",
    fullListMtmt: "The full list of publications is available in MTMT.",
    photoAlt: "Portrait of Dr. Kálmán Abari",
  },
} as const;

export const links = {
  email: "abari.kalman@arts.unideb.hu",
  mtmt: "https://m2.mtmt.hu/gui2/?type=authors&mode=browse&sel=10036489",
  profile: "https://tudoster.unideb.hu/hu/szerzok/1874",
};
