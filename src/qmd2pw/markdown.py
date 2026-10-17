"""Markdown rendering with the Pandoc/Quarto extensions qmd2pw supports."""

from __future__ import annotations

import re
from typing import Callable

from markdown_it import MarkdownIt
from mdit_py_plugins.attrs import attrs_plugin
from mdit_py_plugins.deflist import deflist_plugin

from .blocks import (
    ATX_HEADING, CODE, FENCE_OPEN, TEXT, Attrs, Div, Node, classify_lines, parse_blocks, split_heading_attrs,
)
from .i18n import slugify, text_for_lang

CALLOUT_KINDS = ("note", "tip", "warning", "caution", "important")

_SHORTCODE = re.compile(r"\{\{<\s*(?P<name>[\w-]+)(?P<args>[^>]*?)\s*>\}\}")
_EXEC_FENCE = re.compile(r"^(?P<indent> {0,3})(?P<fence>`{3,}|~{3,})[ \t]*\{(?P<lang>[\w.+-]+)[^}]*\}[ \t]*$")
_CHUNK_OPTION = re.compile(r"^[ \t]*#\|")
_TABLE = re.compile(r"<table>(.*?)</table>", re.DOTALL)


class IdRegistry:
    """Keeps element ids unique across the page."""

    def __init__(self, reserved: tuple[str, ...] = ()):
        self.used = set(reserved)

    def claim(self, wanted: str) -> str:
        base = wanted or "section"
        candidate, n = base, 1
        while candidate in self.used:
            n += 1
            candidate = f"{base}-{n}"
        self.used.add(candidate)
        return candidate

    def claim_exact(self, wanted: str, warn: Callable[[str], None]) -> str:
        if wanted in self.used:
            warn(f"duplicate id '#{wanted}'")
        self.used.add(wanted)
        return wanted


class Renderer:
    def __init__(
        self,
        meta: dict,
        lang: str,
        warn: Callable[[str], None],
        ui: Callable[[str], str],
        heading_shift: int = 0,
        ids: IdRegistry | None = None,
    ):
        self.meta = meta
        self.lang = lang
        self.warn = warn
        self.ui = ui
        self.shift = heading_shift
        self.ids = ids or IdRegistry()
        self._warned_exec = False
        self.md = (
            MarkdownIt("commonmark", {"html": True, "typographer": True})
            .enable(["table", "strikethrough", "replacements"])
            .use(attrs_plugin, spans=True)
            .use(deflist_plugin)
        )

    # -- public API ---------------------------------------------------------

    def inline(self, text) -> str:
        return self.md.renderInline(self._shortcodes(str(text)))

    def blocks(self, text: str) -> str:
        return self.nodes(parse_blocks(text))

    def nodes(self, nodes: list[Node]) -> str:
        return "".join(self._div(n) if isinstance(n, Div) else self._markdown(n) for n in nodes)

    def element_id(self, attrs: Attrs, inner_html: str) -> str:
        """The explicit id from ``attrs`` or one derived from the default-language text."""
        if attrs.id:
            return self.ids.claim_exact(attrs.id, self.warn)
        return self.ids.claim(slugify(text_for_lang(inner_html, self.lang)))

    # -- Markdown chunks ----------------------------------------------------

    def _markdown(self, chunk: str) -> str:
        out = []
        executable = False
        for line, kind in classify_lines(chunk):
            if kind == FENCE_OPEN:
                m = _EXEC_FENCE.match(line)
                executable = bool(m)
                if m:
                    # Quarto would run ```{python} chunks; qmd2pw only shows their source.
                    if not self._warned_exec:
                        self.warn("executable code chunks are not run; their source is shown as code")
                        self._warned_exec = True
                    line = f"{m['indent']}{m['fence']}{m['lang']}"
            elif kind == CODE:
                if executable and _CHUNK_OPTION.match(line):
                    continue
            elif kind == TEXT:
                m = ATX_HEADING.match(line)
                if m and m["text"]:
                    text, attrs = split_heading_attrs(m["text"])
                    # Raw HTML lets the heading keep its attributes; the blank line ends the HTML block.
                    line = self._heading(len(m["hashes"]) + self.shift, text, attrs) + "\n"
                else:
                    line = self._shortcodes(line)
            out.append(line)
        html = self.md.render("\n".join(out))
        return _TABLE.sub(r'<div class="table-wrap"><table>\1</table></div>', html)

    def _heading(self, level: int, text: str, attrs: Attrs) -> str:
        level = max(1, min(level, 6))
        inner = self.inline(text)
        attrs.id = self.element_id(attrs, inner)
        return f"<h{level}{attrs.to_html()}>{inner}</h{level}>"

    # -- fenced divs --------------------------------------------------------

    def _div(self, div: Div) -> str:
        attrs = div.attrs
        callout = next((c for c in attrs.classes if c.removeprefix("callout-") in CALLOUT_KINDS
                        and c.startswith("callout-")), None)
        if callout:
            return self._callout(div, callout.removeprefix("callout-"))
        if "column" in attrs.classes and "width" in attrs.pairs:
            width = attrs.pairs.pop("width")
            style = attrs.pairs.get("style", "")
            attrs.pairs["style"] = f"flex: 1 1 calc({width} - 1.5rem);{style}"
        return f"<div{attrs.to_html()}>\n{self.nodes(div.children)}</div>\n"

    def _callout(self, div: Div, kind: str) -> str:
        attrs = div.attrs
        children = list(div.children)
        title = attrs.pairs.pop("title", None)
        title_html = self.inline(title) if title else None
        # As in Quarto, a heading at the start of the callout becomes its title.
        if title_html is None and children and isinstance(children[0], str):
            lines = children[0].lstrip("\n").split("\n")
            m = ATX_HEADING.match(lines[0])
            if m and m["text"]:
                title_html = self.inline(split_heading_attrs(m["text"])[0])
                children[0] = "\n".join(lines[1:])
        if title_html is None:
            title_html = self.ui(f"callout_{kind}")
        return (
            f'<div{attrs.to_html(extra_classes=["callout"])} role="note">\n'
            f'<div class="callout-title">{title_html}</div>\n'
            f'<div class="callout-body">\n{self.nodes(children)}</div>\n</div>\n'
        )

    # -- shortcodes ---------------------------------------------------------

    def _shortcodes(self, text: str) -> str:
        if "{{<" not in text:
            return text

        def replace(m: re.Match) -> str:
            name, args = m["name"], m["args"].split()
            if name == "meta" and args:
                value = _lookup(self.meta, args[0])
                if value is None:
                    self.warn(f"{{{{< meta {args[0]} >}}}}: no such metadata key")
                    return ""
                return str(value)
            if name == "pagebreak":
                return ""
            self.warn(f"unsupported shortcode '{name}' left as is")
            return m[0]

        return _SHORTCODE.sub(replace, text)


def _lookup(meta, dotted: str):
    value = meta
    for part in dotted.split("."):
        if isinstance(value, dict):
            value = value.get(part)
        elif isinstance(value, list) and part.isdigit() and int(part) < len(value):
            value = value[int(part)]
        else:
            return None
    return value
