from qmd2pw.blocks import Div, parse_attrs, parse_blocks, split_heading_attrs, split_sections
from qmd2pw.document import parse_qmd
from qmd2pw.i18n import format_date, slugify, text_for_lang


def test_parse_attrs():
    attrs = parse_attrs('#intro .lead .wide lang=hu title="Két szó" class="x y"')
    assert attrs.id == "intro"
    assert attrs.classes == ["lead", "wide", "x", "y"]
    assert attrs.pairs == {"lang": "hu", "title": "Két szó"}
    assert attrs.to_html() == ' id="intro" class="lead wide x y" lang="hu" title="Két szó"'


def test_unknown_attribute_becomes_data_attribute():
    assert parse_attrs("tbl-colwidths=x").to_html() == ' data-tbl-colwidths="x"'


def test_heading_attrs_need_preceding_space():
    assert split_heading_attrs("[Kutatás]{lang=hu}[Research]{lang=en}")[1].id is None
    text, attrs = split_heading_attrs("[Kutatás]{lang=hu}[Research]{lang=en} {#research}")
    assert text == "[Kutatás]{lang=hu}[Research]{lang=en}"
    assert attrs.id == "research"


def test_front_matter():
    doc = parse_qmd("---\ntitle: X\nlang: hu\n---\n\nBody\n")
    assert doc.meta == {"title": "X", "lang": "hu"}
    assert doc.body.strip() == "Body"
    assert parse_qmd("No front matter").meta == {}


def test_nested_fenced_divs_and_code():
    nodes = parse_blocks(
        ":::: {.columns}\n::: {.column}\nA\n:::\n::: column\n```\n:::\n```\n:::\n::::\nAfter"
    )
    columns = nodes[0]
    assert isinstance(columns, Div) and columns.attrs.classes == ["columns"]
    assert [c.attrs.classes for c in columns.children] == [["column"], ["column"]]
    assert ":::" in columns.children[1].children[0]  # fence inside code is literal
    assert nodes[1] == "After"


def test_split_sections_uses_shallowest_top_level_heading():
    body = "Intro\n\n# One {#one}\n\n## Sub\n\n::: x\n# Inside div\n:::\n\n```\n# comment\n```\n\n# Two\n"
    level, sections = split_sections(body)
    assert level == 1
    assert [s.title for s in sections] == [None, "One", "Two"]
    assert sections[1].attrs.id == "one"
    assert "## Sub" in sections[1].body and "# Inside div" in sections[1].body


def test_language_helpers():
    html = '<span lang="hu">Kutatás</span><span lang="en">Research</span>'
    assert text_for_lang(html, "hu") == "Kutatás"
    assert text_for_lang(html, "en") == "Research"
    assert slugify("Fő kutatási területek") == "fo-kutatasi-teruletek"
    from datetime import date
    assert format_date(date(2026, 3, 5), "hu") == "2026. március 5."
    assert format_date(date(2026, 3, 5), "en") == "5 March 2026"
