"""Inline SVG icons for profile links, keyed by Bootstrap Icons names as used in Quarto."""

_SVG = (
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" '
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '
    'focusable="false"{cls}>{body}</svg>'
)

_SHAPES = {
    "envelope": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "code": '<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>',
    "mortarboard": '<path d="M2 9.5 12 5l10 4.5-10 4.5z"/><path d="M6 11.5V16c3.5 2.5 8.5 2.5 12 0v-4.5M22 9.5V15"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
    "file": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    "book": '<path d="M4 19V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/>',
    "person": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    "id": '<circle cx="12" cy="12" r="9.5"/><path d="M8.5 11v5.5M12 7.5v9h1.5a4.5 4.5 0 0 0 0-9z"/><circle cx="8.5" cy="8" r=".5" fill="currentColor"/>',
    "geo": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "telephone": '<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "link": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    "moon": '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
}

_ALIASES = {
    "envelope-fill": "envelope", "envelope-at": "envelope", "email": "envelope", "mail": "envelope",
    "github": "code", "gitlab": "code", "git": "code", "code-slash": "code",
    "google-scholar": "mortarboard", "scholar": "mortarboard", "mortarboard-fill": "mortarboard",
    "linkedin": "person", "person-badge": "person", "person-circle": "person", "researchgate": "person",
    "orcid": "id",
    "file-earmark-pdf": "file", "file-earmark-text": "file", "file-pdf": "file", "file-text": "file", "cv": "file",
    "journal-text": "book", "journal": "book", "journal-bookmark": "book",
    "globe2": "globe", "house": "globe", "geo-alt": "geo", "geo-alt-fill": "geo", "phone": "telephone",
    "box-arrow-up-right": "link",
}


def icon(name: str | None, css_class: str | None = None) -> str:
    key = _ALIASES.get(str(name or ""), str(name or ""))
    cls = f' class="{css_class}"' if css_class else ""
    return _SVG.format(cls=cls, body=_SHAPES.get(key, _SHAPES["link"]))
