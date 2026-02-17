"""Onboarding endpoints: save data, status, LinkedIn import, PDF parse."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from app.core.security import get_current_user
from app.schemas.onboarding import OnboardingSaveRequest, OnboardingStatus

router = APIRouter()


@router.post("/save", status_code=status.HTTP_200_OK)
async def save_onboarding(
    body: OnboardingSaveRequest,
    user: dict = Depends(get_current_user),
):
    """Save onboarding data (situation, country, industries)."""
    try:
        from app.services.firebase.user_service import update_user

        update_data = {
            "onboarding": {
                "completed": True,
                "situation": body.situation,
                "country": body.country,
                "industries": body.industries,
            },
            "country": body.country,
        }
        update_user(user["uid"], update_data)
        return {"message": "Onboarding data saved successfully"}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save onboarding data: {exc}",
        )


@router.get("/status", response_model=OnboardingStatus)
async def get_onboarding_status(user: dict = Depends(get_current_user)):
    """Get the current user's onboarding status."""
    try:
        from app.services.firebase.user_service import get_user

        profile = get_user(user["uid"])
        if profile is None:
            return OnboardingStatus(completed=False)

        onboarding = profile.get("onboarding", {})
        return OnboardingStatus(
            completed=onboarding.get("completed", False),
            situation=onboarding.get("situation"),
            country=onboarding.get("country"),
            industries=onboarding.get("industries"),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get onboarding status: {exc}",
        )


@router.post("/import-linkedin", status_code=status.HTTP_200_OK)
async def import_linkedin(user: dict = Depends(get_current_user)):
    """Import LinkedIn profile data during onboarding (placeholder)."""
    # Placeholder - will be implemented when LinkedIn API integration is ready
    return {
        "message": "LinkedIn import is not yet available",
        "status": "placeholder",
    }


@router.post("/parse-pdf", status_code=status.HTTP_200_OK)
async def parse_pdf(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Parse an uploaded PDF CV and extract structured data."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted",
        )

    try:
        contents = await file.read()

        if len(contents) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large. Maximum size is 10MB.",
            )

        # Try to extract text from PDF
        try:
            import PyPDF2
            import io

            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
        except ImportError:
            # Fallback: return raw content info if PyPDF2 not available
            return {
                "message": "PDF parsing library not available",
                "file_name": file.filename,
                "file_size": len(contents),
                "text": "",
            }

        # Use AI to extract structured CV data from text
        try:
            from app.services.ai.gemini_client import generate_json

            prompt = (
                "Extract structured CV data from the following text. "
                "Return a JSON object with keys: contact_info (name, email, phone, location), "
                "summary, experience (list of {job_title, company, start_date, end_date, bullets}), "
                "education (list of {school, degree, field, graduation_date}), "
                "skills (list of strings), languages (list of strings).\n\n"
                f"CV Text:\n{text[:8000]}"
            )
            structured = await generate_json(prompt)
            return {
                "message": "PDF parsed successfully",
                "data": structured,
                "raw_text": text[:2000],
            }
        except Exception:
            # Return raw text if AI parsing fails
            return {
                "message": "PDF text extracted, AI structuring failed",
                "raw_text": text[:2000],
            }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse PDF: {exc}",
        )
