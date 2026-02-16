from __future__ import annotations

import json
import logging
import re
from typing import Union

from .gemini_client import generate_content
from app.schemas.cv import (
    CVAnalysisResult,
    CVAnalysisPreview,
    MatchedKeyword,
    MissingKeyword,
    ScoreBreakdown,
    ExperienceAlignment,
    TechnicalSkillsAnalysis,
    SoftSkillsAnalysis,
    AtsFormattingCheck,
    OptimizationSuggestion,
)

logger = logging.getLogger(__name__)

# ── Safety limits ────────────────────────────────────────────────────
MAX_CV_CHARS = 6000
MAX_JOB_DESC_CHARS = 5000
MIN_CV_CHARS = 100

# ── System instruction ──────────────────────────────────────────────
SYSTEM_INSTRUCTION = (
    "You are an ATS (Applicant Tracking System) analyzer. "
    "You MUST return ONLY valid JSON — no markdown, no commentary, "
    "no explanation outside the JSON object. Never wrap in ```json."
)

# ── Prompt ───────────────────────────────────────────────────────────
CV_ANALYSIS_PROMPT = """Compare the CV and the job description below. Return ONLY a single valid JSON object.

## CV Content:
{cv_text}

## Job Description:
{job_description}

Return exactly this JSON structure:

{{
  "matchScore": <integer 0-100>,
  "scoreBreakdown": {{
    "skillsMatch": <integer 0-100>,
    "experienceMatch": <integer 0-100>,
    "educationMatch": <integer 0-100>,
    "keywordsMatch": <integer 0-100>,
    "overallRelevance": <integer 0-100>
  }},
  "matchedKeywords": [
    {{
      "keyword": "<keyword found>",
      "context": "<Where or how it appears in the CV>"
    }}
  ],
  "missingKeywords": [
    {{
      "keyword": "<keyword from job description not in CV>",
      "importance": "<High|Medium|Low>",
      "suggestion": "<How to integrate it naturally in the CV>"
    }}
  ],
  "experienceAlignment": {{
    "strongMatches": ["<experience that directly matches job requirements>"],
    "partialMatches": ["<experience partially relevant>"],
    "gaps": ["<required experience missing from CV>"]
  }},
  "technicalSkillsAnalysis": {{
    "alignedSkills": ["<skill in both CV and job description>"],
    "missingCriticalSkills": ["<critical skill from job not in CV>"],
    "recommendedAdditions": ["<skill worth adding to strengthen CV>"]
  }},
  "softSkillsAnalysis": {{
    "alignedSoftSkills": ["<soft skill present>"],
    "missingSoftSkills": ["<soft skill the job asks for but CV lacks>"]
  }},
  "atsFormattingCheck": {{
    "formatScore": <integer 0-100>,
    "issuesDetected": ["<formatting issue>"],
    "recommendations": ["<formatting recommendation>"]
  }},
  "optimizationSuggestions": [
    {{
      "priority": "<High|Medium|Low>",
      "title": "<short title>",
      "description": "<what to improve and why>",
      "exampleRewrite": "<concrete rewritten text the candidate can copy>"
    }}
  ],
  "summary": "<professional 4-6 sentence ATS-style evaluation explaining the candidate alignment with the role>"
}}

RULES:
- matchScore must be realistic, not inflated.
- missingKeywords must be extracted directly from the job description.
- Suggestions must be actionable and concrete.
- exampleRewrite must be concrete and ready to use.
- Do NOT hallucinate certifications or skills the candidate does not have.
- Keep the output consistent in structure every time.
- Professional, neutral, ATS-like tone.
"""


# ── Text helpers ─────────────────────────────────────────────────────
def _clean_text(text: str) -> str:
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    truncated = text[:limit].rsplit(" ", 1)[0]
    logger.warning("Text truncated from %d to %d chars", len(text), len(truncated))
    return truncated


def _truncate_text(text: str, max_length: int) -> str:
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."


# ── JSON parser ──────────────────────────────────────────────────────
def _parse_json_response(response_text: str) -> dict:
    """Parse JSON from Gemini response. Raises ValueError on failure."""

    raw = response_text.strip()
    logger.debug("_parse_json_response – raw length=%d", len(raw))

    # ── Strategy 0: extract content inside ```json ... ``` fences ──
    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)```", raw, re.DOTALL)
    if fence_match:
        inside = fence_match.group(1).strip()
        logger.debug("Fence-block extracted – %d chars", len(inside))
        try:
            result = json.loads(inside)
            if isinstance(result, dict) and "matchScore" in result:
                logger.debug("Strategy 0 (fence extract) succeeded")
                return result
        except json.JSONDecodeError as e:
            logger.debug("Strategy 0 parse failed: %s", e)

    # ── Strategy 1: strip all markdown fences, then direct parse ──
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    logger.debug("Cleaned (fences removed) – %d chars, starts: %.80s", len(cleaned), cleaned[:80])
    try:
        result = json.loads(cleaned)
        if isinstance(result, dict) and "matchScore" in result:
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
                    if isinstance(result, dict) and "matchScore" in result:
                        logger.debug("Strategy 2 (brace extract) succeeded")
                        return result
                except json.JSONDecodeError:
                    pass
                start = None

    # ── Detect truncation (JSON cut off by max_tokens) ──
    if cleaned.startswith("{") and not cleaned.endswith("}"):
        logger.error(
            "JSON appears TRUNCATED (starts with '{' but does not end with '}'). "
            "Gemini likely hit max_output_tokens. Response length=%d chars.",
            len(raw),
        )
        raise ValueError(
            "AI response was truncated (JSON incomplete). "
            "This usually means the analysis was too long. Please retry."
        )

    # Nothing worked – log raw response and raise
    logger.error(
        "JSON PARSE FAILED – raw Gemini response (%d chars):\n%.1000s",
        len(response_text),
        response_text,
    )
    raise ValueError(
        "Could not parse JSON from AI response. "
        f"Raw length={len(response_text)}, first 200 chars: {response_text[:200]}"
    )


def _clamp(v, lo=0, hi=100) -> int:
    try:
        return max(lo, min(hi, int(v)))
    except (TypeError, ValueError):
        return lo


# ── Main entry point ─────────────────────────────────────────────────
async def analyze_cv(
    cv_text: str,
    job_description: str,
    is_preview: bool = False,
) -> Union[CVAnalysisResult, CVAnalysisPreview]:
    """Analyse a CV against a job description with the detailed ATS format.

    Raises on failure instead of returning silent zero-score fallback.
    """

    cv_text = _truncate(_clean_text(cv_text), MAX_CV_CHARS)
    job_description = _truncate(_clean_text(job_description), MAX_JOB_DESC_CHARS)

    # ---- Guard: CV text must be meaningful ---------------------------
    if len(cv_text) < MIN_CV_CHARS:
        raise ValueError(
            f"Extracted CV text is too short ({len(cv_text)} chars). "
            "The file may be a scanned image or corrupted."
        )

    logger.info(
        "┌─ ATS ANALYSIS START ─ cv_len=%d, job_len=%d, preview=%s",
        len(cv_text),
        len(job_description),
        is_preview,
    )

    prompt = CV_ANALYSIS_PROMPT.format(
        cv_text=cv_text,
        job_description=job_description,
    )

    logger.debug("Prompt length: %d chars", len(prompt))

    # ---- Call Gemini ------------------------------------------------
    # thinking_budget=0 disables Gemini 2.5 "thinking" mode so all
    # output tokens are used for the JSON response (not internal CoT).
    response_text = await generate_content(
        prompt,
        max_tokens=16384,
        temperature=0.2,
        system_instruction=SYSTEM_INSTRUCTION,
        thinking_budget=0,
    )
    logger.info(
        "├─ Gemini responded: %d chars – first 200: %.200s",
        len(response_text),
        response_text,
    )

    # ---- Parse JSON  (raises ValueError on failure) -----------------
    data = _parse_json_response(response_text)
    logger.info(
        "├─ JSON parsed OK – matchScore=%s, keys=%s",
        data.get("matchScore"),
        list(data.keys()),
    )

    # ---- Build typed objects ----------------------------------------
    score_bd_raw = data.get("scoreBreakdown") or {}
    score_breakdown = ScoreBreakdown(
        skillsMatch=_clamp(score_bd_raw.get("skillsMatch", 0)),
        experienceMatch=_clamp(score_bd_raw.get("experienceMatch", 0)),
        educationMatch=_clamp(score_bd_raw.get("educationMatch", 0)),
        keywordsMatch=_clamp(score_bd_raw.get("keywordsMatch", 0)),
        overallRelevance=_clamp(score_bd_raw.get("overallRelevance", 0)),
    )

    matched_keywords = [
        MatchedKeyword(
            keyword=mk.get("keyword", ""),
            context=mk.get("context", ""),
        )
        for mk in (data.get("matchedKeywords") or [])
        if isinstance(mk, dict)
    ]

    missing_keywords = [
        MissingKeyword(
            keyword=mk.get("keyword", ""),
            importance=mk.get("importance", "Medium"),
            suggestion=mk.get("suggestion", ""),
        )
        for mk in (data.get("missingKeywords") or [])
        if isinstance(mk, dict)
    ]

    ea_raw = data.get("experienceAlignment") or {}
    experience_alignment = ExperienceAlignment(
        strongMatches=ea_raw.get("strongMatches") or [],
        partialMatches=ea_raw.get("partialMatches") or [],
        gaps=ea_raw.get("gaps") or [],
    )

    ts_raw = data.get("technicalSkillsAnalysis") or {}
    technical_skills = TechnicalSkillsAnalysis(
        alignedSkills=ts_raw.get("alignedSkills") or [],
        missingCriticalSkills=ts_raw.get("missingCriticalSkills") or [],
        recommendedAdditions=ts_raw.get("recommendedAdditions") or [],
    )

    ss_raw = data.get("softSkillsAnalysis") or {}
    soft_skills = SoftSkillsAnalysis(
        alignedSoftSkills=ss_raw.get("alignedSoftSkills") or [],
        missingSoftSkills=ss_raw.get("missingSoftSkills") or [],
    )

    fc_raw = data.get("atsFormattingCheck") or {}
    formatting_check = AtsFormattingCheck(
        formatScore=_clamp(fc_raw.get("formatScore", 0)),
        issuesDetected=fc_raw.get("issuesDetected") or [],
        recommendations=fc_raw.get("recommendations") or [],
    )

    optimization_suggestions = [
        OptimizationSuggestion(
            priority=s.get("priority", "Medium"),
            title=s.get("title", ""),
            description=s.get("description", ""),
            exampleRewrite=s.get("exampleRewrite", ""),
        )
        for s in (data.get("optimizationSuggestions") or [])
        if isinstance(s, dict)
    ]

    match_score = _clamp(data.get("matchScore", 0))
    summary = data.get("summary") or "Analysis complete."

    # ---- Sanity check: if Gemini returned valid JSON but everything empty ----
    if match_score == 0 and not matched_keywords and not missing_keywords:
        logger.warning(
            "└─ Gemini returned 0 score with no keywords – raw data: %s",
            json.dumps(data, ensure_ascii=False)[:500],
        )

    logger.info(
        "└─ ATS ANALYSIS DONE – score=%d, matched=%d, missing=%d",
        match_score,
        len(matched_keywords),
        len(missing_keywords),
    )

    if is_preview:
        return CVAnalysisPreview(
            matchScore=match_score,
            scoreBreakdown=score_breakdown,
            matchedKeywords=matched_keywords[:3],
            summary=_truncate_text(summary, 200),
        )

    return CVAnalysisResult(
        matchScore=match_score,
        scoreBreakdown=score_breakdown,
        matchedKeywords=matched_keywords,
        missingKeywords=missing_keywords,
        experienceAlignment=experience_alignment,
        technicalSkillsAnalysis=technical_skills,
        softSkillsAnalysis=soft_skills,
        atsFormattingCheck=formatting_check,
        optimizationSuggestions=optimization_suggestions,
        summary=summary,
    )
