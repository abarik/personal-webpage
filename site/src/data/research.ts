import type { Lang } from "../lib/i18n";

export type TopicId =
  | "speech" | "education" | "statistics" | "language-learning"
  | "applied" | "gamification" | "knowledge-space";

type T = Record<Lang, string>;
export interface Topic {
  id: TopicId;
  /** The topic's name in the "terulet" column of publications.csv. */
  csv: string;
  title: T;
  text: T;
}

/** Research topics, in the order they appear on the home, research and publications pages. */
export const topics: Topic[] = [
  {
    id: "speech",
    csv: "Nyelvészet és beszédtechnológia",
    title: { hu: "Nyelvészet és beszédtechnológia", en: "Linguistics and speech technology" },
    text: {
      hu: "A magyar beszéd akusztikai szerkezetének vizsgálata: formánsok, koartikuláció, beszédfeldolgozás és beszédészlelés, valamint beszédadatbázisok és gépi beszédelemző eszközök fejlesztése. Ide tartozik a PhD-dolgozatom is.",
      en: "The acoustic structure of Hungarian speech: formants, coarticulation, speech processing and perception, together with speech databases and tools for automatic speech analysis. My PhD thesis belongs here too.",
    },
  },
  {
    id: "education",
    csv: "Oktatáskutatás",
    title: { hu: "Oktatáskutatás", en: "Educational research" },
    text: {
      hu: "Tanulói teljesítmény, digitális oktatás és felsőoktatás: mi segíti a tanulást, különösen a hátrányos helyzetű tanulók esetében, és hogyan mérhetők a diákok algoritmikus készségei.",
      en: "Student achievement, digital education and higher education: what helps learning, especially for disadvantaged pupils, and how students' algorithmic skills can be measured.",
    },
  },
  {
    id: "statistics",
    csv: "Statisztika és módszertan",
    title: { hu: "Statisztika és módszertan", en: "Statistics and methodology" },
    text: {
      hu: "Pszichológiai statisztika és kutatásmódszertan a gyakorlatban: adatkezelés és elemzés R-ben, fejlesztőprogramok hatásvizsgálata, tankönyvek és jegyzetek.",
      en: "Psychological statistics and research methodology in practice: data management and analysis in R, evaluating development programmes, textbooks and notes.",
    },
  },
  {
    id: "language-learning",
    csv: "Nyelvtanulás és pszicholingvisztika",
    title: { hu: "Nyelvtanulás és pszicholingvisztika", en: "Language learning and psycholinguistics" },
    text: {
      hu: "Hogyan tanulunk meg új szavakat és nyelvtani szabályokat? Szó- és szabálytanulás mesterséges nyelvekkel, fiatal és idős felnőttek nyelvtanulása, az Animal Farm Task.",
      en: "How do we learn new words and grammatical rules? Word and rule learning with artificial languages, language learning in young and older adults, and the Animal Farm Task.",
    },
  },
  {
    id: "applied",
    csv: "Alkalmazott pszichológia",
    title: { hu: "Alkalmazott pszichológia", en: "Applied psychology" },
    text: {
      hu: "A pszichológia a munkában és a mindennapokban: munka–család konfliktus, alvásminőség, vezetőkiválasztás és a KVK-teszt, válságkezelés.",
      en: "Psychology at work and in everyday life: work–family conflict, sleep quality, leader selection and the KVK test, crisis management.",
    },
  },
  {
    id: "gamification",
    csv: "Gamifikáció",
    title: { hu: "Gamifikáció", en: "Gamification" },
    text: {
      hu: "Játékos elemek az oktatásban: hogyan növelhető a tanulók motivációja, különös tekintettel a HANNA digitális nyelvtanulási projektre.",
      en: "Game elements in education: how to raise learners' motivation, with a focus on the HANNA digital language-learning project.",
    },
  },
  {
    id: "knowledge-space",
    csv: "Tudástérelmélet",
    title: { hu: "Tudástérelmélet", en: "Knowledge space theory" },
    text: {
      hu: "A tudás szerkezetének modellezése tudásterekkel, és ennek alkalmazása az adaptív tudásfelmérésben.",
      en: "Modelling the structure of knowledge with knowledge spaces, and applying it in adaptive knowledge assessment.",
    },
  },
];

const byCsv = new Map(topics.map((t) => [t.csv, t.id]));
export const topicByName = (name: string): TopicId | null => byCsv.get(name.trim()) ?? null;
