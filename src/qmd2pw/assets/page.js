// Language and theme toggles, and highlighting of the current section in the navigation.
(() => {
  const root = document.documentElement;
  const data = JSON.parse(document.getElementById("pw-i18n").textContent);
  const store = {
    get(key) { try { return localStorage.getItem("qmd2pw:" + key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem("qmd2pw:" + key, value); } catch { /* storage unavailable */ } },
  };

  // Language: elements whose lang differs from html[data-lang] are hidden by CSS.
  const langCode = document.querySelector(".pw-lang-code");
  function applyLang(lang) {
    const s = data.strings[lang];
    if (!s) return;
    root.lang = lang;
    root.dataset.lang = lang;
    if (s.title) document.title = s.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && s.description) description.content = s.description;
    for (const el of document.querySelectorAll("[data-i18n-label]")) {
      const label = s[el.dataset.i18nLabel];
      if (!label) continue;
      el.setAttribute("aria-label", label);
      if (el.tagName === "BUTTON") el.title = label;
    }
    if (langCode) langCode.textContent = s.next_code;
  }

  const langButton = document.querySelector(".pw-lang-toggle");
  if (langButton) {
    langButton.hidden = false;
    langButton.addEventListener("click", () => {
      const next = (data.strings[root.dataset.lang] || {}).next_lang || data.langs[0];
      applyLang(next);
      store.set("lang", next);
    });
  }
  applyLang(data.strings[root.dataset.lang] ? root.dataset.lang : data.langs[0]);

  // Theme
  const themeButton = document.querySelector(".pw-theme-toggle");
  const themeSheets = document.querySelectorAll("[data-theme-css]");
  function applyTheme(theme) {
    root.dataset.theme = theme;
    for (const el of themeSheets) el.media = el.dataset.themeCss === theme ? "all" : "not all";
    if (themeButton) themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  }
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("theme", next);
    });
  }
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
  if (window.matchMedia) {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      if (!store.get("theme") && root.dataset.defaultTheme === "auto") applyTheme(event.matches ? "dark" : "light");
    });
  }

  // Current section in the navigation
  const links = new Map();
  for (const a of document.querySelectorAll('.pw-nav a[href^="#"]')) {
    const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (target) links.set(target, a);
  }
  if ("IntersectionObserver" in window && links.size) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of links.values()) a.removeAttribute("aria-current");
        links.get(entry.target).setAttribute("aria-current", "true");
      }
    }, { rootMargin: "-35% 0px -60% 0px" });
    for (const target of links.keys()) observer.observe(target);
  }
})();
