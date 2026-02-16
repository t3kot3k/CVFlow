from __future__ import annotations
import json
import logging
import re
from typing import Optional, List
from .gemini_client import generate_content
from app.schemas.cv import OptimizedCV, OptimizedCVSection

logger = logging.getLogger(__name__)


CV_OPTIMIZE_PROMPT = """You are an expert CV writer and ATS optimization specialist. Based on the original CV content and the job description, create an optimized version of the CV that maximizes ATS compatibility while remaining honest and accurate.

## Original CV Content:
{cv_text}

## Job Description:
{job_description}

## ATS Analysis Summary:
{analysis_summary}

## Missing Keywords:
{missing_keywords}

## Instructions:
1. Rewrite and optimize the CV content to better match the job description
2. Naturally incorporate the missing keywords where relevant
3. Improve section structure and wording for ATS scanners
4. Keep all information truthful — enhance wording, don't fabricate experience
5. Use strong action verbs and quantified achievements
6. Ensure clean formatting with clear section headers

Respond in the following JSON format only (no additional text):

{{
    "contact": {{
        "name": "<full name>",
        "email": "<email if found>",
        "phone": "<phone if found>",
        "location": "<city, country if found>",
        "linkedin": "<linkedin URL if found>"
    }},
    "summary": "<2-3 sentence professional summary optimized for the role>",
    "experience": [
        {{
            "title": "<job title>",
            "company": "<company name>",
            "period": "<date range>",
            "bullets": ["<achievement-focused bullet points with metrics>"]
        }}
    ],
    "education": [
        {{
            "degree": "<degree name>",
            "institution": "<school name>",
            "period": "<date range>",
            "details": "<honors, GPA, relevant coursework if applicable>"
        }}
    ],
    "skills": ["<list of skills, prioritizing those matching the job description>"],
    "certifications": ["<list of certifications if any>"],
    "estimated_score": <number 0-100, estimated ATS score after optimization>
}}
"""


async def optimize_cv(
    cv_text: str,
    job_description: str,
    analysis_summary: str = "",
    missing_keywords: Optional[list[str]] = None,
) -> OptimizedCV:
    """
    Generate an optimized version of a CV using Gemini AI.

    Args:
        cv_text: The extracted text content from the original CV.
        job_description: The job description to optimize for.
        analysis_summary: Summary from the ATS analysis.
        missing_keywords: Keywords that were not found in the original CV.

    Returns:
        OptimizedCV with structured, optimized content.
    """
    prompt = CV_OPTIMIZE_PROMPT.format(
        cv_text=cv_text,
        job_description=job_description,
        analysis_summary=analysis_summary or "No prior analysis available.",
        missing_keywords=", ".join(missing_keywords) if missing_keywords else "None identified.",
    )

    response_text = await generate_content(
        prompt,
        max_tokens=16384,
        temperature=0.2,
        thinking_budget=0,
    )

    data = _parse_json_response(response_text)

    contact = data.get("contact", {})
    experience = [
        OptimizedCVSection(
            title=exp.get("title", ""),
            organization=exp.get("company", ""),
            period=exp.get("period", ""),
            bullets=exp.get("bullets", []),
        )
        for exp in data.get("experience", [])
    ]
    education = [
        OptimizedCVSection(
            title=edu.get("degree", ""),
            organization=edu.get("institution", ""),
            period=edu.get("period", ""),
            details=edu.get("details"),
        )
        for edu in data.get("education", [])
    ]

    return OptimizedCV(
        contact_name=contact.get("name", ""),
        contact_email=contact.get("email"),
        contact_phone=contact.get("phone"),
        contact_location=contact.get("location"),
        contact_linkedin=contact.get("linkedin"),
        summary=data.get("summary", ""),
        experience=experience,
        education=education,
        skills=data.get("skills", []),
        certifications=data.get("certifications", []),
        estimated_score=data.get("estimated_score", 80),
    )


def _parse_json_response(response_text: str) -> dict:
    """Parse JSON from Gemini response. Raises ValueError on failure."""
    raw = response_text.strip()
    logger.debug("_parse_json_response (optimizer) – raw length=%d", len(raw))

    # ── Strategy 0: extract content inside ```json ... ``` fences ──
    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)```", raw, re.DOTALL)
    if fence_match:
        inside = fence_match.group(1).strip()
        try:
            result = json.loads(inside)
            if isinstance(result, dict):
                logger.debug("Strategy 0 (fence extract) succeeded")
                return result
        except json.JSONDecodeError as e:
            logger.debug("Strategy 0 parse failed: %s", e)

    # ── Strategy 1: strip all markdown fences, then direct parse ──
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    try:
        result = json.loads(cleaned)
        if isinstance(result, dict):
            logger.debug("Strategy 1 (cleaned direct) succeeded")
            return result
    except json.JSONDecodeError as e:
        logger.debug("Strategy 1 parse failed: %s", e)

    # ── Strategy 2: extract outermost { … } ──
    depth = 0
    start = None
    for i, ch in enumerate(cleaned):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start is not None:
                try:
                    result = json.loads(cleaned[start : i + 1])
                    if isinstance(result, dict):
                        logger.debug("Strategy 2 (brace extract) succeeded")
                        return result
                except json.JSONDecodeError:
                    pass
                start = None

    # ── Detect truncation (JSON cut off by max_tokens) ──
    if cleaned.startswith("{") and not cleaned.endswith("}"):
        logger.error(
            "JSON appears TRUNCATED (optimizer). Response length=%d chars.", len(raw)
        )
        raise ValueError(
            "AI response was truncated (JSON incomplete). Please retry."
        )

    # Nothing worked
    logger.error(
        "JSON PARSE FAILED (optimizer) – raw response (%d chars):\n%.1000s",
        len(response_text),
        response_text,
    )
    raise ValueError(
        "Could not parse JSON from AI response. "
        f"Raw length={len(response_text)}, first 200 chars: {response_text[:200]}"
    )
