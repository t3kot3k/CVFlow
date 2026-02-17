"""LinkedIn profile analysis and optimization endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.schemas.linkedin import (
    LinkedInImportRequest,
    LinkedInAnalysis,
    GenerateSuggestionsRequest,
)

router = APIRouter()


@router.post("/import")
async def import_linkedin(
    body: LinkedInImportRequest,
    user: dict = Depends(get_current_user),
):
    """Import LinkedIn profile data from a URL or pasted text."""
    try:
        profile_text = ""

        if body.text:
            profile_text = body.text
        elif body.url:
            # Try to fetch the LinkedIn profile page
            try:
                import requests

                resp = requests.get(body.url, timeout=15, headers={
                    "User-Agent": "Mozilla/5.0 (compatible; CVFlow/1.0)"
                })
                resp.raise_for_status()
                profile_text = resp.text[:10000]
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not fetch LinkedIn profile. Please paste the profile text instead.",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide either a URL or profile text.",
            )

        # Parse basic profile data using AI
        from app.services.ai.gemini_client import generate_json

        prompt = (
            "Extract basic LinkedIn profile data from the following text. "
            "Return a JSON object with:\n"
            "- name: string\n"
            "- headline: string\n"
            "- location: string\n"
            "- summary: string\n"
            "- experience: list of {title, company, duration}\n"
            "- skills: list of strings\n"
            "- education: list of {school, degree}\n\n"
            f"Profile text:\n{profile_text[:6000]}"
        )

        parsed = await generate_json(prompt)
        return {
            "message": "LinkedIn profile imported successfully",
            "profile": parsed,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import LinkedIn profile: {exc}",
        )


@router.post("/analyze", response_model=LinkedInAnalysis)
async def analyze_profile(
    body: LinkedInImportRequest,
    user: dict = Depends(get_current_user),
):
    """Analyze a LinkedIn profile and provide an optimization score with suggestions."""
    try:
        profile_text = body.text or ""
        if not profile_text and body.url:
            try:
                import requests

                resp = requests.get(body.url, timeout=15, headers={
                    "User-Agent": "Mozilla/5.0 (compatible; CVFlow/1.0)"
                })
                resp.raise_for_status()
                profile_text = resp.text[:10000]
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not fetch LinkedIn profile.",
                )

        if not profile_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No profile content provided.",
            )

        from app.services.ai.gemini_client import generate_json

        prompt = (
            "You are a LinkedIn profile optimization expert. Analyze this profile "
            "and provide a detailed assessment. Return a JSON object with:\n"
            "- base_score: int (0-100, overall profile strength)\n"
            "- sections: list of objects, each with:\n"
            "  - id: string (e.g. 'headline', 'summary', 'experience', 'skills', 'education')\n"
            "  - label: string (display name)\n"
            "  - score: int (0-100)\n"
            "  - current: string (summary of current state)\n"
            "  - weaknesses: list of strings\n"
            "  - suggestions: list of {text: string, boost: string}\n"
            "- missing_skills: list of strings (in-demand skills not on profile)\n"
            "- quick_wins: list of strings (easy improvements)\n\n"
            f"Profile:\n{profile_text[:6000]}"
        )

        result = await generate_json(prompt)
        return LinkedInAnalysis(**result)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze profile: {exc}",
        )


@router.post("/generate-suggestions")
async def generate_suggestions(
    body: GenerateSuggestionsRequest,
    user: dict = Depends(get_current_user),
):
    """Generate AI-powered suggestions to improve a specific LinkedIn section."""
    try:
        from app.services.ai.gemini_client import generate_json

        prompt = (
            f"You are a LinkedIn optimization expert. Generate 3 improved versions "
            f"of the '{body.section_id}' section.\n\n"
            f"Current content:\n{body.current_content}\n\n"
        )
        if body.target_role:
            prompt += f"Target role: {body.target_role}\n\n"

        prompt += (
            "Return a JSON object with:\n"
            "- suggestions: list of {text: string, boost: string (e.g. '+15'), reasoning: string}"
        )

        result = await generate_json(prompt)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggestions: {exc}",
        )
