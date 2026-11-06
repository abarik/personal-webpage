import type { Lang } from "../lib/i18n";

type T = Record<Lang, string>;
export interface Course {
  name: T;
  /** Level or language, shown as a quiet tag (BA, MA, PhD, English). */
  tags?: T[];
  /** Materials, shown on the courses page. */
  links?: { label: T; href: string }[];
}
export interface CourseGroup { id: string; title: T; courses: Course[] }

const BA: T = { hu: "BA", en: "BA" };
const MA: T = { hu: "MA", en: "MA" };
const PHD: T = { hu: "PhD", en: "PhD" };
const ENGLISH: T = { hu: "angol nyelvű", en: "in English" };

/** Courses grouped by subject: home page overview and the courses page. */
export const courseGroups: CourseGroup[] = [
  {
    id: "statistics",
    title: { hu: "Statisztika", en: "Statistics" },
    courses: [
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
    title: { hu: "Számítástechnika", en: "Computing" },
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
    title: { hu: "Mesterséges intelligencia", en: "Artificial intelligence" },
    courses: [{ name: { hu: "Mesterséges intelligencia", en: "Artificial Intelligence" }, tags: [MA] }],
  },
  {
    id: "networks",
    title: { hu: "Társas hálózatok", en: "Social networks" },
    courses: [
      {
        name: { hu: "Társas hálózatok elemzése", en: "Social Network Analysis" },
        links: [{ label: { hu: "Társas hálózatok elemzése – jegyzet", en: "Social network analysis – notes" }, href: "https://abarik.github.io/tarsas_halozatok_elemzese_2023_24_1/" }],
      },
    ],
  },
  {
    id: "other",
    title: { hu: "Egyéb tárgyak", en: "Other courses" },
    courses: [
      { name: { hu: "Matematikai alapok", en: "Mathematical Foundations" }, tags: [BA] },
      { name: { hu: "Tudástérelmélet a gyakorlatban", en: "Knowledge Space Theory in Practice" }, tags: [PHD] },
    ],
  },
];
