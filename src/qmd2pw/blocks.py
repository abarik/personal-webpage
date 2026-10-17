"""Block structure of the Markdown body: attributes, fenced divs and sections."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from html import escape
from typing import Iterator, Union

# Emitted as-is; any other key becomes a data-* attribute, as in Pandoc.
_HTML_ATTRS = {"lang", "dir", "title", "style", "role", "width", "height", "hidden", "tabindex", "translate"}

_ATTR_TOKEN = re.compile(
    r"""\#(?P<id>[^\s}"']+)
      | \.(?P<cls>[^\s}"'.\#]+)
      | (?P<key>[A-Za-z_][\w:.-]*)=(?:"(?P<dq>(?:[^"\\]|\\.)*)"|'(?P<sq>[^']*)'|(?P<bare>[^\s"'}]+))
      | \S+""",
    re.VERBOSE,
)

_DIV_OPEN = re.compile(r"^ {0,3}:{3,}[ \t]*(?:\{(?P<attrs>[^{}]*)\}|(?P<cls>[^\s{}:]+))[ \t]*:*[ \t]*$")
_DIV_CLOSE = re.compile(r"^ {0,3}:{3,}[ \t]*$")
_CODE_OPEN = re.compile(r"^ {0,3}(?P<fence>`{3,}|~{3,})(?P<info>.*)$")
ATX_HEADING = re.compile(r"^ {0,3}(?P<hashes>#{1,6})(?:[ \t]+(?P<text>.*?))?(?:[ \t]+#+)?[ \t]*$")
# Heading attributes need whitespace before the brace; "]{...}" belongs to a span.
_TRAILING_ATTRS = re.compile(r"^(?P<text>.*?)[ \t]+\{(?P<attrs>[^{}]*)\}$")

TEXT, FENCE_OPEN, CODE, FENCE_CLOSE = "text", "fence-open", "code", "fence-close"


@dataclass
class Attrs:
    id: str | None = None
    classes: list[str] = field(default_factory=list)
    pairs: dict[str, str] = field(default_factory=dict)

    def to_html(self, extra_classes: tuple[str, ...] | list[str] = ()) -> str:
        out = []
        if self.id:
            out.append(f' id="{escape(self.id)}"')
        classes = [*extra_classes, *self.classes]
        if classes:
            out.append(f' class="{escape(" ".join(classes))}"')
        for key, value in self.pairs.items():
            name = key if key in _HTML_ATTRS or key.startswith(("aria-", "data-")) else f"data-{key}"
            out.append(f' {name}="{escape(value)}"')
        return "".join(out)


@dataclass
class Div:
    attrs: Attrs
    children: list["Node"] = field(default_factory=list)


Node = Union[str, Div]  # str: a chunk of Markdown


@dataclass
class Section:
    title: str | None  # inline Markdown; None for the text before the first heading
    attrs: Attrs
    body: str


def parse_attrs(spec: str) -> Attrs:
    """Parse a Pandoc attribute block such as ``#id .class key="value"``."""
    attrs = Attrs()
    for m in _ATTR_TOKEN.finditer(spec):
        if m["id"]:
            attrs.id = m["id"]
        elif m["cls"]:
            attrs.classes.append(m["cls"])
        elif m["key"]:
            if m["dq"] is not None:
                value = re.sub(r"\\(.)", r"\1", m["dq"])
            else:
                value = m["sq"] if m["sq"] is not None else m["bare"]
            if m["key"] == "id":
                attrs.id = value
            elif m["key"] == "class":
                attrs.classes.extend(value.split())
            else:
                attrs.pairs[m["key"]] = value
    return attrs


def split_heading_attrs(text: str) -> tuple[str, Attrs]:
    match = _TRAILING_ATTRS.match(text)
    if match:
        return match["text"], parse_attrs(match["attrs"])
    return text, Attrs()


def classify_lines(text: str) -> Iterator[tuple[str, str]]:
    """Yield ``(line, kind)`` so callers can leave fenced code blocks untouched."""
    fence = None
    close = None
    for line in text.split("\n"):
        if fence is None:
            m = _CODE_OPEN.match(line)
            if m and not (m["fence"][0] == "`" and "`" in m["info"]):
                fence = m["fence"]
                close = re.compile(rf"^ {{0,3}}{re.escape(fence[0])}{{{len(fence)},}}[ \t]*$")
                yield line, FENCE_OPEN
            else:
                yield line, TEXT
        elif close.match(line):
            fence = None
            yield line, FENCE_CLOSE
        else:
            yield line, CODE


def split_sections(body: str) -> tuple[int, list[Section]]:
    """Split the body at the shallowest heading level used outside divs and code.

    Returns that level and the sections; the first section holds the text
    before the first heading and has no title.
    """
    lines: list[tuple[str, re.Match | None]] = []
    depth = 0
    for line, kind in classify_lines(body):
        heading = None
        if kind == TEXT:
            if _DIV_CLOSE.match(line):
                depth = max(depth - 1, 0)
            elif _DIV_OPEN.match(line):
                depth += 1
            elif depth == 0:
                m = ATX_HEADING.match(line)
                if m and m["text"]:
                    heading = m
        lines.append((line, heading))

    levels = [len(h["hashes"]) for _, h in lines if h]
    if not levels:
        return 2, [Section(None, Attrs(), body)]
    level = min(levels)

    sections = [Section(None, Attrs(), "")]
    buf: list[str] = []
    for line, heading in lines:
        if heading and len(heading["hashes"]) == level:
            sections[-1].body = "\n".join(buf)
            buf = []
            title, attrs = split_heading_attrs(heading["text"])
            sections.append(Section(title, attrs, ""))
        else:
            buf.append(line)
    sections[-1].body = "\n".join(buf)
    return level, sections


def parse_blocks(text: str) -> list[Node]:
    """Turn Markdown with Pandoc fenced divs (``::: {.class}``) into a tree."""
    root = Div(Attrs())
    stack = [root]
    buf: list[str] = []

    def flush() -> None:
        if any(line.strip() for line in buf):
            stack[-1].children.append("\n".join(buf))
        buf.clear()

    for line, kind in classify_lines(text):
        if kind == TEXT:
            if len(stack) > 1 and _DIV_CLOSE.match(line):
                flush()
                stack.pop()
                continue
            m = _DIV_OPEN.match(line)
            if m:
                flush()
                attrs = parse_attrs(m["attrs"]) if m["attrs"] is not None else Attrs(classes=[m["cls"]])
                div = Div(attrs)
                stack[-1].children.append(div)
                stack.append(div)
                continue
        buf.append(line)
    flush()
    return root.children
