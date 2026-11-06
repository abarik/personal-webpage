import type { ImageMetadata } from "astro";
import type { Lang } from "../lib/i18n";
import referenceManagersSlide from "../assets/hivatkozaskezelok.jpg";

type T = Record<Lang, string>;
export interface VideoSeries {
  id: string;
  title: T;
  text: T;
  /** The playlist (or first video) the card opens. */
  href: string;
  /** A YouTube video id from the series; its thumbnail is shown on the card. */
  thumb?: string;
  /** A local still instead of a YouTube thumbnail (e.g. the series' title slide). */
  image?: ImageMetadata;
  /** Further materials next to the videos (e.g. a PDF). */
  extra?: { label: T; href: string }[];
}

/** Video series on the teaching page. */
export const videos: VideoSeries[] = [
  {
    id: "reference-managers",
    title: { hu: "Hivatkozáskezelők", en: "Reference managers" },
    text: {
      hu: "Videósorozat a hivatkozáskezelő programok használatáról, a Számítástechnika 1. kurzushoz. Mellé letölthető jegyzet is tartozik.",
      en: "A video series on using reference management software, for the Computing 1 course, with downloadable notes.",
    },
    href: "https://www.youtube.com/playlist?list=PLnmeQHnHYqv5jzYnu8i2Kh46Ti5g1bVCz",
    image: referenceManagersSlide,
    extra: [{ label: { hu: "Jegyzet (PDF)", en: "Notes (PDF)" }, href: "https://abarik.github.io/statisztika/files/hivatkozaskezelok.pdf" }],
  },
  {
    id: "jamovi",
    title: { hu: "jamovi a gyakorlatban", en: "jamovi in practice" },
    text: {
      hu: "Előadássorozat a jamovi statisztikai program gyakorlati használatáról.",
      en: "A lecture series on using the jamovi statistics software in practice.",
    },
    href: "https://www.youtube.com/watch?v=sZummF3Sd90&list=PLnmeQHnHYqv5_FoVOvX9tqE90EqoOW01o",
    thumb: "sZummF3Sd90",
  },
  {
    id: "r",
    title: { hu: "R a gyakorlatban", en: "R in practice" },
    text: {
      hu: "Videósorozat az R statisztikai programcsomag gyakorlati használatáról.",
      en: "A video series on using the R statistical software in practice.",
    },
    href: "https://www.youtube.com/watch?v=UBeiIKzE8VA&list=PLnmeQHnHYqv6ENGrdTXiE9YJrvHuxH2C9",
    thumb: "UBeiIKzE8VA",
  },
];
