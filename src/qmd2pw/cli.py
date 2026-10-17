"""Command-line interface: ``qmd2pw input.qmd [-o output.html]``."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import __version__
from .document import QmdError
from .page import build


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="qmd2pw",
        description="Render a standalone Quarto (.qmd) document as a single-page personal website.",
    )
    parser.add_argument("input", type=Path, help="the .qmd file to render")
    parser.add_argument(
        "-o", "--output", type=Path,
        help="output HTML file (default: format.html.output-file, or the input name with .html)",
    )
    parser.add_argument(
        "--css", action="append", type=Path, default=[], metavar="FILE",
        help="extra stylesheet applied after those in the front matter (repeatable)",
    )
    parser.add_argument(
        "--embed-resources", action=argparse.BooleanOptionalAction, default=None,
        help="inline stylesheets and images into the HTML (default: embed-resources from the front matter)",
    )
    parser.add_argument("-q", "--quiet", action="store_true", help="print warnings only")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    args = parser.parse_args(argv)

    try:
        result = build(
            args.input,
            args.output,
            extra_css=[p.resolve() for p in args.css],
            embed=args.embed_resources,
        )
    except QmdError as exc:
        print(f"qmd2pw: error: {exc}", file=sys.stderr)
        return 1
    for warning in result.warnings:
        print(f"qmd2pw: warning: {warning}", file=sys.stderr)
    if not args.quiet:
        print(f"Output created: {result.output}")
    return 0
