import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import source from "../data/publications.bib?raw";

export interface Publication {
  id: string;
  year: number;
  kind: "book" | "paper";
  html: string;
}

const OWN_NAME = /Abari, K\./g;

/** Reads src/data/publications.bib once and formats every entry in APA style. */
function load(): Publication[] {
  const cite = new Cite(source);
  return cite.data
    .map((entry: any) => {
      const html = new Cite(entry)
        .format("bibliography", { format: "html", template: "apa", lang: "en-US" })
        .replace(/^[\s\S]*?<div[^>]*class="csl-entry"[^>]*>/, "")
        .replace(/<\/div>\s*<\/div>\s*$/, "")
        .trim()
        .replace(OWN_NAME, '<strong class="pw-me">Abari, K.</strong>');
      return {
        id: entry.id,
        year: entry.issued?.["date-parts"]?.[0]?.[0] ?? 0,
        kind: entry.type === "book" ? "book" : "paper",
        html,
      } satisfies Publication;
    })
    .sort((a: Publication, b: Publication) => b.year - a.year);
}

export const publications: Publication[] = load();
export const books = publications.filter((p) => p.kind === "book");
export const papers = publications.filter((p) => p.kind === "paper");
