// Language and theme toggles, current-section highlighting, and the page's motion layer.
// Everything here is an enhancement: without JavaScript the page shows all content.
(() => {
  const root = document.documentElement;
  const data = JSON.parse(document.getElementById("pw-i18n").textContent);
  const store = {
    get(key) { try { return localStorage.getItem("qmd2pw:" + key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem("qmd2pw:" + key, value); } catch { /* storage unavailable */ } },
  };
  const reducedMotion = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  // Runs a DOM change inside a view transition when the browser supports it.
  // `kind` selects the transition style in base.css (html.pw-vt-<kind>).
  function transition(kind, change, origin) {
    if (!document.startViewTransition || document.hidden) { change(); return; }
    if (origin) {
      const r = origin.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.style.setProperty("--pw-vt-x", x + "px");
      root.style.setProperty("--pw-vt-y", y + "px");
      root.style.setProperty("--pw-vt-r", radius + "px");
    }
    root.classList.add("pw-vt-" + kind);
    const vt = document.startViewTransition(change);
    vt.finished.finally(() => root.classList.remove("pw-vt-" + kind));
  }

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
      transition("lang", () => { applyLang(next); updateIndicator(false); });
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
      transition("theme", () => applyTheme(next), themeButton);
      store.set("theme", next);
    });
  }
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
  if (window.matchMedia) {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      if (!store.get("theme") && root.dataset.defaultTheme === "auto") applyTheme(event.matches ? "dark" : "light");
    });
  }

  // Top bar: a hairline once the page scrolls, and the name appears once the hero's name has left.
  const topbar = document.querySelector(".pw-topbar");
  const heroTitle = document.querySelector(".pw-hero .pw-title");
  if (topbar && "IntersectionObserver" in window) {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      topbar.dataset.scrolled = String(!entry.isIntersecting);
    }).observe(sentinel);
    if (heroTitle) {
      if (heroTitle.getBoundingClientRect().bottom > topbar.offsetHeight) topbar.dataset.brand = "hidden";
      new IntersectionObserver(([entry]) => {
        topbar.dataset.brand = entry.isIntersecting ? "hidden" : "shown";
      }, { rootMargin: "-" + topbar.offsetHeight + "px 0px 0px 0px" }).observe(heroTitle);
    }
  }

  // Current section in the navigation, marked by one pill that glides between links.
  const nav = document.querySelector(".pw-nav");
  const links = new Map();
  for (const a of document.querySelectorAll('.pw-nav a[href^="#"]')) {
    const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (target) links.set(target, a);
  }
  let indicator = null;
  const list = nav && nav.querySelector("ul");
  if (list && links.size) {
    indicator = document.createElement("span");
    indicator.className = "pw-nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    list.prepend(indicator);
    nav.classList.add("has-indicator");
  }
  function updateIndicator(animate = true) {
    if (!indicator) return;
    const current = nav.querySelector('a[aria-current="true"]');
    if (!current) { indicator.classList.remove("is-on"); return; }
    if (!animate || !indicator.classList.contains("is-on")) indicator.style.transition = "none";
    indicator.style.transform = `translateX(${current.offsetLeft}px)`;
    indicator.style.width = current.offsetWidth + "px";
    indicator.classList.add("is-on");
    indicator.offsetWidth; // commit the jump before re-enabling transitions
    indicator.style.transition = "";
    if (nav.scrollWidth > nav.clientWidth) {
      const left = current.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2;
      nav.scrollTo({ left, behavior: reducedMotion.matches ? "auto" : "smooth" });
    }
  }
  if ("IntersectionObserver" in window && links.size) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of links.values()) a.removeAttribute("aria-current");
        links.get(entry.target).setAttribute("aria-current", "true");
        updateIndicator();
      }
    }, { rootMargin: "-35% 0px -60% 0px" });
    for (const target of links.keys()) observer.observe(target);
    addEventListener("resize", () => updateIndicator(false));
    if (document.fonts) document.fonts.ready.then(() => updateIndicator(false));
  }

  // Sections reveal once as they come into view. Only sections that start below the
  // fold are hidden, so nothing visible on load ever disappears.
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const pending = [...document.querySelectorAll(".pw-section")]
      .filter((section) => section.getBoundingClientRect().top > innerHeight * 0.92);
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.dataset.reveal = "shown";
        reveal.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    for (const section of pending) {
      section.dataset.reveal = "pending";
      reveal.observe(section);
    }
    // Jumping to a section from the navigation must never land on an empty one.
    addEventListener("hashchange", () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const section = target && target.closest(".pw-section");
      if (section && section.dataset.reveal === "pending") section.dataset.reveal = "shown";
    });
    addEventListener("beforeprint", () => {
      for (const section of pending) section.dataset.reveal = "shown";
    });
  }
})();
