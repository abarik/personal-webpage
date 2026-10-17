"""Assembling the single-page HTML document from a Quarto document."""

from __future__ import annotations

import base64
import json
import mimetypes
import os
import re
from dataclasses import dataclass, field
from datetime import date
from html import escape, unescape
from importlib import resources
from pathlib import Path
from typing import Callable
from urllib.parse import unquote

from .blocks import split_sections
from .document import QmdDocument, QmdError, load_qmd
from .i18n import format_date, language_name, parse_date, text_for_lang, ui_strings
from .icons import icon
from .markdown import IdRegistry, Renderer

# Quarto "about" templates mapped onto the two qmd2pw hero layouts.
_HERO_LAYOUTS = {"jolla": "centered", "marquee": "centered", "broadside": "centered",
                 "trestles": "side", "solana": "side"}
_IMAGE_SHAPES = ("round", "rounded", "rectangle")

_EXTERNAL = re.compile(r"^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|//|#|/)")
_CSS_URL = re.compile(r"""url\(\s*(['"]?)(.*?)\1\s*\)""")
_IMG_SRC = re.compile(r'(<(?:img|source)\b[^>]*?\ssrc=")([^"]*)(")')
_A_HREF = re.compile(r'(<a\b[^>]*?\shref=")([^"]*)(")')


@dataclass
class BuildResult:
    output: Path
    html: str
    warnings: list[str] = field(default_factory=list)


@dataclass
class Settings:
    output: Path
    langs: list[str]
    default_lang: str
    default_theme: str  # auto | light | dark
    detect_lang: bool
    embed: bool
    base_style: bool
    css: list[Path]
    theme_light: list[Path]
    theme_dark: list[Path]
    options: dict  # top-level metadata overlaid with format.html options


def build(
    input_path: str | Path,
    output: str | Path | None = None,
    *,
    extra_css: list[Path] | tuple[Path, ...] = (),
    embed: bool | None = None,
) -> BuildResult:
    """Render ``input_path`` and write the HTML page; returns where and what was written."""
    doc = load_qmd(input_path)
    warnings: list[str] = []
    settings = resolve_settings(doc, Path(output) if output else None, extra_css, embed, warnings.append)
    html = _Page(doc, settings, warnings.append).render()
    try:
        settings.output.parent.mkdir(parents=True, exist_ok=True)
        settings.output.write_text(html, encoding="utf-8", newline="\n")
    except OSError as exc:
        raise QmdError(f"cannot write {settings.output}: {exc.strerror or exc}") from exc
    return BuildResult(settings.output, html, warnings)


# -- settings ----------------------------------------------------------------

def _as_list(value) -> list:
    if value is None:
        return []
    return list(value) if isinstance(value, (list, tuple)) else [value]


def _html_options(meta: dict, warn: Callable[[str], None]) -> dict:
    fmt = meta.get("format")
    html = None
    if isinstance(fmt, str) and fmt != "html":
        warn(f"format '{fmt}' is not supported; rendering as html")
    elif isinstance(fmt, dict):
        if "html" not in fmt:
            warn("the front matter defines no 'html' format; using html defaults")
        html = fmt.get("html")
    # Quarto accepts format options at the top level too; format.html wins.
    options = {k: v for k, v in meta.items() if k != "format"}
    if isinstance(html, dict):
        options.update(html)
    return options


def _themes(value, base_dir: Path, warn: Callable[[str], None]) -> tuple[list[Path], list[Path], bool]:
    base_style = True

    def files(spec) -> list[Path]:
        nonlocal base_style
        out = []
        for item in _as_list(spec):
            name = str(item)
            if name == "none":
                base_style = False
            elif name.lower().endswith(".css"):
                out.append(base_dir / name)
            elif name.lower().endswith(".scss"):
                warn(f"theme '{name}': SCSS is not supported; compile it to CSS and list the .css file")
            elif name != "default":
                warn(f"theme '{name}': Bootswatch themes are not bundled; the qmd2pw base style is used")
        return out

    if isinstance(value, dict):
        light, dark = files(value.get("light")), files(value.get("dark"))
    else:
        light, dark = files(value), []
    return light, dark, base_style


def resolve_settings(
    doc: QmdDocument,
    output: Path | None,
    extra_css,
    embed: bool | None,
    warn: Callable[[str], None],
) -> Settings:
    opts = _html_options(doc.meta, warn)
    base_dir = doc.path.parent

    tool = opts.get("qmd2pw") or {}
    if not isinstance(tool, dict):
        warn("'qmd2pw' must be a mapping; ignored")
        tool = {}

    langs = [str(x).strip().lower() for x in _as_list(tool.get("languages")) if str(x).strip()]
    default_lang = str(opts.get("lang") or "").strip().lower() or (langs[0] if langs else "en")
    if default_lang not in langs:
        langs.insert(0, default_lang)

    default_theme = str(tool.get("default-theme", "auto")).lower()
    if default_theme not in ("auto", "light", "dark"):
        warn(f"qmd2pw.default-theme '{default_theme}' is not auto, light or dark; using auto")
        default_theme = "auto"

    light, dark, base_style = _themes(opts.get("theme"), base_dir, warn)
    css = [base_dir / str(p) for p in _as_list(opts.get("css"))] + [Path(p) for p in extra_css]

    if output is None:
        name = str(opts.get("output-file") or doc.path.stem)
        output = base_dir / (name if Path(name).suffix else name + ".html")
    if embed is None:
        embed = bool(opts.get("embed-resources", opts.get("self-contained", False)))

    return Settings(
        output=output,
        langs=langs,
        default_lang=default_lang,
        default_theme=default_theme,
        detect_lang=bool(tool.get("detect-language", True)),
        embed=embed,
        base_style=base_style,
        css=css,
        theme_light=light,
        theme_dark=dark,
        options=opts,
    )


# -- resources -----------------------------------------------------------------

def _asset(name: str) -> str:
    return resources.files("qmd2pw").joinpath("assets", name).read_text(encoding="utf-8")


def _data_uri(path: Path) -> str:
    mime = "image/svg+xml" if path.suffix.lower() == ".svg" else mimetypes.guess_type(path.name)[0]
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime or 'application/octet-stream'};base64,{payload}"


def _split_ref(ref: str) -> tuple[str, str]:
    path = re.split(r"[?#]", ref, maxsplit=1)[0]
    return path, ref[len(path):]


class _Resources:
    """Resolves file references in the source against the output location."""

    def __init__(self, src_dir: Path, out_dir: Path, embed: bool, warn: Callable[[str], None]):
        self.src_dir = src_dir.resolve()
        self.out_dir = out_dir.resolve()
        self.embed = embed
        self.warn = warn

    def relative(self, path: Path) -> str:
        try:
            return os.path.relpath(path.resolve(), self.out_dir).replace(os.sep, "/")
        except ValueError:  # different drive on Windows
            return path.resolve().as_uri()

    def link(self, ref: str, base: Path | None = None) -> str:
        """URL for ``ref`` that works from the output file."""
        base = (base or self.src_dir).resolve()
        if not ref or _EXTERNAL.match(ref) or base == self.out_dir:
            return ref
        path, suffix = _split_ref(ref)
        return self.relative(base / unquote(path)) + suffix

    def embedded(self, ref: str, base: Path | None = None) -> str:
        """A data URI for ``ref`` when embedding resources, otherwise a link."""
        if not self.embed or not ref or _EXTERNAL.match(ref):
            return self.link(ref, base)
        path = (base or self.src_dir) / unquote(_split_ref(ref)[0])
        if path.is_file():
            return _data_uri(path)
        self.warn(f"resource not found, left as a link: {ref}")
        return self.link(ref, base)


# -- page --------------------------------------------------------------------

class _Page:
    def __init__(self, doc: QmdDocument, settings: Settings, warn: Callable[[str], None]):
        self.doc = doc
        self.s = settings
        self.opts = settings.options
        self.warn = warn
        self.res = _Resources(doc.path.parent, settings.output.parent, settings.embed, warn)
        self.ids = IdRegistry(reserved=("top", "main", "pw-i18n"))

    # helpers

    def ui(self, key: str) -> str:
        """Visible interface text: one span per language, the inactive ones hidden by CSS."""
        if len(self.s.langs) == 1:
            return escape(ui_strings(self.s.langs[0])[key])
        return "".join(f'<span lang="{lang}">{escape(ui_strings(lang)[key])}</span>' for lang in self.s.langs)

    def _stylesheet(self, path: Path, attrs: str = "") -> str:
        if not path.is_file():
            self.warn(f"stylesheet not found: {path}")
            if self.s.embed:
                return ""
        if not self.s.embed:
            return f'<link rel="stylesheet" href="{escape(self.res.relative(path))}"{attrs}>'
        text = path.read_text(encoding="utf-8")
        text = _CSS_URL.sub(lambda m: f'url("{self.res.embedded(m[2], path.parent)}")', text)
        text = text.replace("</style", "<\\/style")
        return f"<style{attrs}>\n{text}\n</style>"

    def _theme_media(self, theme: str) -> str:
        if self.s.default_theme == "auto":
            return "(prefers-color-scheme: dark)" if theme == "dark" else "not all and (prefers-color-scheme: dark)"
        return "all" if theme == self.s.default_theme else "not all"

    def _includes(self, key: str) -> str:
        out = []
        for item in _as_list(self.opts.get(key)):
            if isinstance(item, dict) and "text" in item:
                out.append(str(item["text"]))
                continue
            name = item.get("file") if isinstance(item, dict) else item
            path = self.doc.path.parent / str(name)
            try:
                out.append(path.read_text(encoding="utf-8"))
            except OSError:
                self.warn(f"{key}: cannot read {path}")
        return "\n".join(out)

    def _rewrite_resources(self, html: str) -> str:
        html = _IMG_SRC.sub(lambda m: m[1] + escape(self.res.embedded(unescape(m[2]))) + m[3], html)
        return _A_HREF.sub(lambda m: m[1] + escape(self.res.link(unescape(m[2]))) + m[3], html)

    # metadata

    def _author(self) -> dict:
        author = self.opts.get("author")
        if isinstance(author, list):
            author = author[0] if author else None
        if isinstance(author, str):
            return {"name": author}
        if not isinstance(author, dict):
            return {}
        name = author.get("name")
        if isinstance(name, dict):
            name = name.get("literal") or " ".join(str(p) for p in (name.get("given"), name.get("family")) if p)
        return {**author, "name": str(name or "")}

    def _affiliations(self, r: Renderer, author: dict) -> list[str]:
        out = []
        for aff in _as_list(author.get("affiliations") or author.get("affiliation")):
            if isinstance(aff, dict):
                parts = [aff.get("department"), aff.get("name")]
                out.append(", ".join(r.inline(p) for p in parts if p))
            elif aff:
                out.append(r.inline(aff))
        return [a for a in out if a]

    # rendering

    def render(self) -> str:
        level, sections = split_sections(self.doc.body)
        r = Renderer(self.doc.meta, self.s.default_lang, self.warn, self.ui,
                     heading_shift=2 - level, ids=self.ids)

        author = self._author()
        name = author.get("name", "")
        title_html = r.inline(self.opts["title"]) if self.opts.get("title") else escape(name)
        pagetitle = self.opts.get("pagetitle")
        pagetitle_html = r.inline(pagetitle) if pagetitle else title_html
        desc_html = r.inline(self.opts["description"]) if self.opts.get("description") else ""

        intro = r.blocks(sections[0].body) if sections[0].body.strip() else ""
        nav_items, section_html = [], []
        for sec in sections[1:]:
            heading = r.inline(sec.title)
            sec.attrs.id = r.element_id(sec.attrs, heading)
            body = r.blocks(sec.body)
            section_html.append(
                f'<section{sec.attrs.to_html(extra_classes=["pw-section"])}>\n'
                f"<h2>{heading}</h2>\n{body}</section>"
            )
            if "unlisted" not in sec.attrs.classes:
                lang = sec.attrs.pairs.get("lang")
                lang_attr = f' lang="{escape(lang)}"' if lang else ""
                nav_items.append(f'<li{lang_attr}><a href="#{escape(sec.attrs.id)}">{heading}</a></li>')

        strings = self._strings(pagetitle_html, desc_html, name)
        lang = self.s.default_lang
        body = "\n".join([
            f'<a class="pw-skip" href="#main">{self.ui("skip")}</a>',
            self._topbar(title_html, nav_items, strings[lang]),
            '<main id="main" class="pw-main">',
            self._hero(r, author, title_html, intro),
            *section_html,
            "</main>",
            self._footer(r, name),
        ])
        body = self._rewrite_resources(body)

        i18n = json.dumps({"langs": self.s.langs, "strings": strings}, ensure_ascii=False).replace("</", "<\\/")
        return "\n".join(filter(None, [
            "<!DOCTYPE html>",
            self._html_open(),
            "<head>",
            '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            f"<title>{escape(strings[lang]['title'])}</title>",
            f'<meta name="description" content="{escape(strings[lang]["description"])}">'
            if strings[lang]["description"] else "",
            f'<meta name="author" content="{escape(name)}">' if name else "",
            '<meta name="generator" content="qmd2pw">',
            self._head_styles(),
            f"<script>\n{_asset('head.js')}</script>",
            self._includes("include-in-header"),
            "</head>",
            "<body>",
            self._includes("include-before-body"),
            body,
            f'<script type="application/json" id="pw-i18n">{i18n}</script>',
            f"<script>\n{_asset('page.js')}</script>",
            self._includes("include-after-body"),
            "</body>",
            "</html>",
            "",
        ]))

    def _html_open(self) -> str:
        s = self.s
        theme_attr = f' data-theme="{s.default_theme}"' if s.default_theme != "auto" else ""
        return (
            f'<html lang="{escape(s.default_lang)}" data-lang="{escape(s.default_lang)}" '
            f'data-langs="{escape(" ".join(s.langs))}" data-default-theme="{s.default_theme}" '
            f'data-detect-lang="{str(s.detect_lang).lower()}"{theme_attr}>'
        )

    def _head_styles(self) -> str:
        langs = self.s.langs
        rules = [f'html[data-lang="{a}"] body [lang|="{b}"]' for a in langs for b in langs if a != b]
        selectors = ",\n".join(rules)
        parts = [f"<style>\n{selectors} {{ display: none !important; }}\n</style>" if rules else ""]
        if self.s.base_style:
            parts.append(f"<style>\n{_asset('base.css')}</style>")
        for theme, files in (("light", self.s.theme_light), ("dark", self.s.theme_dark)):
            attrs = f' data-theme-css="{theme}" media="{self._theme_media(theme)}"' if self.s.theme_dark else ""
            parts.extend(self._stylesheet(p, attrs) for p in files)
        parts.extend(self._stylesheet(p) for p in self.s.css)
        return "\n".join(p for p in parts if p)

    def _strings(self, title_html: str, desc_html: str, name: str) -> dict:
        langs = self.s.langs
        out = {}
        for i, lang in enumerate(langs):
            ui = ui_strings(lang)
            nxt = langs[(i + 1) % len(langs)]
            out[lang] = {
                "title": text_for_lang(title_html, lang) or name,
                "description": text_for_lang(desc_html, lang),
                "nav": ui["nav"],
                "dark_mode": ui["dark_mode"],
                "switch_lang": ui["switch_lang"].format(name=language_name(nxt, lang)),
                "next_lang": nxt,
                "next_code": nxt.split("-")[0].upper(),
            }
        return out

    def _topbar(self, title_html: str, nav_items: list[str], strings: dict) -> str:
        nav = ""
        if nav_items:
            nav = (f'<nav class="pw-nav" aria-label="{escape(strings["nav"])}" data-i18n-label="nav">'
                   f'<ul>{"".join(nav_items)}</ul></nav>')
        lang_btn = ""
        if len(self.s.langs) > 1:
            lang_btn = (
                f'<button type="button" class="pw-btn pw-lang-toggle" data-i18n-label="switch_lang" '
                f'aria-label="{escape(strings["switch_lang"])}" hidden>'
                f'<span class="pw-lang-code">{escape(strings["next_code"])}</span></button>'
            )
        theme_btn = (
            f'<button type="button" class="pw-btn pw-theme-toggle" data-i18n-label="dark_mode" '
            f'aria-label="{escape(strings["dark_mode"])}" aria-pressed="false" hidden>'
            f'{icon("moon", "pw-icon-moon")}{icon("sun", "pw-icon-sun")}</button>'
        )
        return (
            '<header class="pw-topbar"><div class="pw-topbar-inner">'
            f'<a class="pw-brand" href="#top">{title_html}</a>{nav}'
            f'<div class="pw-actions">{lang_btn}{theme_btn}</div>'
            "</div></header>"
        )

    def _hero(self, r: Renderer, author: dict, title_html: str, intro: str) -> str:
        about = self.opts.get("about") or {}
        if not isinstance(about, dict):
            about = {"template": about}
        layout = _HERO_LAYOUTS.get(str(about.get("template", "trestles")), "side")
        shape = str(about.get("image-shape", "rounded"))
        if shape not in _IMAGE_SHAPES:
            shape = "rounded"

        parts = []
        image = self.opts.get("image") or about.get("image")
        if image:
            alt = self.opts.get("image-alt") or author.get("name") or ""
            parts.append(f'<img class="pw-avatar pw-avatar--{shape}" src="{escape(str(image))}" alt="{escape(str(alt))}">')

        text = [f'<h1 class="pw-title">{title_html}</h1>']
        if self.opts.get("subtitle"):
            text.append(f'<p class="pw-subtitle">{r.inline(self.opts["subtitle"])}</p>')
        affiliations = self._affiliations(r, author)
        if affiliations:
            text.append('<p class="pw-affiliation">'
                        + "".join(f'<span class="pw-aff">{a}</span>' for a in affiliations) + "</p>")
        links = self._links(r, about.get("links"))
        if links:
            text.append(links)
        if intro:
            text.append(f'<div class="pw-intro">\n{intro}</div>')
        parts.append(f'<div class="pw-hero-text">{"".join(text)}</div>')
        return f'<section id="top" class="pw-hero pw-hero--{layout}">{"".join(parts)}</section>'

    def _links(self, r: Renderer, links) -> str:
        items = []
        for link in _as_list(links):
            if not isinstance(link, dict) or not link.get("href"):
                self.warn("about.links entries need at least an 'href'")
                continue
            href = str(link["href"])
            text = r.inline(link.get("text") or link.get("icon") or href)
            label = link.get("aria-label")
            label_attr = f' aria-label="{escape(str(label))}"' if label else ""
            items.append(f'<li><a href="{escape(href)}"{label_attr}>{icon(link.get("icon"))}<span>{text}</span></a></li>')
        return f'<ul class="pw-links">{"".join(items)}</ul>' if items else ""

    def _footer(self, r: Renderer, name: str) -> str:
        modified = parse_date(self.opts.get("date-modified") or self.opts.get("date"), self.doc.path)
        year = modified.year if isinstance(modified, date) else date.today().year

        copyright_ = self.opts.get("copyright")
        if isinstance(copyright_, dict):
            holder = copyright_.get("holder") or name
            notice = f"© {escape(str(copyright_.get('year', year)))} {r.inline(holder)}"
        elif copyright_:
            notice = r.inline(copyright_)
        else:
            notice = f"© {year} {escape(name)}" if name else ""
        if isinstance(self.opts.get("license"), str):
            notice += f" · {r.inline(self.opts['license'])}"

        items = [f"<p>{notice}</p>"] if notice else []
        if modified is not None:
            iso = modified.isoformat() if isinstance(modified, date) else ""
            dates = "".join(f'<span lang="{l}">{escape(format_date(modified, l))}</span>' for l in self.s.langs) \
                if len(self.s.langs) > 1 else escape(format_date(modified, self.s.langs[0]))
            dt = f' datetime="{iso}"' if iso else ""
            items.append(f"<p>{self.ui('updated')}: <time{dt}>{dates}</time></p>")
        items.append(f'<p><a class="pw-backtop" href="#top">{self.ui("back_to_top")} ↑</a></p>')
        return f'<footer class="pw-footer"><div class="pw-footer-inner">{"".join(items)}</div></footer>'
