"""Interface strings, language helpers and date formatting."""

from __future__ import annotations

import re
import unicodedata
from datetime import date, datetime
from html.parser import HTMLParser
from pathlib import Path

_UI = {
    "hu": {
        "skip": "Ugrás a tartalomra",
        "nav": "Oldalnavigáció",
        "dark_mode": "Sötét mód",
        "switch_lang": "Váltás {name} nyelvre",
        "updated": "Utoljára frissítve",
        "back_to_top": "Vissza a tetejére",
        "callout_note": "Megjegyzés",
        "callout_tip": "Tipp",
        "callout_warning": "Figyelem",
        "callout_caution": "Vigyázat",
        "callout_important": "Fontos",
    },
    "en": {
        "skip": "Skip to content",
        "nav": "Page navigation",
        "dark_mode": "Dark mode",
        "switch_lang": "Switch to {name}",
        "updated": "Last updated",
        "back_to_top": "Back to top",
        "callout_note": "Note",
        "callout_tip": "Tip",
        "callout_warning": "Warning",
        "callout_caution": "Caution",
        "callout_important": "Important",
    },
}

_LANGUAGE_NAMES = {
    "hu": {"hu": "magyar", "en": "angol", "de": "német", "fr": "francia"},
    "en": {"hu": "Hungarian", "en": "English", "de": "German", "fr": "French"},
}

_MONTHS = {
    "hu": ["január", "február", "március", "április", "május", "június",
           "július", "augusztus", "szeptember", "október", "november", "december"],
    "en": ["January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December"],
}

_VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def primary(lang: str) -> str:
    return lang.split("-")[0].lower()


def ui_strings(lang: str) -> dict[str, str]:
    return _UI.get(primary(lang), _UI["en"])


def language_name(code: str, in_lang: str) -> str:
    return _LANGUAGE_NAMES.get(primary(in_lang), _LANGUAGE_NAMES["en"]).get(primary(code), code)


def parse_date(value, source: Path | None = None) -> date | str | None:
    """Interpret a Quarto date value; unparseable values are returned as text."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if value is None:
        return None
    text = str(value).strip()
    if text in ("today", "now"):
        return date.today()
    if text == "last-modified" and source is not None:
        return date.fromtimestamp(source.stat().st_mtime)
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return text


def format_date(value: date | str, lang: str) -> str:
    if isinstance(value, str):
        return value
    code = primary(lang)
    if code == "hu":
        return f"{value.year}. {_MONTHS['hu'][value.month - 1]} {value.day}."
    if code == "en":
        return f"{value.day} {_MONTHS['en'][value.month - 1]} {value.year}"
    return value.isoformat()


class _LangText(HTMLParser):
    def __init__(self, lang: str):
        super().__init__(convert_charrefs=True)
        self.lang = primary(lang)
        self.hidden = [False]
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in _VOID_TAGS:
            return
        lang = dict(attrs).get("lang")
        self.hidden.append(self.hidden[-1] or (lang is not None and primary(lang) != self.lang))

    def handle_endtag(self, tag):
        if tag not in _VOID_TAGS and len(self.hidden) > 1:
            self.hidden.pop()

    def handle_data(self, data):
        if not self.hidden[-1]:
            self.parts.append(data)


def text_for_lang(html: str, lang: str) -> str:
    """Plain text of an HTML fragment as seen in ``lang`` (other-language elements dropped)."""
    parser = _LangText(lang)
    parser.feed(html)
    parser.close()
    return " ".join("".join(parser.parts).split())


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")
