from pathlib import Path

from qmd2pw.cli import main
from qmd2pw.page import build

EXAMPLE = Path(__file__).resolve().parent.parent / "example" / "index.qmd"


def write(tmp_path: Path, text: str, name: str = "page.qmd") -> Path:
    path = tmp_path / name
    path.write_text(text, encoding="utf-8")
    return path


def test_example_renders_self_contained(tmp_path):
    result = build(EXAMPLE, tmp_path / "out.html")
    html = result.html
    assert result.warnings == []
    assert '<html lang="hu" data-lang="hu" data-langs="hu en"' in html
    assert 'html[data-lang="hu"] body [lang|="en"]' in html
    assert '<section id="research" class="pw-section">' in html
    assert '<a href="#research"><span lang="hu">Kutatás</span><span lang="en">Research</span></a>' in html
    assert 'class="callout callout-' in html
    assert 'class="pw-avatar pw-avatar--rounded" src="data:image/' in html
    assert "<link" not in html  # embed-resources: true
    assert "--pw-accent: #8a1538" in html  # custom CSS inlined


def test_linked_css_and_theme_files(tmp_path):
    (tmp_path / "css").mkdir()
    for name in ("custom.css", "light.css", "dark.css"):
        (tmp_path / "css" / name).write_text("body{}", encoding="utf-8")
    src = write(tmp_path, """---
title: Test
lang: en
format:
  html:
    css: css/custom.css
    theme:
      light: css/light.css
      dark: css/dark.css
---

## Section
""")
    html = build(src, tmp_path / "site" / "index.html").html
    assert '<link rel="stylesheet" href="../css/custom.css">' in html
    assert 'href="../css/dark.css" data-theme-css="dark" media="(prefers-color-scheme: dark)"' in html
    assert 'class="pw-btn pw-lang-toggle"' not in html  # single language


def test_warnings_and_shortcodes(tmp_path):
    src = write(tmp_path, """---
title: Test
author: Jane Doe
theme: cosmo
---

Written by {{< meta author >}}.

```{python}
#| echo: false
print(1)
```
""")
    result = build(src)
    assert result.output == tmp_path / "page.html"
    assert "Written by Jane Doe." in result.html
    assert '<code class="language-python">print(1)' in result.html
    assert any("Bootswatch" in w for w in result.warnings)
    assert any("executable" in w for w in result.warnings)


def test_cli_reports_missing_input(tmp_path, capsys):
    assert main([str(tmp_path / "missing.qmd")]) == 1
    assert "cannot read" in capsys.readouterr().err
