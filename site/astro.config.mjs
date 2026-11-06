// @ts-check
import { defineConfig } from "astro/config";
import rehypeSections from "./src/lib/rehype-sections.mjs";

// GitHub Pages serves the repository's docs/ folder on the custom domain
// https://kalman.abari.hu/ (public/CNAME is copied into docs/ on every build,
// so the domain setting survives the build emptying docs/).
export default defineConfig({
  site: "https://kalman.abari.hu",
  base: "/",
  trailingSlash: "always",
  outDir: "../docs",
  build: { format: "directory" },
  markdown: { rehypePlugins: [rehypeSections] },
  devToolbar: { enabled: false },
  // Pages that moved: the old addresses forward to the new ones.
  redirects: {
    "/oktatas/kurzusok/": "/oktatas/",
    "/en/teaching/courses/": "/en/teaching/",
  },
});
