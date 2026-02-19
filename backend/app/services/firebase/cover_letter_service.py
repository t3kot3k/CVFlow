from __future__ import annotations
from datetime import datetime

from app.core.firebase import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cls_col(uid: str):
    return get_db().collection("users").document(uid).collection("cover_letters")


def _cl_ref(uid: str, cl_id: str):
    return _cls_col(uid).document(cl_id)


def _versions_col(uid: str, cl_id: str):
    return _cl_ref(uid, cl_id).collection("versions")


# ---------------------------------------------------------------------------
# Cover Letter CRUD
# ---------------------------------------------------------------------------

def create_cover_letter(uid: str, data: dict) -> dict:
    """Create a new cover letter document.

    Returns the stored data including the generated id.
    """
    now = datetime.utcnow().isoformat()
    payload = {
        **data,
        "uid": uid,
        "created_at": now,
        "updated_at": now,
    }
    _, ref = _cls_col(uid).add(payload)
    payload["id"] = ref.id
    return payload


def get_cover_letter(uid: str, cl_id: str) -> dict | None:
    """Return a single cover letter or None."""
    doc = _cl_ref(uid, cl_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["id"] = doc.id
    return data


# ---------------------------------------------------------------------------
# Versioning
# ---------------------------------------------------------------------------

def save_version(uid: str, cl_id: str, data: dict) -> dict | None:
    """Save a new version snapshot in the cover letter's versions subcollection.

    The current content of the cover letter is stored as a version before
    being overwritten.  Returns the version dict or None if the cover letter
    does not exist.
    """
    cl = get_cover_letter(uid, cl_id)
    if cl is None:
        return None

    now = datetime.utcnow().isoformat()
    version_payload = {
        **data,
        "saved_at": now,
    }
    _, version_ref = _versions_col(uid, cl_id).add(version_payload)
    version_payload["id"] = version_ref.id

    # Also update the main cover letter document with the new content if
    # the caller included "content" in data.
    if "content" in data:
        _cl_ref(uid, cl_id).update({
            "content": data["content"],
            "updated_at": now,
        })

    return version_payload


def list_versions(uid: str, cl_id: str) -> list[dict] | None:
    """List all saved versions for a cover letter, newest first.

    Returns None if the cover letter itself does not exist.
    """
    cl_doc = _cl_ref(uid, cl_id).get()
    if not cl_doc.exists:
        return None

    docs = (
        _versions_col(uid, cl_id)
        .order_by("saved_at", direction="DESCENDING")
        .stream()
    )
    results = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        results.append(item)
    return results


def restore_version(uid: str, cl_id: str, version_id: str) -> dict | None:
    """Restore a cover letter to the state captured in a specific version.

    The current state is saved as a new version before restoring, so no work
    is lost.  Returns the updated cover letter dict or None if either the
    cover letter or the version does not exist.
    """
    cl = get_cover_letter(uid, cl_id)
    if cl is None:
        return None

    version_doc = _versions_col(uid, cl_id).document(version_id).get()
    if not version_doc.exists:
        return None

    version_data = version_doc.to_dict()
    now = datetime.utcnow().isoformat()

    # Save current state as a version before overwriting
    current_snapshot = {k: v for k, v in cl.items() if k not in ("id", "uid", "created_at")}
    current_snapshot["restored_from"] = version_id
    save_version(uid, cl_id, current_snapshot)

    # Restore fields from the chosen version (exclude version metadata)
    restore_fields = {
        k: v for k, v in version_data.items()
        if k not in ("id", "saved_at", "restored_from")
    }
    restore_fields["updated_at"] = now

    _cl_ref(uid, cl_id).update(restore_fields)
    return {**cl, **restore_fields, "id": cl_id}
