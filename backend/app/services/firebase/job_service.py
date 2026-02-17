from datetime import datetime

from app.core.firebase import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _jobs_col(uid: str):
    return get_db().collection("users").document(uid).collection("jobs")


def _job_ref(uid: str, job_id: str):
    return _jobs_col(uid).document(job_id)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def list_jobs(uid: str) -> list[dict]:
    """Return all job documents for the user, newest first."""
    docs = (
        _jobs_col(uid)
        .order_by("updated_at", direction="DESCENDING")
        .stream()
    )
    results = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        results.append(item)
    return results


def get_job(uid: str, job_id: str) -> dict | None:
    """Return a single job document or None."""
    doc = _job_ref(uid, job_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["id"] = doc.id
    return data


def create_job(uid: str, data: dict) -> dict:
    """Create a new job document.  Returns the stored data with its id."""
    now = datetime.utcnow().isoformat()
    payload = {
        **data,
        "uid": uid,
        "stage": data.get("stage", "wishlist"),
        "timeline": [],
        "notes": "",
        "created_at": now,
        "updated_at": now,
    }
    _, ref = _jobs_col(uid).add(payload)
    payload["id"] = ref.id

    # Log the initial creation event
    log_activity(uid, ref.id, "created", "Job added to tracker")
    return payload


def update_job(uid: str, job_id: str, data: dict) -> dict | None:
    """Update a job document.  Returns merged data or None."""
    ref = _job_ref(uid, job_id)
    doc = ref.get()
    if not doc.exists:
        return None
    data["updated_at"] = datetime.utcnow().isoformat()
    ref.update(data)
    return {**doc.to_dict(), **data, "id": doc.id}


def delete_job(uid: str, job_id: str) -> bool:
    """Delete a job document.  Returns True if it existed."""
    ref = _job_ref(uid, job_id)
    doc = ref.get()
    if not doc.exists:
        return False
    ref.delete()
    return True


# ---------------------------------------------------------------------------
# Stage management
# ---------------------------------------------------------------------------

def update_stage(uid: str, job_id: str, stage: str) -> dict | None:
    """Update the job stage and record a timeline event.

    Returns the updated job dict or None if the job does not exist.
    """
    ref = _job_ref(uid, job_id)
    doc = ref.get()
    if not doc.exists:
        return None

    now = datetime.utcnow().isoformat()
    current = doc.to_dict()
    old_stage = current.get("stage", "unknown")

    # Append timeline event
    timeline: list = current.get("timeline", [])
    timeline.append({
        "event_type": "stage_change",
        "description": f"Stage changed from '{old_stage}' to '{stage}'",
        "timestamp": now,
    })

    update_data = {
        "stage": stage,
        "timeline": timeline,
        "updated_at": now,
    }
    ref.update(update_data)
    return {**current, **update_data, "id": doc.id}


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------

def get_notes(uid: str, job_id: str) -> str | None:
    """Return the notes string for a job, or None if the job does not exist."""
    job = get_job(uid, job_id)
    if job is None:
        return None
    return job.get("notes", "")


def update_notes(uid: str, job_id: str, notes: str) -> dict | None:
    """Overwrite the notes field.  Returns updated job or None."""
    return update_job(uid, job_id, {"notes": notes})


# ---------------------------------------------------------------------------
# Timeline
# ---------------------------------------------------------------------------

def get_timeline(uid: str, job_id: str) -> list[dict] | None:
    """Return the timeline events for a job, or None if not found."""
    job = get_job(uid, job_id)
    if job is None:
        return None
    return job.get("timeline", [])


def log_activity(uid: str, job_id: str, event_type: str, description: str) -> dict | None:
    """Append a timeline event to the job.

    Returns the updated job dict or None if the job does not exist.
    """
    ref = _job_ref(uid, job_id)
    doc = ref.get()
    if not doc.exists:
        return None

    now = datetime.utcnow().isoformat()
    current = doc.to_dict()
    timeline: list = current.get("timeline", [])
    timeline.append({
        "event_type": event_type,
        "description": description,
        "timestamp": now,
    })

    update_data = {
        "timeline": timeline,
        "updated_at": now,
    }
    ref.update(update_data)
    return {**current, **update_data, "id": doc.id}


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

def get_stats(uid: str) -> dict:
    """Compute aggregate job statistics for the user.

    Returns a dict with:
        - total: int
        - by_stage: dict[str, int]
        - response_rate: float  (fraction of jobs past 'applied' stage)
    """
    docs = _jobs_col(uid).stream()

    total = 0
    by_stage: dict[str, int] = {}
    applied_or_later = 0
    responded = 0

    # Stages considered as having received a response
    response_stages = {"interview", "offer", "rejected", "hired"}

    for doc in docs:
        total += 1
        data = doc.to_dict()
        stage = data.get("stage", "unknown")
        by_stage[stage] = by_stage.get(stage, 0) + 1

        if stage != "wishlist":
            applied_or_later += 1
        if stage in response_stages:
            responded += 1

    response_rate = (responded / applied_or_later) if applied_or_later > 0 else 0.0

    return {
        "total": total,
        "by_stage": by_stage,
        "response_rate": round(response_rate, 4),
    }
