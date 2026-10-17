# qmd2pw — Quarto Markdown to PersonalWebPage

`qmd2pw` turns a standalone [Quarto](https://quarto.org) document (`.qmd`) into a
single-page personal website for university lecturers. The page is bilingual
(Hungarian and English by default), has light and dark themes, and you can restyle
it with external CSS files the same way you would in Quarto.

You don't need Quarto or Pandoc installed to use it.

## Installation

```sh
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"   # Windows
# .venv/bin/python -m pip install -e ".[dev]"     # Linux / macOS
```

## Usage

```sh
qmd2pw version1.0/index.qmd                # writes version1.0/index.html
qmd2pw page.qmd -o site/index.html         # explicit output file
qmd2pw page.qmd --css extra.css            # extra stylesheet, applied last
qmd2pw page.qmd --embed-resources          # single self-contained HTML file
python -m qmd2pw page.qmd                  # same as the qmd2pw command
```

## Writing the document

Use the standard Quarto structure: YAML front matter, then Markdown with Pandoc
extensions. [`version1.0/index.qmd`](version1.0/index.qmd) is a complete example.

## Publishing

The repository serves its GitHub Pages site from the `docs/` folder. After you
change the source, render it straight into that folder:

```sh
qmd2pw version1.0/index.qmd -o docs/index.html
```

`docs/.nojekyll` stops GitHub Pages from running the file through Jekyll.

```yaml
---
title: "Dr. Minta Eszter"
subtitle: "[egyetemi docens]{lang=hu}[Associate Professor]{lang=en}"
description: "..."                 # <meta name="description">
author:
  - name: Dr. Minta Eszter
    affiliations:
      - name: "[Példa Tudományegyetem]{lang=hu}[University of Példa]{lang=en}"
        department: "..."
date-modified: last-modified       # or today, or 2026-10-17
lang: hu                           # default language
image: images/profile.jpg          # profile photo
about:                             # Quarto "about page" options
  template: trestles               # trestles/solana: side layout; jolla/marquee/broadside: centred
  image-shape: rounded             # round | rounded | rectangle
  links:
    - icon: envelope               # Bootstrap Icons names
      text: E-mail
      href: mailto:someone@example.org
format:
  html:
    css: styles/custom.css         # one file or a list
    theme:                         # optional: separate light and dark stylesheets
      light: styles/light.css
      dark: styles/dark.css
    embed-resources: true          # inline the CSS and images
qmd2pw:
  languages: [hu, en]
  default-theme: auto              # auto | light | dark
  detect-language: true            # use the browser language on the first visit
---
```

- **Sections:** each top-level heading (usually `##`) becomes a section of the page
  and an entry in the navigation bar. Give it an id with `{#research}`. Add the
  `.unlisted` class to keep a section out of the navigation. Any text before the
  first heading appears in the header area, next to the profile photo.
- **Bilingual content:** write longer passages as fenced divs, `::: {lang="hu"}` …
  `:::`, and short text as spans: `[Kutatás]{lang=hu}[Research]{lang=en}`. The
  language button switches between them. Content without a `lang` attribute shows
  in every language.
- **Quarto features:** callouts (`::: {.callout-note}`, with the title taken from a
  leading heading or `title="..."`), columns (`:::: {.columns}` / `::: {.column width="50%"}`),
  pipe tables, definition lists, `{{< meta key >}}`, `include-in-header`,
  `include-before-body`, `include-after-body`.
- **Not supported:** executable code chunks (` ```{python} `) aren't run; their
  source is shown as code. SCSS files and Bootswatch theme names aren't supported
  either; use plain CSS.

## Customising the look

The built-in style uses CSS custom properties (`--pw-accent`, `--pw-bg`,
`--pw-font-heading`, …), defined in
[`src/qmd2pw/assets/base.css`](src/qmd2pw/assets/base.css). Stylesheets listed
under `css:` load after it, so you can override those properties in one place:

```css
:root { --pw-accent: #8a1538; }
html[data-theme="dark"] { --pw-accent: #e88aa5; }
```

`theme: none` turns off the built-in style completely.

## Tests

```sh
.venv/Scripts/python -m pytest
```

## License

MIT, see [LICENSE](LICENSE).
