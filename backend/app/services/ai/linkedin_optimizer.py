"""
LinkedIn profile optimisation service powered by Gemini AI.

Analyses a LinkedIn profile and provides section-by-section scoring,
weakness identification, and actionable improvement suggestions.
"""

from __future__ import annotations

from typing import Any

from app.services.ai import gemini_client


# ---------------------------------------------------------------------------
# analyse_profile
# ---------------------------------------------------------------------------


async def analyze_profile(profile_data: str) -> dict[str, Any]:
    """Analyse a LinkedIn profile and return scored sections with suggestions.

    Parameters
    ----------
    profile_data:
        A textual representation of the LinkedIn profile (headline, about,
        experience, education, skills, etc.).

    Returns
    -------
    dict with keys:
        base_score      – int 0-100 overall profile strength
        sections        – list of section dicts (id, label, score, current,
                          weaknesses, suggestions)
        missing_skills  – list[str]
        quick_wins      – list[str]
    """

    system_instruction = (
        "You are an expert LinkedIn profile optimiser and personal-branding "
        "consultant. Analyse the provided profile data thoroughly. "
        "Score each section honestly (0-100). Provide specific, actionable "
        "suggestions to improve discoverability, recruiter appeal, and "
        "professional branding."
    )

    prompt = f"""Analyse the following LinkedIn profile and return a JSON object with EXACTLY these keys:

1. "base_score": an integer 0-100 representing the overall profile strength.
2. "sections": an array of objects, one for each major profile section. Each object must have:
   - "id": a short slug (e.g. "headline", "about", "experience", "education", "skills")
   - "label": a human-readable section name (e.g. "Headline", "About / Summary")
   - "score": integer 0-100 for that section
   - "current": a short excerpt or summary of what the section currently contains
   - "weaknesses": an array of 1-3 specific weaknesses in the current content
   - "suggestions": an array of 1-3 objects each with:
       - "text": the suggested improvement text
       - "boost": estimated score boost as a string (e.g. "+8", "+15")
3. "missing_skills": an array of in-demand skills the profile should add based on the person's role.
4. "quick_wins": an array of 3-5 short, immediately actionable tips to raise the profile score.

Analyse AT LEAST these sections (include more if data is available):
- Headline
- About / Summary
- Experience
- Education
- Skills

--- LINKEDIN PROFILE DATA ---
{profile_data}

Return ONLY the JSON object."""

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    return _normalise_analysis(result)


# ---------------------------------------------------------------------------
# generate_section_suggestions
# ---------------------------------------------------------------------------


async def generate_section_suggestions(
    section_id: str,
    current_content: str,
    target_role: str | None = None,
) -> list[dict[str, str]]:
    """Generate detailed rewrite suggestions for a single profile section.

    Parameters
    ----------
    section_id:
        The section identifier (e.g. "headline", "about", "experience").
    current_content:
        The current text of the section.
    target_role:
        Optional target job title / role for tailoring.

    Returns
    -------
    list[dict] – Each dict has ``text`` (the suggestion) and ``boost``
    (estimated score improvement as a string like "+10").
    """

    role_context = ""
    if target_role:
        role_context = f"The user is targeting the role of: {target_role}.\n"

    system_instruction = (
        "You are an expert LinkedIn copywriter and personal-branding consultant. "
        "Provide 3 alternative rewrites for the given LinkedIn section. "
        "Each suggestion should be meaningfully different in approach or angle. "
        "Make them keyword-rich, recruiter-friendly, and engaging."
    )

    prompt = f"""{role_context}LinkedIn section: {section_id}

Current content:
{current_content}

Generate 3 alternative suggestions. Return a JSON array of objects, each with:
- "text": the full suggested replacement text for the section
- "boost": estimated profile score improvement as a string (e.g. "+12")

Return ONLY the JSON array."""

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    if isinstance(result, list):
        return [_normalise_suggestion(s) for s in result if isinstance(s, dict)]
    return []


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _clamp(value: Any, lo: int = 0, hi: int = 100) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return 0


def _normalise_suggestion(s: dict) -> dict[str, str]:
    return {
        "text": str(s.get("text", "")),
        "boost": str(s.get("boost", "+0")),
    }


def _normalise_section(section: Any) -> dict[str, Any]:
    if not isinstance(section, dict):
        return None

    suggestions_raw = section.get("suggestions", [])
    suggestions = []
    if isinstance(suggestions_raw, list):
        for s in suggestions_raw:
            if isinstance(s, dict):
                suggestions.append(_normalise_suggestion(s))

    weaknesses_raw = section.get("weaknesses", [])
    weaknesses = [str(w) for w in weaknesses_raw] if isinstance(weaknesses_raw, list) else []

    return {
        "id": str(section.get("id", "")),
        "label": str(section.get("label", "")),
        "score": _clamp(section.get("score", 0)),
        "current": str(section.get("current", "")),
        "weaknesses": weaknesses,
        "suggestions": suggestions,
    }


def _normalise_analysis(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        return {
            "base_score": 0,
            "sections": [],
            "missing_skills": [],
            "quick_wins": [],
        }

    sections_raw = data.get("sections", [])
    sections = []
    if isinstance(sections_raw, list):
        for s in sections_raw:
            normalised = _normalise_section(s)
            if normalised:
                sections.append(normalised)

    missing_skills = data.get("missing_skills", [])
    quick_wins = data.get("quick_wins", [])

    return {
        "base_score": _clamp(data.get("base_score", 0)),
        "sections": sections,
        "missing_skills": [str(s) for s in missing_skills] if isinstance(missing_skills, list) else [],
        "quick_wins": [str(w) for w in quick_wins] if isinstance(quick_wins, list) else [],
    }
