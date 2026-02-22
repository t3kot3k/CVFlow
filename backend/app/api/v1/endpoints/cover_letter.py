"""Cover letter generation and management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from typing import List

from app.core.security import get_current_user
from app.schemas.cover_letter import (
    CoverLetterGenerateRequest,
    CoverLetterRewriteRequest,
    CoverLetterContent,
    CoverLetterVersion,
    CoverLetterDownloadRequest,
)

router = APIRouter()


@router.post("/generate", response_model=CoverLetterContent)
async def generate_cover_letter(
    body: CoverLetterGenerateRequest,
    user: dict = Depends(get_current_user),
):
    """Generate a cover letter based on CV content and a job description."""
    try:
        from app.services.firebase.cv_service import get_cv
        from app.services.ai.cover_letter_gen import generate_cover_letter as _gen_cl
        from app.core.firebase import get_db
        import json
        from datetime import datetime

        # Fetch the CV
        cv = get_cv(user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        cv_content = json.dumps(cv.get("content", {}), indent=2)
        if body.custom_instructions:
            cv_content += f"\n\nCandidate instructions: {body.custom_instructions}"

        # Use the dedicated cover letter AI service (better prompting)
        paragraphs = await _gen_cl(
            cv_content=cv_content[:6000],
            job_description=body.job_description[:3000],
            tone=body.tone,
            format=body.format,
            language=body.language,
        )

        if not paragraphs:
            raise ValueError("AI returned an empty cover letter. Please try again.")

        word_count = sum(len(p.split()) for p in paragraphs)

        # Save to Firestore
        cl_data = {
            "cv_id": body.cv_id,
            "paragraphs": paragraphs,
            "tone": body.tone,
            "format": body.format,
            "language": body.language,
            "word_count": word_count,
            "created_at": datetime.utcnow().isoformat(),
            "uid": user["uid"],
        }
        db = get_db()
        _, ref = db.collection("users").document(user["uid"]).collection("cover_letters").add(cl_data)

        return CoverLetterContent(
            id=ref.id,
            cv_id=body.cv_id,
            paragraphs=paragraphs,
            tone=body.tone,
            format=body.format,
            language=body.language,
            word_count=word_count,
            created_at=cl_data["created_at"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cover letter: {exc}",
        )


@router.post("/rewrite-paragraph")
async def rewrite_paragraph(
    body: CoverLetterRewriteRequest,
    user: dict = Depends(get_current_user),
):
    """Rewrite a specific paragraph of a cover letter."""
    try:
        from app.services.ai.cover_letter_gen import rewrite_paragraph as _rewrite

        rewritten = await _rewrite(
            paragraph=body.current_text,
            tone=body.tone,
            instructions=body.instructions,
        )
        return {"rewritten_text": rewritten}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rewrite paragraph: {exc}",
        )


@router.post("/{cl_id}/save-version", status_code=status.HTTP_201_CREATED)
async def save_version(
    cl_id: str,
    user: dict = Depends(get_current_user),
):
    """Save the current state of a cover letter as a version."""
    try:
        from app.core.firebase import get_db
        from datetime import datetime

        db = get_db()
        cl_ref = db.collection("users").document(user["uid"]).collection("cover_letters").document(cl_id)
        cl_doc = cl_ref.get()

        if not cl_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found",
            )

        cl_data = cl_doc.to_dict()
        version_data = {
            "paragraphs": cl_data.get("paragraphs", []),
            "tone": cl_data.get("tone", "professional"),
            "created_at": datetime.utcnow().isoformat(),
        }

        _, version_ref = cl_ref.collection("versions").add(version_data)

        return CoverLetterVersion(
            id=version_ref.id,
            tone=version_data["tone"],
            created_at=version_data["created_at"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save version: {exc}",
        )


@router.get("/{cl_id}/versions", response_model=List[CoverLetterVersion])
async def list_versions(
    cl_id: str,
    user: dict = Depends(get_current_user),
):
    """List all saved versions of a cover letter."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        cl_ref = db.collection("users").document(user["uid"]).collection("cover_letters").document(cl_id)

        # Verify cover letter exists
        if not cl_ref.get().exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found",
            )

        versions = []
        docs = cl_ref.collection("versions").order_by("created_at", direction="DESCENDING").stream()
        for doc in docs:
            data = doc.to_dict()
            versions.append(CoverLetterVersion(
                id=doc.id,
                tone=data.get("tone", "professional"),
                created_at=data.get("created_at", ""),
            ))
        return versions
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list versions: {exc}",
        )


@router.post("/download")
async def download_cover_letter(
    body: CoverLetterDownloadRequest,
    user: dict = Depends(get_current_user),
):
    """Generate and download a cover letter as PDF or DOCX."""
    try:
        full_text = "\n\n".join(body.paragraphs)

        if body.format == "pdf":
            try:
                from app.services.pdf.generator import generate_cover_letter_pdf

                pdf_bytes = await generate_cover_letter_pdf(
                    text=full_text,
                    tone=body.tone,
                    letter_format=body.letter_format,
                )
                return Response(
                    content=pdf_bytes,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": 'attachment; filename="cover_letter.pdf"',
                    },
                )
            except ImportError:
                # Fallback: generate a simple PDF with reportlab or return text
                raise HTTPException(
                    status_code=status.HTTP_501_NOT_IMPLEMENTED,
                    detail="PDF generation service is not yet available",
                )
        elif body.format == "docx":
            try:
                from app.services.pdf.generator import generate_cover_letter_docx

                docx_bytes = await generate_cover_letter_docx(
                    text=full_text,
                    tone=body.tone,
                    letter_format=body.letter_format,
                )
                return Response(
                    content=docx_bytes,
                    media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    headers={
                        "Content-Disposition": 'attachment; filename="cover_letter.docx"',
                    },
                )
            except ImportError:
                raise HTTPException(
                    status_code=status.HTTP_501_NOT_IMPLEMENTED,
                    detail="DOCX generation service is not yet available",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported format: {body.format}. Use 'pdf' or 'docx'.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download cover letter: {exc}",
        )
