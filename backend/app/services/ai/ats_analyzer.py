"""
ATS (Applicant Tracking System) analysis service powered by Gemini AI.

Compares a CV against a job description and returns a detailed scoring
breakdown, keyword analysis, improvement suggestions, and diff changes.
"""

from __future__ import annotations

from typing import Any

from app.services.ai import gemini_client


async def analyze_cv_vs_job(
    cv_content: str,
    job_description: str,
) -> dict[str, Any]:
    """Perform a full ATS compatibility analysis.

    Parameters
    ----------
    cv_content:
        Plain-text (or structured) representation of the candidate's CV.
    job_description:
        The full job posting text.

    Returns
    -------
    dict with keys:
        overall_score      – int 0-100
        breakdown          – list of {label, score, icon}
        missing_keywords   – list[str]
        present_keywords   – list[str]
        suggestions        – list[str]  (3 quick-wins)
        diff_changes       – list of {section, before, after}
        keyword_match_pct  – int 0-100
    """

    system_instruction = (
        "You are an expert ATS (Applicant Tracking System) analyst and career coach. "
        "Analyse the provided CV against the job description. Be rigorous, fair, "
        "and constructive. All scores must be integers between 0 and 100."
    )

    prompt = f"""Analyse the following CV against the job description and return a JSON object with EXACTLY these keys:

1. "overall_score": an integer 0-100 representing overall ATS compatibility.
2. "breakdown": an array of exactly 5 objects, each with:
   - "label": one of "Keyword Match", "Section Structure", "Formatting", "Content Quality", "Length"
   - "score": integer 0-100
   - "icon": a short icon name ("search", "layout", "type", "star", "file-text") corresponding to each label
3. "missing_keywords": an array of important keywords/phrases found in the job description but MISSING from the CV.
4. "present_keywords": an array of important keywords/phrases that the CV already contains and that match the job description.
5. "suggestions": an array of exactly 3 short, actionable quick-win suggestions to improve ATS score.
6. "diff_changes": an array of 2-4 objects each with:
   - "section": the CV section name (e.g. "Summary", "Experience - Role X")
   - "before": the current text from the CV (abbreviated if long)
   - "after": the improved text you recommend
7. "keyword_match_pct": an integer 0-100 representing the percentage of job-description keywords present in the CV.

--- CV ---
{cv_content}

--- JOB DESCRIPTION ---
{job_description}

Return ONLY the JSON object."""

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    # ── Normalise & validate ───────────────────────────────────────────
    return _normalise(result)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _normalise(data: Any) -> dict[str, Any]:
    """Ensure the AI output matches the expected schema shape."""

    if not isinstance(data, dict):
        raise RuntimeError("ATS analysis returned unexpected format.")

    return {
        "overall_score": _clamp(data.get("overall_score", 0)),
        "breakdown": _normalise_breakdown(data.get("breakdown", [])),
        "missing_keywords": _str_list(data.get("missing_keywords", [])),
        "present_keywords": _str_list(data.get("present_keywords", [])),
        "suggestions": _str_list(data.get("suggestions", []))[:3],
        "diff_changes": _normalise_diffs(data.get("diff_changes", [])),
        "keyword_match_pct": _clamp(data.get("keyword_match_pct", 0)),
    }


def _clamp(value: Any, lo: int = 0, hi: int = 100) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return 0


def _str_list(items: Any) -> list[str]:
    if not isinstance(items, list):
        return []
    return [str(i) for i in items]


_EXPECTED_BREAKDOWN_ICONS = {
    "Keyword Match": "search",
    "Section Structure": "layout",
    "Formatting": "type",
    "Content Quality": "star",
    "Length": "file-text",
}


def _normalise_breakdown(items: Any) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        return [
            {"label": label, "score": 0, "icon": icon}
            for label, icon in _EXPECTED_BREAKDOWN_ICONS.items()
        ]

    result = []
    for item in items:
        if isinstance(item, dict):
            result.append({
                "label": str(item.get("label", "")),
                "score": _clamp(item.get("score", 0)),
                "icon": str(item.get("icon", "check")),
            })
    return result


def _normalise_diffs(items: Any) -> list[dict[str, str]]:
    if not isinstance(items, list):
        return []

    result = []
    for item in items:
        if isinstance(item, dict):
            result.append({
                "section": str(item.get("section", "")),
                "before": str(item.get("before", "")),
                "after": str(item.get("after", "")),
            })
    return result
