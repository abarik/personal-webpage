// Corrections applied to the MTMT/OpenAlex export at build time, so that every reference
// comes out in clean APA 7 form. When you replace publications.bib and publications.csv
// with a newer export, these fixes are applied again automatically.

type Name = { family: string; given: string };
const n = (family: string, given: string): Name => ({ family, given });

/** Journal and proceedings names exported in capitals → their proper form. */
export const containerNames: Record<string, string> = {
  "BESZÉDKUTATÁS": "Beszédkutatás",
  "KÜLÖNLEGES BÁNÁSMÓD": "Különleges Bánásmód",
  "ALKALMAZOTT PSZICHOLÓGIA": "Alkalmazott Pszichológia",
  "EDUCATION AND INFORMATION TECHNOLOGIES": "Education and Information Technologies",
  "PHONETICIAN": "Phonetician",
  "ANYANYELV-PEDAGÓGIA": "Anyanyelv-pedagógia",
  "MAGYAR PSZICHOLÓGIAI SZEMLE": "Magyar Pszichológiai Szemle",
  "INTERNATIONAL JOURNAL OF INCLUSIVE EDUCATION": "International Journal of Inclusive Education",
  "TEACHING ENGLISH WITH TECHNOLOGY": "Teaching English with Technology",
  "ACTA POLYTECHNICA HUNGARICA": "Acta Polytechnica Hungarica",
  "PSYCHOLOGIA HUNGARICA CAROLIENSIS": "Psychologia Hungarica Caroliensis",
  "EDUCATIO": "Educatio",
  "CENTRAL EUROPEAN JOURNAL OF EDUCATIONAL RESEARCH": "Central European Journal of Educational Research",
  "PEDACTA": "PedActa",
  "ISKOLAKULTÚRA: PEDAGÓGUSOK SZAKMAI-TUDOMÁNYOS FOLYÓIRATA": "Iskolakultúra",
  "COGNITION BRAIN BEHAVIOUR: AN INTERDISCIPLINARY JOURNAL": "Cognition, Brain, Behavior: An Interdisciplinary Journal",
  "WORLD ACADEMY OF SCIENCE ENGINEERING AND TECHNOLOGY": "World Academy of Science, Engineering and Technology",
  "PROCEDIA - SOCIAL AND BEHAVIORAL SCIENCES": "Procedia – Social and Behavioral Sciences",
  "TURKISH ONLINE JOURNAL OF EDUCATIONAL TECHNOLOGY": "Turkish Online Journal of Educational Technology",
  "INFORMATICS IN EDUCATION: AN INTERNATIONAL JOURNAL": "Informatics in Education",
  "ACTA DIDACTICA NAPOCENSIA": "Acta Didactica Napocensia",
  "JOURNAL OF PSYCHOLINGUISTIC RESEARCH": "Journal of Psycholinguistic Research",
  "INTERNATIONAL JOURNAL OF COMPUTER SCIENCE ISSUES": "International Journal of Computer Science Issues",
  "APPLIED PSYCHOLOGY IN HUNGARY": "Applied Psychology in Hungary",
  "HÍRADÁSTECHNIKA (1962)": "Híradástechnika",
  "ALKALMAZOTT NYELVTUDOMÁNY": "Alkalmazott Nyelvtudomány",
  "LITERARY AND LINGUISTIC COMPUTING": "Literary and Linguistic Computing",
  "ADVANCES IN INTELLIGENT SYSTEMS AND COMPUTING": "Advances in Intelligent Systems and Computing",
  "16TH ANNUAL CONFERENCE OF THE INTERNATIONAL SPEECH COMMUNICATION ASSOCIATION (INTERSPEECH 2015), VOLS 1-5": "Proceedings of Interspeech 2015",
  "12th Annual Conference of the International Speech Communication Association, INTERSPEECH 2011, VOLS 1-5": "Proceedings of Interspeech 2011",
  "8th Annual Conference of the International Speech Communication Association": "Proceedings of Interspeech 2007",
  "Slušanjem to govora": "Slušanjem do govora",
};

/** Per-entry corrections (keyed by the BibTeX key). */
export const entryFixes: Record<string, {
  author?: Name[];
  editor?: Name[];
  title?: string;
  publisher?: string | null;
  genre?: string;
}> = {
  // OpenAlex swapped the Hungarian given and family names.
  kalman2015from: { author: [n("Abari", "Kálmán"), n("Csapó", "Tamás Gábor"), n("Tóth", "Bálint Pál"), n("Olaszy", "Gábor")] },
  janos2011knowledge: { author: [n("Máth", "János"), n("Abari", "Kálmán")] },
  buda2019tenyek: { author: [n("Buda", "M."), n("Pásku", "J."), n("Polonyi", "T."), n("Abari", "K.")] },
  abari2015tanulmanykotet: {
    author: [
      n("Abari", "Kálmán"), n("Balázs", "Katalin"), n("Györffy", "Ágnes"), n("Hegedűs", "J."), n("Horváth", "Ferenc"),
      n("Hőgye-Nagy", "Ágnes"), n("Kurucz", "Győző"), n("Malét-Szabó", "E."), n("Münnich", "Ákos"),
      n("Németh", "Ferenc"), n("Petró", "C."), n("Zalai", "Noémi"),
    ],
    publisher: null,
  },
  // Capitals in the export.
  tanyi2021alvasminoseg: { title: "Alvásminőség és élettel való elégedettség együtt élő párok körében" },
  olaszy2005adatbazisok: { title: "Adatbázisok és számítógépprogramok a magyar beszéd időszerkezeti vizsgálatához" },
  // Publishers missing from or misnamed in the export.
  abari2025adatkezeles: { publisher: "Debreceni Egyetemi Kiadó" },
  abari2025jatekos: { publisher: "Oriold és Társai" },
  anon2020valsagok: { publisher: "Oriold és Társai" },
  anon2019innovacio: { publisher: "Oriold és Társai" },
  munnich2006tobbvaltozos: { publisher: null },
  abari2013formansmozgasok: { publisher: "Debreceni Egyetem", genre: "Doctoral dissertation" },
};

/** Export "publishers" that are really repositories; dropped from the reference. */
export const notPublishers = [
  "University of Debrecen Electronic Archive (University of Debrecen)",
  "Repository of the Academy’s Library (Library of the Hungarian Academy of Sciences)",
  "Repository of the Academy's Library (Library of the Hungarian Academy of Sciences)",
];
