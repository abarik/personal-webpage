import type { Lang } from "../lib/i18n";

type T = Record<Lang, string>;
export interface Course {
  name: T;
  /** Level or language, shown as a quiet tag (BA, MA, PhD, English). */
  tags?: T[];
  /** Materials, shown on the courses page. */
  links?: { label: T; href: string }[];
}
export interface CourseGroup {
  id: string;
  title: T;
  description: T;
  /** The matching section id on the reading-list page, per language. */
  reading: T;
  courses: Course[];
}

const BA: T = { hu: "BA", en: "BA" };
const MA: T = { hu: "MA", en: "MA" };
const PHD: T = { hu: "PhD", en: "PhD" };
const ENGLISH: T = { hu: "angol nyelvű", en: "in English" };

/** Courses grouped by subject: home page overview and the courses page. */
export const courseGroups: CourseGroup[] = [
  {
    id: "statistics",
    reading: { hu: "statisztika", en: "statistics" },
    title: { hu: "Statisztika", en: "Statistics" },
    description: {
      hu: "A pszichológiai kutatás nyelve: hogyan írjuk le az adatokat, és mikor vonhatunk le belőlük megbízható következtetést. A matematikai alapoktól a paraméteres próbákon át a többváltozós módszerekig vezetem végig a hallgatókat, R-ben és jamoviban, magyarul és angolul.",
      en: "The language of psychological research: how to describe data, and when we can draw reliable conclusions from it. I guide students from the mathematical foundations through parametric tests to multivariate methods, in R and jamovi, in Hungarian and in English.",
    },
    courses: [
      { name: { hu: "Matematikai alapok", en: "Mathematical Foundations" }, tags: [BA] },
      {
        name: { hu: "Pszichológiai statisztika 1. (paraméteres eljárások)", en: "Psychological Statistics 1 (parametric methods)" },
        tags: [BA],
        links: [{ label: { hu: "Példák próbák végrehajtására", en: "Worked examples of statistical tests" }, href: "https://abarik.github.io/stat1_kurzus/" }],
      },
      {
        name: { hu: "Pszichológiai statisztika 3. (többváltozós statisztika)", en: "Psychological Statistics 3 (multivariate statistics)" },
        tags: [BA],
        links: [{ label: { hu: "Többváltozós statisztika jamovi-ban és R-ben", en: "Multivariate statistics in jamovi and R" }, href: "https://abarik.github.io/tsjr/" }],
      },
      { name: { hu: "Statistics for Psychologists 3.", en: "Statistics for Psychologists 3" }, tags: [BA, ENGLISH] },
    ],
  },
  {
    id: "computing",
    reading: { hu: "szamitastechnika", en: "computing" },
    title: { hu: "Számítástechnika", en: "Computing" },
    description: {
      hu: "A tudományos munka digitális alapjai: táblázatkezelés, hivatkozáskezelés és a könyvtári források használata. Célom, hogy a hallgatók magabiztosan és hatékonyan használják a számítógépet a tanulmányaik során.",
      en: "The digital foundations of academic work: spreadsheets, reference management and the use of library resources. My aim is for students to use the computer confidently and efficiently throughout their studies.",
    },
    courses: [
      {
        name: { hu: "Számítástechnika 1.", en: "Computing 1" },
        tags: [BA],
        links: [
          { label: { hu: "Hivatkozáskezelők – videósorozat", en: "Reference managers – video series" }, href: "https://www.youtube.com/playlist?list=PLnmeQHnHYqv5jzYnu8i2Kh46Ti5g1bVCz" },
          { label: { hu: "Hivatkozáskezelők – jegyzet (PDF)", en: "Reference managers – notes (PDF)" }, href: "https://abarik.github.io/statisztika/files/hivatkozaskezelok.pdf" },
        ],
      },
      { name: { hu: "Számítástechnika és könyvtárismeret", en: "Computing and Library Skills" }, tags: [BA] },
      { name: { hu: "Computer Science I.", en: "Computer Science I" }, tags: [BA, ENGLISH] },
    ],
  },
  {
    id: "ai",
    reading: { hu: "mesterseges-intelligencia", en: "artificial-intelligence" },
    title: { hu: "Mesterséges intelligencia", en: "Artificial intelligence" },
    description: {
      hu: "Hogyan működnek a mai MI-rendszerek, és mit jelentenek a pszichológia számára? A gépi tanulás alapjaitól a nagy nyelvi modellekig tekintjük át a területet, a lehetőségekkel és a korlátokkal együtt.",
      en: "How do today's AI systems work, and what do they mean for psychology? We survey the field from the basics of machine learning to large language models, with its possibilities and limitations.",
    },
    courses: [{ name: { hu: "Mesterséges intelligencia", en: "Artificial Intelligence" }, tags: [MA] }],
  },
  {
    id: "networks",
    reading: { hu: "tarsas-halozatok", en: "social-networks" },
    title: { hu: "Társas hálózatok", en: "Social networks" },
    description: {
      hu: "A kapcsolatok szerkezete is sokat elárul: ki kivel áll kapcsolatban, ki van a hálózat közepén, és hogyan terjed benne az információ. A tárgy a társas hálózatok elemzésének fogalmait és módszereit mutatja be, gyakorlati példákon.",
      en: "The structure of relationships says a lot: who is connected to whom, who sits at the centre of a network, and how information spreads through it. The course introduces the concepts and methods of social network analysis through practical examples.",
    },
    courses: [
      {
        name: { hu: "Társas hálózatok elemzése", en: "Social Network Analysis" },
        links: [{ label: { hu: "Társas hálózatok elemzése – jegyzet", en: "Social network analysis – notes" }, href: "https://abarik.github.io/tarsas_halozatok_elemzese_2023_24_1/" }],
      },
    ],
  },
  {
    id: "knowledge-space",
    reading: { hu: "tudasterelmelet", en: "knowledge-space-theory" },
    title: { hu: "Tudástérelmélet", en: "Knowledge space theory" },
    description: {
      hu: "A tudástérelmélet azt modellezi, hogyan épülnek egymásra az ismeretek egy tárgyterületen, és ebből hogyan állapítható meg pontosan, mit tud valaki. A PhD-kurzuson a módszer gyakorlati alkalmazásait vesszük sorra.",
      en: "Knowledge space theory models how pieces of knowledge build on each other within a subject, and how this lets us determine precisely what someone knows. The PhD course works through practical applications of the method.",
    },
    courses: [
      { name: { hu: "Tudástérelmélet a gyakorlatban", en: "Knowledge Space Theory in Practice" }, tags: [PHD] },
    ],
  },
];
