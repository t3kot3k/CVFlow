"""
Cover letter generation service powered by Gemini AI.

Generates complete cover letters and can rewrite individual paragraphs
with different tones or custom instructions.
"""

from __future__ import annotations

from app.services.ai import gemini_client


# ---------------------------------------------------------------------------
# Format descriptions
# ---------------------------------------------------------------------------

_FORMAT_GUIDELINES: dict[str, str] = {
    "us": (
        "Use a standard US cover letter structure: "
        "opening paragraph (why you are writing), 1-2 body paragraphs "
        "(your qualifications and fit), and a closing paragraph (call to action). "
        "Do NOT include the sender address block or date."
    ),
    "french": (
        "Use a formal French cover letter (lettre de motivation) structure: "
        "a polite opening formula, two body paragraphs (vous/moi/nous approach — "
        "what the company does, what you bring, what you can achieve together), "
        "and a formal closing politeness formula."
    ),
    "international": (
        "Use a concise, modern international cover letter structure: "
        "brief opening, two focused body paragraphs, and a confident closing. "
        "Avoid overly formal or country-specific conventions."
    ),
}

_TONE_DESCRIPTIONS: dict[str, str] = {
    "professional": "formal, polished, and confident",
    "enthusiastic": "energetic, passionate, and upbeat while remaining professional",
    "concise": "short, direct, and to-the-point with no filler",
    "creative": "original, engaging, with a distinctive personal voice",
}


# ---------------------------------------------------------------------------
# generate_cover_letter
# ---------------------------------------------------------------------------


async def generate_cover_letter(
    cv_content: str,
    job_description: str,
    tone: str = "professional",
    format: str = "us",
    language: str = "en",
) -> list[str]:
    """Generate a complete cover letter as a list of paragraphs.

    Parameters
    ----------
    cv_content:
        Text representation of the candidate's CV.
    job_description:
        The full job posting text.
    tone:
        One of ``professional``, ``enthusiastic``, ``concise``, ``creative``.
    format:
        One of ``us``, ``french``, ``international``.
    language:
        ISO-639 language code for the output.

    Returns
    -------
    list[str] – Each element is one paragraph of the cover letter.
    """

    tone_desc = _TONE_DESCRIPTIONS.get(tone, _TONE_DESCRIPTIONS["professional"])
    format_guide = _FORMAT_GUIDELINES.get(format, _FORMAT_GUIDELINES["us"])

    system_instruction = (
        "You are an expert cover letter writer. "
        f"Write in a {tone_desc} tone. "
        f"{format_guide} "
        f"Write in the language whose ISO code is '{language}'. "
        "Return a JSON array of strings where each string is one paragraph "
        "of the cover letter. Do NOT include a subject line or addresses."
    )

    prompt = (
        f"--- CANDIDATE CV ---\n{cv_content}\n\n"
        f"--- JOB DESCRIPTION ---\n{job_description}\n\n"
        "Generate a tailored cover letter for this candidate and job."
    )

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    if isinstance(result, list):
        return [str(p) for p in result]
    return []


# ---------------------------------------------------------------------------
# rewrite_paragraph
# ---------------------------------------------------------------------------


async def rewrite_paragraph(
    paragraph: str,
    tone: str = "professional",
    instructions: str | None = None,
) -> str:
    """Rewrite a single cover letter paragraph.

    Parameters
    ----------
    paragraph:
        The current paragraph text.
    tone:
        Desired tone for the rewrite.
    instructions:
        Optional free-text instructions from the user (e.g. "make it shorter",
        "emphasise leadership experience").

    Returns
    -------
    str – The rewritten paragraph.
    """

    tone_desc = _TONE_DESCRIPTIONS.get(tone, _TONE_DESCRIPTIONS["professional"])

    system_instruction = (
        "You are an expert cover letter writer. "
        f"Rewrite the given paragraph in a {tone_desc} tone. "
        "Keep the same general message but improve clarity, impact, and style. "
        "Return ONLY the rewritten paragraph, nothing else."
    )

    extra = ""
    if instructions:
        extra = f"\n\nAdditional instructions from the user: {instructions}"

    prompt = (
        f"Original paragraph:\n{paragraph}"
        f"{extra}\n\n"
        "Rewrite this paragraph."
    )

    return await gemini_client.generate(prompt, system_instruction=system_instruction)
