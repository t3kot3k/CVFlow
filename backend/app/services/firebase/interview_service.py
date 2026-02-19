from __future__ import annotations
from datetime import datetime

from app.core.firebase import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _interviews_col(uid: str):
    return get_db().collection("users").document(uid).collection("interviews")


def _interview_ref(uid: str, session_id: str):
    return _interviews_col(uid).document(session_id)


# ---------------------------------------------------------------------------
# Session CRUD
# ---------------------------------------------------------------------------

def create_session(uid: str, data: dict) -> dict:
    """Create a new interview practice session.

    Returns the stored data including the generated session id.
    """
    now = datetime.utcnow().isoformat()
    payload = {
        **data,
        "uid": uid,
        "status": "in_progress",
        "messages": [],
        "score": None,
        "report": None,
        "created_at": now,
        "updated_at": now,
    }
    _, ref = _interviews_col(uid).add(payload)
    payload["id"] = ref.id
    return payload


def get_session(uid: str, session_id: str) -> dict | None:
    """Return a single interview session or None."""
    doc = _interview_ref(uid, session_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["id"] = doc.id
    return data


def update_session(uid: str, session_id: str, data: dict) -> dict | None:
    """Update session fields (e.g. append messages).

    Returns merged data or None if the session does not exist.
    """
    ref = _interview_ref(uid, session_id)
    doc = ref.get()
    if not doc.exists:
        return None
    data["updated_at"] = datetime.utcnow().isoformat()
    ref.update(data)
    return {**doc.to_dict(), **data, "id": doc.id}


def end_session(uid: str, session_id: str, score: float, report: dict) -> dict | None:
    """Mark an interview session as ended with a final score and report.

    Returns the updated session dict or None if not found.
    """
    now = datetime.utcnow().isoformat()
    update_data = {
        "status": "completed",
        "score": score,
        "report": report,
        "ended_at": now,
        "updated_at": now,
    }
    ref = _interview_ref(uid, session_id)
    doc = ref.get()
    if not doc.exists:
        return None
    ref.update(update_data)
    return {**doc.to_dict(), **update_data, "id": doc.id}


def list_sessions(uid: str) -> list[dict]:
    """Return all interview sessions for the user, newest first."""
    docs = (
        _interviews_col(uid)
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )
    results = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        results.append(item)
    return results


def get_report(uid: str, session_id: str) -> dict | None:
    """Return only the report portion of a completed session.

    Returns None if the session does not exist or has no report yet.
    """
    session = get_session(uid, session_id)
    if session is None:
        return None
    report = session.get("report")
    if report is None:
        return None
    return {
        "session_id": session_id,
        "score": session.get("score"),
        "report": report,
        "ended_at": session.get("ended_at"),
    }
