"""
ATS PDF modifier — applies diff_changes and keywords to an original PDF using PyMuPDF.

Strategy:
  1. For each accepted DiffChange: search for the 'before' text in the PDF,
     redact (white-fill) it, then insert the 'after' text at the same position.
  2. For added keywords: find the skills/compétences section heading and inject
     the keywords right below it, or fall back to the bottom of the last page.
  3. Falls back gracefully (logs a warning) when a text block cannot be located.
"""
from __future__ import annotations

import logging
from typing import Any

import fitz  # PyMuPDF  (pip install pymupdf)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_fontsize_at(page: fitz.Page, rect: fitz.Rect) -> float:
    """Return the font size of the first text span inside *rect* (default 10)."""
    try:
        data = page.get_text("dict", clip=rect)
        for block in data.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    size = span.get("size")
                    if size and size > 0:
                        return float(size)
    except Exception:
        pass
    return 10.0


def _search_text(page: fitz.Page, text: str) -> list[fitz.Rect]:
    """
    Search for *text* on *page*.
    Falls back to progressively shorter prefixes (60 chars, then 30 chars)
    to cope with Gemini paraphrasing the original CV content.
    """
    if not text:
        return []

    hits = page.search_for(text)
    if hits:
        return hits

    if len(text) > 60:
        hits = page.search_for(text[:60].strip())
        if hits:
            return hits

    if len(text) > 30:
        hits = page.search_for(text[:30].strip())
        if hits:
            return hits

    return []


def _expand_rect(rect: fitz.Rect, page: fitz.Page) -> fitz.Rect:
    """
    Return a larger rect suitable for inserting replacement text:
    - extends to the right up to the page margin
    - adds a few points of height so longer replacements fit
    """
    return fitz.Rect(
        rect.x0,
        rect.y0,
        min(rect.x0 + 450, page.rect.width - 30),
        rect.y1 + 8,
    )


# ---------------------------------------------------------------------------
# Main function
# ---------------------------------------------------------------------------

def apply_ats_to_pdf(
    pdf_bytes: bytes,
    diff_changes: list[dict[str, str]],
    added_keywords: list[str],
) -> bytes:
    """
    Apply ATS optimizations to *pdf_bytes* and return the modified PDF bytes.

    Parameters
    ----------
    pdf_bytes       : raw bytes of the original PDF
    diff_changes    : list of {"section": ..., "before": ..., "after": ...}
                      (already filtered to accepted changes only)
    added_keywords  : keyword strings to inject near the skills section
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    applied_count = 0

    # ── 1. Apply diff_changes ────────────────────────────────────────────────
    for change in diff_changes:
        before = (change.get("before") or "").strip()
        after  = (change.get("after")  or "").strip()
        if not before or not after:
            continue

        found = False
        for page in doc:
            hits = _search_text(page, before)
            if not hits:
                continue

            # Collect font sizes BEFORE redacting (text still present)
            font_sizes = [_get_fontsize_at(page, rect) for rect in hits]

            # Redact every matching rect on this page
            for rect in hits:
                page.add_redact_annot(rect, fill=(1, 1, 1), text="")
            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

            # Re-insert replacement text in the same (expanded) area
            for rect, fs in zip(hits, font_sizes):
                insert_rect = _expand_rect(rect, page)
                rc = page.insert_textbox(
                    insert_rect,
                    after,
                    fontsize=fs,
                    color=(0, 0, 0),
                    align=fitz.TEXT_ALIGN_LEFT,
                )
                if rc < 0:
                    # Text didn't fit — retry with a slightly smaller font
                    page.insert_textbox(
                        insert_rect,
                        after,
                        fontsize=max(fs - 1.5, 7),
                        color=(0, 0, 0),
                        align=fitz.TEXT_ALIGN_LEFT,
                    )

            applied_count += 1
            found = True
            break  # only apply each change once (first page where found)

        if not found:
            logger.debug("DiffChange 'before' not found in PDF: %r…", before[:50])

    logger.info(
        "ATS PDF: %d/%d diff_changes applied in-place", applied_count, len(diff_changes)
    )

    # ── 2. Inject added keywords ─────────────────────────────────────────────
    if added_keywords:
        _inject_keywords(doc, "  ·  ".join(added_keywords))

    return doc.tobytes()


# ---------------------------------------------------------------------------
# Keyword injection helper
# ---------------------------------------------------------------------------

_SKILLS_HEADINGS = [
    "skills",
    "compétences",
    "competences",
    "technical skills",
    "core competencies",
    "key skills",
    "technologies",
    "hard skills",
    "soft skills",
    "outils",
    "tools",
]


def _inject_keywords(doc: fitz.Document, keywords_str: str) -> None:
    """
    Find the first skills-like heading in the document and insert *keywords_str*
    right below it.  Falls back to the bottom of the last page.
    """
    for page in doc:
        text_lower = page.get_text().lower()
        for heading in _SKILLS_HEADINGS:
            idx = text_lower.find(heading)
            if idx < 0:
                continue

            # Locate the heading rect
            snippet = text_lower[idx: idx + len(heading)]
            hits = page.search_for(snippet)
            if not hits:
                continue

            heading_rect = hits[0]
            insert_rect = fitz.Rect(
                heading_rect.x0,
                heading_rect.y1 + 4,
                page.rect.width - 40,
                heading_rect.y1 + 22,
            )
            page.insert_textbox(
                insert_rect,
                keywords_str,
                fontsize=9,
                color=(0.18, 0.42, 0.12),  # dark green — visually distinct
                align=fitz.TEXT_ALIGN_LEFT,
            )
            logger.info("Keywords injected after '%s' heading", heading)
            return  # done

    # Fallback: bottom of the last page
    last = doc[-1]
    pr = last.rect
    insert_rect = fitz.Rect(40, pr.height - 70, pr.width - 40, pr.height - 50)
    last.insert_textbox(
        insert_rect,
        f"Added keywords: {keywords_str}",
        fontsize=9,
        color=(0.18, 0.42, 0.12),
        align=fitz.TEXT_ALIGN_LEFT,
    )
    logger.info("Keywords appended to last page (no skills heading found)")
