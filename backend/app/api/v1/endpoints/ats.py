"""ATS (Applicant Tracking System) analysis endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from app.core.security import get_current_user
from app.schemas.ats import (
    ATSAnalyzeRequest,
    ATSAnalysisResult,
    ApplyChangesRequest,
    FetchJobRequest,
    JobPostingData,
)

router = APIRouter()


@router.post("/analyze", response_model=ATSAnalysisResult)
async def analyze_cv(
    body: ATSAnalyzeRequest,
    user: dict = Depends(get_current_user),
):
    """Analyze a CV against a job description for ATS compatibility."""
    try:
        from app.services.firebase.cv_service import get_cv

        # Fetch the CV
        cv = get_cv(user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        # Use AI to perform ATS analysis
        try:
            from app.services.ai.gemini_client import generate_json
            import json

            cv_content = json.dumps(cv.get("content", {}), indent=2)

            prompt = (
                "You are an ATS (Applicant Tracking System) expert. Analyze this CV "
                "against the job description. Return a JSON object with:\n"
                "- overall_score: int (0-100)\n"
                "- breakdown: list of {label, score (0-100), icon}\n"
                "- missing_keywords: list of strings\n"
                "- present_keywords: list of strings\n"
                "- suggestions: list of improvement strings\n"
                "- diff_changes: list of {section, before, after}\n"
                "- keyword_match_pct: int (0-100)\n\n"
                f"CV Content:\n{cv_content[:6000]}\n\n"
                f"Job Description:\n{body.job_description[:4000]}"
            )

            result = await generate_json(prompt)
            return ATSAnalysisResult(**result)
        except ImportError:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="ATS analysis service is not yet available",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS analysis failed: {exc}",
        )


@router.post("/apply-changes")
async def apply_changes(
    body: ApplyChangesRequest,
    user: dict = Depends(get_current_user),
):
    """Apply accepted ATS changes to a CV."""
    try:
        from app.services.firebase.cv_service import get_cv, update_cv

        cv = get_cv(user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        content = cv.get("content", {})

        # Add missing keywords to skills if they aren't already present
        existing_skills = content.get("skills", [])
        for keyword in body.added_keywords:
            if keyword.lower() not in [s.lower() for s in existing_skills]:
                existing_skills.append(keyword)
        content["skills"] = existing_skills

        updated = update_cv(user["uid"], body.cv_id, {"content": content})
        return {
            "message": "Changes applied successfully",
            "cv": updated,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply changes: {exc}",
        )


@router.post("/fetch-job", response_model=JobPostingData)
async def fetch_job(
    body: FetchJobRequest,
    user: dict = Depends(get_current_user),
):
    """Fetch and parse a job posting from a URL."""
    try:
        try:
            import requests
            from app.services.ai.gemini_client import generate_json

            # Fetch the job page
            resp = requests.get(body.url, timeout=15, headers={
                "User-Agent": "Mozilla/5.0 (compatible; CVFlow/1.0)"
            })
            resp.raise_for_status()
            page_text = resp.text[:10000]

            # Use AI to extract structured job data
            prompt = (
                "Extract job posting data from this HTML content. "
                "Return a JSON object with:\n"
                "- title: string (job title)\n"
                "- company: string\n"
                "- location: string\n"
                "- description: string (full job description text)\n"
                "- requirements: list of strings\n\n"
                f"HTML Content:\n{page_text}"
            )

            result = await generate_json(prompt)
            return JobPostingData(**result)
        except ImportError:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Job fetching service is not yet available",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch job posting: {exc}",
        )


@router.post("/download-tailored")
async def download_tailored(
    body: ATSAnalyzeRequest,
    user: dict = Depends(get_current_user),
):
    """Generate and download a tailored PDF CV optimized for the job description."""
    try:
        from app.services.firebase.cv_service import get_cv

        cv = get_cv(user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        # Try to generate tailored PDF
        try:
            from app.services.pdf.generator import generate_cv_pdf

            pdf_bytes = await generate_cv_pdf(cv)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="tailored_{cv.get("title", "cv")}.pdf"',
                },
            )
        except ImportError:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PDF generation service is not yet available",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tailored PDF: {exc}",
        )
