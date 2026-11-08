import type { ImageMetadata } from "astro";
import jatekosEn from "../assets/covers/a-jatekos-en.jpg";
import pszichStat from "../assets/covers/pszichologiai-statisztika.jpg";
import adatkezeles from "../assets/covers/adatkezeles-r-ben.jpg";

/** Home page: featured books (with cover) and featured publications, by BibTeX key. */
export interface FeaturedBook {
  key: string;
  /** Cover image (src/assets/covers/…). Without one, a typographic cover is drawn. */
  cover?: ImageMetadata;
  /** Short title and publisher for the drawn cover. */
  title: string;
  publisher: string;
}

export const featuredBooks: FeaturedBook[] = [
  { key: "abari2025jatekos", cover: jatekosEn, title: "A játékos én", publisher: "Oriold és Társai" },
  { key: "abari2025pszichologiai", cover: pszichStat, title: "Pszichológiai statisztika", publisher: "Debreceni Egyetemi Kiadó" },
  { key: "abari2025adatkezeles", cover: adatkezeles, title: "Adatkezelés és egyváltozós elemzések R-ben", publisher: "Debreceni Egyetemi Kiadó" },
];

/** Shown in this order under the books. */
export const featuredPublications: string[] = [
  "gosy2026word",
  "abari2025informatikai",
  "abari2025adatelokeszites",
  "math2025kozepertekek",
  "gosy2025receptive",
  "abari2025reprodukalhato",
];
