import json
import re
from typing import Optional, Union
from .gemini_client import generate_content
from app.schemas.cv import CVAnalysisResult, CVAnalysisPreview, KeywordMatch, CVSection


CV_ANALYSIS_PROMPT = """You are an expert ATS (Applicant Tracking System) analyzer and career coach. Analyze the following CV against the job description and provide a detailed analysis.

## CV Content:
{cv_text}

## Job Description:
{job_description}

## Instructions:
Analyze the CV and provide your response in the following JSON format only (no additional text):

{{
    "overall_score": <number 0-100>,
    "ats_compatibility": <number 0-100>,
    "keyword_matches": [
        {{
            "keyword": "<keyword from job description>",
            "found": <true/false>,
            "importance": "<low/medium/high>",
            "suggestion": "<suggestion if not found, null otherwise>"
        }}
    ],
    "missing_keywords": ["<list of important keywords not found in CV>"],
    "sections": [
        {{
            "name": "<section name: Contact, Summary, Experience, Education, Skills, etc.>",
            "score": <number 0-100>,
            "feedback": "<brief feedback>",
            "suggestions": ["<improvement suggestions>"]
        }}
    ],
    "summary": "<2-3 sentence summary of the analysis>",
    "improvement_tips": ["<actionable improvement tips>"]
}}

Be thorough but constructive. Focus on ATS optimization and relevance to the job description.
"""


async def analyze_cv(
    cv_text: str,
    job_description: str,
    is_preview: bool = False,
) -> Union[CVAnalysisResult, CVAnalysisPreview]:
    """
    Analyze a CV against a job description using Gemini AI.

    Args:
        cv_text: The extracted text content from the CV.
        job_description: The job description to match against.
        is_preview: If True, return a limited preview for unauthenticated users.

    Returns:
        Full CVAnalysisResult or limited CVAnalysisPreview.
    """
    prompt = CV_ANALYSIS_PROMPT.format(
        cv_text=cv_text,
        job_description=job_description,
    )

    response_text = await generate_content(prompt, max_tokens=4096)

    # Parse JSON from response
    analysis_data = _parse_json_response(response_text)

    # Build keyword matches
    keyword_matches = [
        KeywordMatch(
            keyword=km.get("keyword", ""),
            found=km.get("found", False),
            importance=km.get("importance", "medium"),
            suggestion=km.get("suggestion"),
        )
        for km in analysis_data.get("keyword_matches", [])
    ]

    # Build sections
    sections = [
        CVSection(
            name=s.get("name", ""),
            score=s.get("score", 0),
            feedback=s.get("feedback", ""),
            suggestions=s.get("suggestions", []),
        )
        for s in analysis_data.get("sections", [])
    ]

    if is_preview:
        # Return limited preview for free/unauthenticated users
        return CVAnalysisPreview(
            overall_score=analysis_data.get("overall_score", 0),
            preview_keywords=keyword_matches[:3],  # Only first 3 keywords
            summary_preview=_truncate_text(analysis_data.get("summary", ""), 150),
        )

    return CVAnalysisResult(
        overall_score=analysis_data.get("overall_score", 0),
        ats_compatibility=analysis_data.get("ats_compatibility", 0),
        keyword_matches=keyword_matches,
        missing_keywords=analysis_data.get("missing_keywords", []),
        sections=sections,
        summary=analysis_data.get("summary", ""),
        improvement_tips=analysis_data.get("improvement_tips", []),
    )


def _parse_json_response(response_text: str) -> dict:
    """Parse JSON from Gemini response, handling potential formatting issues."""
    # Try to find JSON in the response
    json_match = re.search(r'\{[\s\S]*\}', response_text)

    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # Return default structure if parsing fails
    return {
        "overall_score": 50,
        "ats_compatibility": 50,
        "keyword_matches": [],
        "missing_keywords": [],
        "sections": [],
        "summary": "Unable to analyze CV. Please try again.",
        "improvement_tips": [],
    }


def _truncate_text(text: str, max_length: int) -> str:
    """Truncate text to max length, adding ellipsis if needed."""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."
