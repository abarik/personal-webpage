import { getEntry, render } from "astro:content";
import type { Lang, PageId } from "./i18n";

/** Loads src/content/pages/<lang>/<id>.md: front matter plus the rendered body. */
export async function loadPage(lang: Lang, id: PageId) {
  const entry = await getEntry("pages", `${lang}/${id}`);
  if (!entry) throw new Error(`Missing page text: src/content/pages/${lang}/${id}.md`);
  const { Content } = await render(entry);
  return { ...entry.data, Content };
}
