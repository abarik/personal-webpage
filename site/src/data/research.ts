import type { Lang } from "../lib/i18n";

/** Research areas, shown on the home page and the research page. */
export const research: { id: string; title: Record<Lang, string>; text: Record<Lang, string> }[] = [
  {
    id: "statistics",
    title: { hu: "Statisztika és R", en: "Statistics and R" },
    text: {
      hu: "Adatkezelés és statisztikai elemzés R-ben; fejlesztőprogramok hatásvizsgálatának matematikai statisztikai háttere.",
      en: "Data management and statistical analysis in R; the statistical background of evaluating development programmes.",
    },
  },
  {
    id: "speech",
    title: { hu: "Beszédkutatás", en: "Speech research" },
    text: {
      hu: "A magyar beszéd akusztikai jellemzői: formánsok, koartikuláció, szóidőtartam a spontán beszédben.",
      en: "Acoustic properties of Hungarian speech: formants, coarticulation, word duration in spontaneous speech.",
    },
  },
  {
    id: "gamification",
    title: { hu: "Gamifikáció és oktatás", en: "Gamification and education" },
    text: {
      hu: "Játékosítás az oktatásban; digitális tananyag hátrányos helyzetű tanulók nyelvtanulásához (HANNA); tanulói motiváció hátrányos helyzetű régiókban.",
      en: "Gamification in education; a digital course supplement for language learning of disadvantaged pupils (HANNA); learner motivation in low-SES regions.",
    },
  },
  {
    id: "algorithmic",
    title: { hu: "Algoritmikus készségek", en: "Algorithmic skills" },
    text: {
      hu: "Diákok és egyetemi hallgatók algoritmikus készségeinek mérése és fejlesztése, táblázatkezelés oktatása (Sprego).",
      en: "Measuring and developing the algorithmic skills of school and university students; teaching spreadsheet management (Sprego).",
    },
  },
];
