from datetime import datetime

from app.core.firebase import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cvs_col(uid: str):
    return get_db().collection("users").document(uid).collection("cvs")


def _cv_ref(uid: str, cv_id: str):
    return _cvs_col(uid).document(cv_id)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def list_cvs(uid: str) -> list[dict]:
    """Return every CV document for the given user, ordered by update time."""
    docs = (
        _cvs_col(uid)
        .order_by("updated_at", direction="DESCENDING")
        .stream()
    )
    results = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        results.append(item)
    return results


def get_cv(uid: str, cv_id: str) -> dict | None:
    """Return a single CV document or None."""
    doc = _cv_ref(uid, cv_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["id"] = doc.id
    return data


def create_cv(uid: str, data: dict) -> dict:
    """Create a new CV document.  Returns the data including the generated id."""
    now = datetime.utcnow().isoformat()
    payload = {
        **data,
        "uid": uid,
        "created_at": now,
        "updated_at": now,
    }
    _, ref = _cvs_col(uid).add(payload)
    payload["id"] = ref.id
    return payload


def update_cv(uid: str, cv_id: str, data: dict) -> dict | None:
    """Update a CV document.  Returns merged data or None if not found."""
    ref = _cv_ref(uid, cv_id)
    doc = ref.get()
    if not doc.exists:
        return None
    data["updated_at"] = datetime.utcnow().isoformat()
    ref.update(data)
    merged = {**doc.to_dict(), **data, "id": doc.id}
    return merged


def delete_cv(uid: str, cv_id: str) -> bool:
    """Delete a CV document.  Returns True if it existed."""
    ref = _cv_ref(uid, cv_id)
    doc = ref.get()
    if not doc.exists:
        return False
    ref.delete()
    return True


def duplicate_cv(uid: str, cv_id: str) -> dict | None:
    """Duplicate an existing CV with a new id and fresh timestamps.

    Returns the new CV dict or None if the source does not exist.
    """
    source = get_cv(uid, cv_id)
    if source is None:
        return None

    # Remove identifiers that belong to the original
    copy_data = {k: v for k, v in source.items() if k not in ("id", "created_at", "updated_at")}
    copy_data["duplicated_from"] = cv_id

    return create_cv(uid, copy_data)
