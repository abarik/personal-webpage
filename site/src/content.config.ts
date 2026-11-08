import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Page texts in Markdown: src/content/pages/<lang>/<page>.md
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lead: z.string().optional(),
    /** A short notice shown under the heading (e.g. "work in progress"). */
    notice: z.string().optional(),
  }),
});

// Research areas shown on the home page and the research page.
export const collections = { pages };
