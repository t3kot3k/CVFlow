"""Job tracking endpoints: CRUD, stages, notes, timeline."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobDetail,
    JobStats,
    JobStageUpdate,
    ImportJobUrlRequest,
    TimelineEvent,
    LogActivityRequest,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper: Firestore references
# ---------------------------------------------------------------------------

def _jobs_col(db, uid: str):
    return db.collection("users").document(uid).collection("jobs")


def _job_ref(db, uid: str, job_id: str):
    return _jobs_col(db, uid).document(job_id)


# ---------------------------------------------------------------------------
# Request model for notes
# ---------------------------------------------------------------------------

class NotesUpdate(BaseModel):
    notes: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/")
@router.get("", include_in_schema=False)
async def list_jobs(user: dict = Depends(get_current_user)):
    """List all jobs and compute stats for the current user."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        docs = (
            _jobs_col(db, user["uid"])
            .order_by("updated_at", direction="DESCENDING")
            .stream()
        )

        jobs = []
        stats = {"total": 0, "saved": 0, "applied": 0, "interview": 0, "offer": 0, "rejected": 0}

        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            jobs.append(data)
            stats["total"] += 1
            stage = data.get("stage", "saved")
            if stage in stats:
                stats[stage] += 1

        # Calculate response rate
        applied_plus = stats["applied"] + stats["interview"] + stats["offer"]
        response_rate = 0.0
        if stats["total"] > 0:
            response_rate = round((stats["interview"] + stats["offer"]) / max(applied_plus, 1) * 100, 1)

        return {
            "jobs": jobs,
            "stats": JobStats(
                total=stats["total"],
                saved=stats["saved"],
                applied=stats["applied"],
                interview=stats["interview"],
                offer=stats["offer"],
                rejected=stats["rejected"],
                response_rate=response_rate,
            ),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list jobs: {exc}",
        )


@router.post("/", response_model=JobDetail, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=JobDetail, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_job(
    body: JobCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new job entry."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        now = datetime.utcnow().isoformat()

        job_data = {
            **body.model_dump(),
            "uid": user["uid"],
            "created_at": now,
            "updated_at": now,
        }
        _, ref = _jobs_col(db, user["uid"]).add(job_data)
        job_data["id"] = ref.id

        # Log initial timeline event
        _jobs_col(db, user["uid"]).document(ref.id).collection("timeline").add({
            "event_type": "saved",
            "description": f"Job saved: {body.role} at {body.company}",
            "created_at": now,
        })

        return job_data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job: {exc}",
        )


@router.post("/import-url", response_model=JobDetail)
async def import_job_url(
    body: ImportJobUrlRequest,
    user: dict = Depends(get_current_user),
):
    """Import a job from a URL by scraping and parsing."""
    try:
        import requests
        from app.services.ai.gemini_client import generate_json
        from app.core.firebase import get_db

        # Fetch the job page
        resp = requests.get(body.url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (compatible; CVFlow/1.0)"
        })
        resp.raise_for_status()
        page_text = resp.text[:10000]

        # Extract job data using AI
        prompt = (
            "Extract job posting data from this HTML. Return a JSON object with:\n"
            "- company: string\n"
            "- role: string (job title)\n"
            "- location: string\n"
            "- salary: string or null\n"
            "- tags: list of strings (relevant keywords)\n\n"
            f"HTML:\n{page_text}"
        )
        parsed = await generate_json(prompt)

        db = get_db()
        now = datetime.utcnow().isoformat()

        job_data = {
            "company": parsed.get("company", "Unknown"),
            "role": parsed.get("role", "Unknown"),
            "location": parsed.get("location"),
            "job_url": body.url,
            "salary": parsed.get("salary"),
            "tags": parsed.get("tags", []),
            "stage": "saved",
            "uid": user["uid"],
            "created_at": now,
            "updated_at": now,
        }
        _, ref = _jobs_col(db, user["uid"]).add(job_data)
        job_data["id"] = ref.id

        return job_data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import job: {exc}",
        )


@router.get("/{job_id}", response_model=JobDetail)
async def get_job(job_id: str, user: dict = Depends(get_current_user)):
    """Get a specific job by ID."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        doc = _job_ref(db, user["uid"], job_id).get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        data = doc.to_dict()
        data["id"] = doc.id

        # Calculate days waiting
        created = data.get("created_at", "")
        if created:
            try:
                created_dt = datetime.fromisoformat(created)
                data["days_waiting"] = (datetime.utcnow() - created_dt).days
            except (ValueError, TypeError):
                pass

        return data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job: {exc}",
        )


@router.put("/{job_id}", response_model=JobDetail)
async def update_job(
    job_id: str,
    body: JobUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a job entry."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        ref = _job_ref(db, user["uid"], job_id)
        doc = ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        update_data["updated_at"] = datetime.utcnow().isoformat()
        ref.update(update_data)

        merged = {**doc.to_dict(), **update_data, "id": doc.id}
        return merged
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job: {exc}",
        )


@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
async def delete_job(job_id: str, user: dict = Depends(get_current_user)):
    """Delete a job entry."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        ref = _job_ref(db, user["uid"], job_id)
        doc = ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        # Delete timeline subcollection
        timeline_docs = ref.collection("timeline").stream()
        for tdoc in timeline_docs:
            tdoc.reference.delete()

        ref.delete()
        return {"message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job: {exc}",
        )


@router.put("/{job_id}/stage", response_model=JobDetail)
async def update_stage(
    job_id: str,
    body: JobStageUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a job's pipeline stage."""
    try:
        from app.core.firebase import get_db

        valid_stages = {"saved", "applied", "interview", "offer", "rejected"}
        if body.stage not in valid_stages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stage. Must be one of: {', '.join(valid_stages)}",
            )

        db = get_db()
        ref = _job_ref(db, user["uid"], job_id)
        doc = ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        now = datetime.utcnow().isoformat()
        ref.update({"stage": body.stage, "updated_at": now})

        # Log timeline event
        ref.collection("timeline").add({
            "event_type": body.stage,
            "description": f"Stage updated to: {body.stage}",
            "created_at": now,
        })

        merged = {**doc.to_dict(), "stage": body.stage, "updated_at": now, "id": doc.id}
        return merged
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update stage: {exc}",
        )


@router.get("/{job_id}/notes")
async def get_notes(job_id: str, user: dict = Depends(get_current_user)):
    """Get notes for a specific job."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        doc = _job_ref(db, user["uid"], job_id).get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        data = doc.to_dict()
        return {"notes": data.get("notes", "")}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notes: {exc}",
        )


@router.put("/{job_id}/notes")
async def update_notes(
    job_id: str,
    body: NotesUpdate,
    user: dict = Depends(get_current_user),
):
    """Update notes for a specific job."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        ref = _job_ref(db, user["uid"], job_id)
        doc = ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        ref.update({"notes": body.notes, "updated_at": datetime.utcnow().isoformat()})
        return {"notes": body.notes}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notes: {exc}",
        )


@router.get("/{job_id}/timeline", response_model=List[TimelineEvent])
async def get_timeline(job_id: str, user: dict = Depends(get_current_user)):
    """Get the activity timeline for a specific job."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        job_doc = _job_ref(db, user["uid"], job_id).get()

        if not job_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        events = []
        docs = (
            _job_ref(db, user["uid"], job_id)
            .collection("timeline")
            .order_by("created_at", direction="DESCENDING")
            .stream()
        )
        for doc in docs:
            data = doc.to_dict()
            events.append(TimelineEvent(
                id=doc.id,
                event_type=data.get("event_type", ""),
                description=data.get("description", ""),
                created_at=data.get("created_at", ""),
            ))
        return events
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get timeline: {exc}",
        )


@router.post("/{job_id}/timeline", response_model=TimelineEvent, status_code=status.HTTP_201_CREATED)
async def log_activity(
    job_id: str,
    body: LogActivityRequest,
    user: dict = Depends(get_current_user),
):
    """Log an activity event in the job timeline."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        job_doc = _job_ref(db, user["uid"], job_id).get()

        if not job_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

        now = datetime.utcnow().isoformat()
        event_data = {
            "event_type": body.event_type,
            "description": body.description,
            "created_at": now,
        }

        _, ref = _job_ref(db, user["uid"], job_id).collection("timeline").add(event_data)

        # Also update job's updated_at
        _job_ref(db, user["uid"], job_id).update({"updated_at": now})

        return TimelineEvent(
            id=ref.id,
            event_type=body.event_type,
            description=body.description,
            created_at=now,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log activity: {exc}",
        )
