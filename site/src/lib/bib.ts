// Publications: read the MTMT export (src/data/publications.bib + publications.csv),
// apply the corrections in src/data/publication-fixes.ts, and format every entry in APA 7.
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import bibSource from "../data/publications.bib?raw";
import csvSource from "../data/publications.csv?raw";
import { containerNames, entryFixes, notPublishers } from "../data/publication-fixes";
import { topicByName, type TopicId } from "../data/research";
import { downloadLinks } from "../data/publication-links";

export type PubType = "book" | "edited" | "chapter" | "article" | "conference" | "abstract" | "thesis" | "other";
/** Order of the "by type" view. */
export const pubTypes: PubType[] = ["book", "edited", "chapter", "article", "conference", "abstract", "thesis", "other"];

export interface Publication {
  id: string;
  year: number;
  type: PubType;
  topic: TopicId | null;
  scopus: boolean;
  /** MTMT record of the item (shown as a quiet link next to the reference). */
  mtmt: string | null;
  /** Free download / publisher page, from src/data/publication-links.ts. */
  download: string | null;
  /** The APA 7 reference as HTML. */
  html: string;
}

/** Semicolon-separated CSV with quoted fields, as exported. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ";") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const isCaps = (s: string) => s === s.toUpperCase() && /[A-ZÁÉÍÓÖŐÚÜŰ]{3}/.test(s);
const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|[\s(–-])(\p{L})/gu, (_, p, l) => p + l.toUpperCase())
    .replace(/\b(And|Of|In|For|The|On|With|To|A|An|És|Az)\b/g, (w, _1, off) => (off === 0 ? w : w.toLowerCase()));
const dash = (s: string) => s.replace(/ - /g, " – ");
const cleanUrl = (s: string) => s.replace(/\\/g, "").replace(/%5C/gi, "");
const isMtmt = (s: string) => /m2\.mtmt\.hu/.test(s);

function fix(entry: any, language: string) {
  const f = entryFixes[entry.id] ?? {};
  // APA title-cases English container titles; Hungarian ones keep their own capitalisation.
  const keepCase = language !== "Angol";
  if (f.author) entry.author = f.author;
  if (f.editor) entry.editor = f.editor;
  if (f.title) entry.title = f.title;
  if (f.genre) entry.genre = f.genre;
  if (entry.title) entry.title = dash(isCaps(entry.title) ? titleCase(entry.title) : entry.title);
  for (const key of ["container-title", "collection-title", "event-title"]) {
    const v = entry[key];
    if (!v) continue;
    const name = dash(containerNames[v] ?? (isCaps(v) ? titleCase(v) : v)).replace(/\s+:\s+/g, ": ");
    entry[key] = keepCase ? `<span class="nocase">${name}</span>` : name;
  }
  if (entry.publisher && notPublishers.includes(entry.publisher)) delete entry.publisher;
  if ("publisher" in f) { if (f.publisher) entry.publisher = f.publisher; else delete entry.publisher; }
  if (entry.DOI) entry.DOI = cleanUrl(entry.DOI);
  const url = entry.URL ? cleanUrl(entry.URL) : null;
  delete entry.URL; // MTMT/OpenAlex records are not retrieval sources; the MTMT link is shown separately
  if (url && !isMtmt(url) && !/openalex\.org/.test(url)) entry.URL = url;
  delete entry.note;
  // An edited book's page count is not a page range.
  if (entry.type === "book") { delete entry.page; delete entry["number-of-pages"]; }
  return entry;
}

const OWN_NAME = /Abari, K\./g;

function format(entry: any): string {
  return new Cite(entry)
    .format("bibliography", { format: "html", template: "apa", lang: "en-US" })
    .replace(/^[\s\S]*?<div[^>]*class="csl-entry"[^>]*>/, "")
    .replace(/<\/div>\s*<\/div>\s*$/, "")
    .trim()
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;])/g, '<a href="$1">$1</a>')
    .replace(OWN_NAME, '<strong class="pw-me">Abari, K.</strong>');
}

const typeOf: Record<string, PubType> = {
  article: "article", chapter: "chapter", conference: "conference", book: "book",
  edited: "edited", abstract: "abstract", thesis: "thesis", other: "other",
};

function load(): Publication[] {
  const meta = new Map(parseCsv(csvSource).map((r) => [r.key, r]));
  return new Cite(bibSource).data
    .map((entry: any) => {
      const m = meta.get(entry.id);
      const mtmtUrl = m?.mtmt_id ? `https://m2.mtmt.hu/gui2/?type=publications&mode=browse&sel=${m.mtmt_id}` : null;
      const year = entry.issued?.["date-parts"]?.[0]?.[0] ?? (Number(m?.year) || 0);
      return {
        id: entry.id,
        year,
        type: typeOf[m?.type ?? ""] ?? "other",
        topic: m ? topicByName(m.terulet) : null,
        scopus: m?.scopus === "igen",
        mtmt: mtmtUrl,
        download: downloadLinks[entry.id] ?? null,
        html: format(fix(entry, m?.language ?? "")),
      } satisfies Publication;
    })
    .sort((a: Publication, b: Publication) => b.year - a.year);
}

export const publications: Publication[] = load();
export const byTopic = (id: TopicId) => publications.filter((p) => p.topic === id);
export const byType = (t: PubType) => publications.filter((p) => p.type === t);
export const years = [...new Set(publications.map((p) => p.year))].sort((a, b) => b - a);
export const byYear = (y: number) => publications.filter((p) => p.year === y);
