// @ts-check
import { defineConfig } from "astro/config";
import rehypeSections from "./src/lib/rehype-sections.mjs";

// GitHub Pages serves the repository's docs/ folder at
// https://abarik.github.io/personal-webpage/, so the build goes to ../docs
// and every URL is prefixed with the repository name.
export default defineConfig({
  site: "https://abarik.github.io",
  base: "/personal-webpage",
  trailingSlash: "always",
  outDir: "../docs",
  build: { format: "directory" },
  markdown: { rehypePlugins: [rehypeSections] },
  devToolbar: { enabled: false },
});
