"""CV CRUD endpoints: list, create, get, update, delete, duplicate, auto-save, preview."""

from fastapi import APIRouter, Depends, HTTPException, status
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

        # Try to generate PDF preview
        try:
            from app.services.pdf.generator import generate_cv_pdf

            pdf_bytes = await generate_cv_pdf(cv)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'inline; filename="{cv.get("title", "cv")}.pdf"',
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
