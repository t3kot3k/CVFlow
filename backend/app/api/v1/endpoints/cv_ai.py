"""CV AI-powered endpoints: improve text, generate summary, suggest bullets."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from app.core.security import get_current_user

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / response models specific to this router
# ---------------------------------------------------------------------------

class ImproveTextRequest(BaseModel):
    text: str
    context: str
    language: str = "en"


class ImproveTextResponse(BaseModel):
    improved_text: str


class GenerateSummaryRequest(BaseModel):
    cv_id: str
    target_role: str
    language: str = "en"


class GenerateSummaryResponse(BaseModel):
    summary: str


class SuggestBulletsRequest(BaseModel):
    job_title: str
    company: Optional[str] = None
    industry: Optional[str] = None


class SuggestBulletsResponse(BaseModel):
    bullets: List[str]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/improve-text", response_model=ImproveTextResponse)
async def improve_text(
    body: ImproveTextRequest,
    user: dict = Depends(get_current_user),
):
    """Improve a piece of CV text using AI to make it more impactful and ATS-friendly."""
    try:
        from app.services.ai.cv_improver import improve_text as _improve_text

        improved = await _improve_text(
            text=body.text,
            context=body.context,
            language=body.language,
        )
        return ImproveTextResponse(improved_text=improved)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve text: {exc}",
        )


@router.post("/generate-summary", response_model=GenerateSummaryResponse)
async def generate_summary(
    body: GenerateSummaryRequest,
    user: dict = Depends(get_current_user),
):
    """Generate a professional summary for a CV based on its content and a target role."""
    try:
        from app.services.firebase.cv_service import get_cv
        from app.services.ai.cv_improver import generate_summary as _generate_summary

        # Fetch the CV content
        cv = get_cv(user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        # Serialize CV content to text for the AI
        import json
        cv_content_text = json.dumps(cv.get("content", {}), indent=2)

        summary = await _generate_summary(
            cv_content=cv_content_text,
            target_role=body.target_role,
            language=body.language,
        )
        return GenerateSummaryResponse(summary=summary)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {exc}",
        )


@router.post("/suggest-bullets", response_model=SuggestBulletsResponse)
async def suggest_bullets(
    body: SuggestBulletsRequest,
    user: dict = Depends(get_current_user),
):
    """Suggest achievement-oriented bullet points for a given role."""
    try:
        from app.services.ai.cv_improver import suggest_bullets as _suggest_bullets

        bullets = await _suggest_bullets(
            job_title=body.job_title,
            company=body.company,
            industry=body.industry,
        )
        return SuggestBulletsResponse(bullets=bullets)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suggest bullets: {exc}",
        )
