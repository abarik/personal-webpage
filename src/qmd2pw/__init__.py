"""qmd2pw: Quarto Markdown to PersonalWebPage."""

__version__ = "0.1.0"

from .page import BuildResult, build  # noqa: E402

__all__ = ["BuildResult", "build", "__version__"]
