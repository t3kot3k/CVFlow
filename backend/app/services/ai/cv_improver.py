"""
CV content improvement service powered by Gemini AI.

Provides helpers to improve text, generate professional summaries, and
suggest achievement bullet points.
"""

from __future__ import annotations

from app.services.ai import gemini_client


# ---------------------------------------------------------------------------
# improve_text
# ---------------------------------------------------------------------------


async def improve_text(text: str, context: str, language: str = "en") -> str:
    """Rewrite *text* so that it is clearer, more impactful, and ATS-friendly.

    Parameters
    ----------
    text:
        The original text to improve (e.g. a bullet point or summary).
    context:
        Additional context such as the job title, industry, or section name
        so the AI can tailor the rewrite.
    language:
        ISO-639 language code for the output (default ``"en"``).
    """

    system_instruction = (
        "You are an expert CV writer and career coach. "
        "Your task is to improve the provided text so it is concise, "
        "uses strong action verbs, includes measurable results where possible, "
        "and is optimised for Applicant Tracking Systems (ATS). "
        f"Reply in the language whose ISO code is '{language}'. "
        "Return ONLY the improved text, nothing else."
    )

    prompt = (
        f"Context: {context}\n\n"
        f"Original text:\n{text}\n\n"
        "Rewrite this text to be more professional, impactful, and ATS-friendly."
    )

    return await gemini_client.generate(prompt, system_instruction=system_instruction)


# ---------------------------------------------------------------------------
# generate_summary
# ---------------------------------------------------------------------------


async def generate_summary(
    cv_content: str,
    target_role: str,
    language: str = "en",
) -> str:
    """Generate a professional summary / profile section for a CV.

    Parameters
    ----------
    cv_content:
        A textual representation of the full CV (experience, skills, etc.).
    target_role:
        The job title or role the candidate is targeting.
    language:
        ISO-639 language code for the output.
    """

    system_instruction = (
        "You are an expert CV writer. "
        "Write a compelling professional summary (3-5 sentences) that highlights "
        "the candidate's key strengths, relevant experience, and value proposition "
        "for the target role. Use strong language and quantifiable achievements "
        "when the CV content allows it. "
        f"Write in the language whose ISO code is '{language}'. "
        "Return ONLY the summary paragraph, nothing else."
    )

    prompt = (
        f"Target role: {target_role}\n\n"
        f"CV content:\n{cv_content}\n\n"
        "Generate a professional summary for this candidate."
    )

    return await gemini_client.generate(prompt, system_instruction=system_instruction)


# ---------------------------------------------------------------------------
# suggest_bullets
# ---------------------------------------------------------------------------


async def suggest_bullets(
    job_title: str,
    company: str | None = None,
    industry: str | None = None,
) -> list[str]:
    """Suggest 5 achievement-oriented bullet points for a given role.

    Parameters
    ----------
    job_title:
        The position title (e.g. "Senior Software Engineer").
    company:
        Optional company name for extra context.
    industry:
        Optional industry / sector.
    """

    system_instruction = (
        "You are an expert CV writer. "
        "Generate 5 strong, achievement-oriented bullet points suitable for "
        "a CV experience section. Each bullet should start with an action verb, "
        "include a measurable result when possible, and be relevant to the role. "
        "Return a JSON array of 5 strings, nothing else."
    )

    parts = [f"Job title: {job_title}"]
    if company:
        parts.append(f"Company: {company}")
    if industry:
        parts.append(f"Industry: {industry}")

    prompt = (
        "\n".join(parts) + "\n\n"
        "Suggest 5 achievement bullet points for this role."
    )

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    # Ensure we always return a list of strings
    if isinstance(result, list):
        return [str(item) for item in result]
    return []
