"""CV CRUD endpoints: list, create, upload-pdf, get, update, delete, duplicate, auto-save, preview."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import Response
from typing import List

from app.core.security import get_current_user
from app.schemas.cv import (
    CVCreate,
    CVUpdate,
    CVSummary,
    CVDetail,
    CVContent,
)

router = APIRouter()


@router.get("/", response_model=List[CVSummary])
@router.get("", response_model=List[CVSummary], include_in_schema=False)
async def list_cvs(user: dict = Depends(get_current_user)):
    """List all CVs for the current user."""
    try:
        from app.services.firebase.cv_service import list_cvs as _list_cvs

        cvs = _list_cvs(user["uid"])
        return cvs
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list CVs: {exc}",
        )


@router.post("/", response_model=CVDetail, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=CVDetail, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_cv(
    body: CVCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new CV."""
    try:
        from app.services.firebase.cv_service import create_cv as _create_cv

        cv_data = {
            "title": body.title,
            "template_id": body.template_id,
            "content": CVContent().model_dump(),
            "status": "draft",
        }
        cv = _create_cv(user["uid"], cv_data)
        return cv
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create CV: {exc}",
        )


@router.post("/upload-pdf", response_model=CVDetail, status_code=status.HTTP_201_CREATED)
async def upload_pdf_cv(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload a PDF CV, extract its content with AI, and create a new CV document."""
    import io
    import PyPDF2

    # ── 1. Validate file ──────────────────────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF file is too large (max 10 MB).",
        )

    # ── 2. Extract text from PDF ──────────────────────────────────────────────
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = [page.extract_text() or "" for page in reader.pages]
        raw_text = "\n".join(pages_text).strip()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read PDF: {exc}",
        )

    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The PDF appears to be empty or image-based (non-selectable text). Please use a text-based PDF.",
        )

    # ── 3. Parse CV structure with Gemini ─────────────────────────────────────
    try:
        from app.services.ai.gemini_client import generate_json

        prompt = f"""Extract the following CV/resume text into a structured JSON object.

CV TEXT:
{raw_text[:8000]}

Return ONLY a JSON object with this exact structure (omit fields that are not present):
{{
  "title": "Inferred CV title like 'John Doe — Software Engineer'",
  "contact_info": {{
    "name": "Full name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, Country",
    "linkedin": "linkedin URL if present",
    "website": "personal website if present"
  }},
  "summary": "Professional summary paragraph if present",
  "experience": [
    {{
      "job_title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "start_date": "Month Year",
      "end_date": "Month Year",
      "current": false,
      "bullets": ["Achievement or responsibility 1", "Achievement 2"]
    }}
  ],
  "education": [
    {{
      "school": "University Name",
      "degree": "Bachelor / Master / PhD",
      "field": "Computer Science",
      "graduation_date": "2020",
      "gpa": "3.8"
    }}
  ],
  "skills": ["Python", "React", "SQL"],
  "languages": ["English", "French"],
  "certifications": ["AWS Certified", "PMP"],
  "projects": [
    {{"name": "Project Name", "description": "Short description", "url": ""}}
  ]
}}"""

        parsed = await generate_json(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI parsing failed: {exc}",
        )

    # ── 4. Build CVContent from parsed data ───────────────────────────────────
    doc_title = str(parsed.get("title") or "Uploaded CV").strip()[:80]

    content_data = {}
    if parsed.get("contact_info"):
        content_data["contact_info"] = parsed["contact_info"]
    if parsed.get("summary"):
        content_data["summary"] = str(parsed["summary"])
    if parsed.get("experience"):
        content_data["experience"] = parsed["experience"]
    if parsed.get("education"):
        content_data["education"] = parsed["education"]
    if parsed.get("skills"):
        content_data["skills"] = [str(s) for s in parsed["skills"] if s]
    if parsed.get("languages"):
        content_data["languages"] = [str(l) for l in parsed["languages"] if l]
    if parsed.get("certifications"):
        content_data["certifications"] = [str(c) for c in parsed["certifications"] if c]
    if parsed.get("projects"):
        content_data["projects"] = parsed["projects"]

    # ── 5. Create CV in Firebase ──────────────────────────────────────────────
    try:
        from app.services.firebase.cv_service import create_cv as _create_cv

        cv_doc = {
            "title": doc_title,
            "template_id": "olive",
            "content": content_data,
            "status": "draft",
        }
        cv = _create_cv(user["uid"], cv_doc)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save CV: {exc}",
        )

    # ── 6. Store original PDF bytes in Firebase Storage (non-critical) ────────
    from app.core.config import settings as _settings
    if _settings.FIREBASE_STORAGE_BUCKET:
        try:
            from app.core.firebase import get_storage_bucket
            bucket = get_storage_bucket()
            blob = bucket.blob(f"cvs/{user['uid']}/{cv['id']}/original.pdf")
            blob.upload_from_string(pdf_bytes, content_type="application/pdf")
        except Exception:
            pass  # Non-critical: ReportLab generation will be used as fallback

    return cv


@router.get("/{cv_id}", response_model=CVDetail)
async def get_cv(cv_id: str, user: dict = Depends(get_current_user)):
    """Get a specific CV by ID."""
    try:
        from app.services.firebase.cv_service import get_cv as _get_cv

        cv = _get_cv(user["uid"], cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )
        return cv
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get CV: {exc}",
        )


@router.put("/{cv_id}", response_model=CVDetail)
async def update_cv(
    cv_id: str,
    body: CVUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a CV."""
    try:
        from app.services.firebase.cv_service import update_cv as _update_cv

        update_data = body.model_dump(exclude_none=True)
        if "content" in update_data and update_data["content"] is not None:
            # Ensure content is serialized as a dict
            update_data["content"] = (
                body.content.model_dump() if body.content else update_data["content"]
            )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        cv = _update_cv(user["uid"], cv_id, update_data)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )
        return cv
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update CV: {exc}",
        )


@router.delete("/{cv_id}", status_code=status.HTTP_200_OK)
async def delete_cv(cv_id: str, user: dict = Depends(get_current_user)):
    """Delete a CV."""
    try:
        from app.services.firebase.cv_service import delete_cv as _delete_cv

        deleted = _delete_cv(user["uid"], cv_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )
        return {"message": "CV deleted successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete CV: {exc}",
        )


@router.post("/{cv_id}/duplicate", response_model=CVDetail, status_code=status.HTTP_201_CREATED)
async def duplicate_cv(cv_id: str, user: dict = Depends(get_current_user)):
    """Duplicate an existing CV."""
    try:
        from app.services.firebase.cv_service import duplicate_cv as _duplicate_cv

        new_cv = _duplicate_cv(user["uid"], cv_id)
        if new_cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source CV not found",
            )
        return new_cv
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to duplicate CV: {exc}",
        )


@router.post("/{cv_id}/auto-save", status_code=status.HTTP_200_OK)
async def auto_save_cv(
    cv_id: str,
    body: CVContent,
    user: dict = Depends(get_current_user),
):
    """Auto-save CV content (lightweight update for the content field only)."""
    try:
        from app.services.firebase.cv_service import update_cv as _update_cv

        update_data = {"content": body.model_dump()}
        cv = _update_cv(user["uid"], cv_id, update_data)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )
        return {"message": "Auto-saved successfully", "updated_at": cv.get("updated_at")}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to auto-save CV: {exc}",
        )


@router.get("/{cv_id}/preview")
async def preview_cv(cv_id: str, user: dict = Depends(get_current_user)):
    """Get a PDF preview of the CV."""
    try:
        from app.services.firebase.cv_service import get_cv as _get_cv

        cv = _get_cv(user["uid"], cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        # Try to serve the original uploaded PDF from Firebase Storage first
        import asyncio as _asyncio
        from app.core.config import settings as _settings
        if _settings.FIREBASE_STORAGE_BUCKET:
            try:
                from app.core.firebase import get_storage_bucket
                bucket = get_storage_bucket()
                blob = bucket.blob(f"cvs/{user['uid']}/{cv_id}/original.pdf")
                blob_exists = await _asyncio.to_thread(blob.exists)
                if blob_exists:
                    pdf_bytes = await _asyncio.to_thread(blob.download_as_bytes)
                    _title = (cv.get("title") or "cv").replace("\u2014", "-").replace("\u2013", "-")
                    _title = _title.encode("latin-1", "ignore").decode("latin-1").strip() or "cv"
                    return Response(
                        content=pdf_bytes,
                        media_type="application/pdf",
                        headers={
                            "Content-Disposition": f'inline; filename="{_title}.pdf"',
                        },
                    )
            except Exception:
                pass  # Fall through to ReportLab generation

        # Generate PDF with ReportLab template
        try:
            from app.services.pdf.generator import generate_cv_pdf

            pdf_bytes = await generate_cv_pdf(cv)
            _title = (cv.get("title") or "cv").replace("\u2014", "-").replace("\u2013", "-")
            _title = _title.encode("latin-1", "ignore").decode("latin-1").strip() or "cv"
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'inline; filename="{_title}.pdf"',
                },
            )
        except ImportError:
            # PDF generator not yet implemented
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PDF preview generation is not yet available",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate preview: {exc}",
        )
