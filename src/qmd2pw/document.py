"""Reading a Quarto document: YAML front matter and Markdown body."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import yaml

_FRONT_MATTER = re.compile(
    r"\A---[ \t]*\n(?:(?P<yaml>.*?)\n)?(?:---|\.\.\.)[ \t]*(?:\n|\Z)", re.DOTALL
)


class QmdError(Exception):
    """The input document cannot be processed."""


@dataclass
class QmdDocument:
    path: Path
    meta: dict
    body: str


def parse_qmd(text: str, path: Path = Path("document.qmd")) -> QmdDocument:
    text = text.lstrip("﻿").replace("\r\n", "\n")
    match = _FRONT_MATTER.match(text)
    if not match:
        return QmdDocument(path, {}, text)
    try:
        meta = yaml.safe_load(match["yaml"] or "") or {}
    except yaml.YAMLError as exc:
        raise QmdError(f"invalid YAML front matter in {path}: {exc}") from exc
    if not isinstance(meta, dict):
        raise QmdError(f"the front matter of {path} must be a YAML mapping")
    return QmdDocument(path, meta, text[match.end():])


def load_qmd(path: str | Path) -> QmdDocument:
    path = Path(path)
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise QmdError(f"cannot read {path}: {exc.strerror or exc}") from exc
    except UnicodeDecodeError as exc:
        raise QmdError(f"{path} is not UTF-8 encoded") from exc
    return parse_qmd(text, path)
