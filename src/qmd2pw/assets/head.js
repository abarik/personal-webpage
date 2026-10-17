// Runs before first paint: picks the language and colour theme so the page does not flicker.
(() => {
  const root = document.documentElement;
  const langs = (root.dataset.langs || "").split(" ").filter(Boolean);
  const stored = (key) => {
    try { return localStorage.getItem("qmd2pw:" + key); } catch { return null; }
  };

  let lang = null;
  try { lang = (new URLSearchParams(location.search).get("lang") || "").toLowerCase(); } catch { /* no URL API */ }
  if (!langs.includes(lang)) lang = stored("lang");
  if (!langs.includes(lang) && root.dataset.detectLang === "true") {
    lang = (navigator.languages || [navigator.language])
      .map((l) => String(l).toLowerCase().split("-")[0])
      .find((l) => langs.includes(l)) || null;
  }
  if (langs.includes(lang)) {
    root.lang = lang;
    root.dataset.lang = lang;
  }

  let theme = stored("theme");
  if (theme !== "light" && theme !== "dark") theme = root.dataset.defaultTheme;
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  root.dataset.theme = theme;
  for (const el of document.querySelectorAll("[data-theme-css]")) {
    el.media = el.dataset.themeCss === theme ? "all" : "not all";
  }
})();
