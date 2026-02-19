from __future__ import annotations
from datetime import datetime

from app.core.firebase import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _users_ref():
    return get_db().collection("users")


def _user_ref(uid: str):
    return _users_ref().document(uid)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def get_user(uid: str) -> dict | None:
    """Return the user document as a dict, or None if it does not exist."""
    doc = _user_ref(uid).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["uid"] = doc.id
    return data


def create_user(uid: str, data: dict) -> dict:
    """Create a new user document.  Returns the stored data."""
    now = datetime.utcnow().isoformat()
    payload = {
        **data,
        "uid": uid,
        "created_at": now,
        "updated_at": now,
    }
    _user_ref(uid).set(payload)
    return payload


def update_user(uid: str, data: dict) -> dict | None:
    """Update an existing user document. Returns updated data or None."""
    ref = _user_ref(uid)
    doc = ref.get()
    if not doc.exists:
        return None
    data["updated_at"] = datetime.utcnow().isoformat()
    ref.update(data)
    return {**doc.to_dict(), **data}


def delete_user(uid: str) -> bool:
    """Delete a user document and all known subcollections.

    Returns True if the user existed, False otherwise.
    """
    ref = _user_ref(uid)
    doc = ref.get()
    if not doc.exists:
        return False

    # Delete known subcollections
    subcollections = ["preferences", "cvs", "jobs", "interviews", "cover_letters"]
    for sub_name in subcollections:
        _delete_collection(ref.collection(sub_name))

    ref.delete()
    return True


# ---------------------------------------------------------------------------
# Preferences  (subcollection with a single "default" doc)
# ---------------------------------------------------------------------------

def _prefs_ref(uid: str):
    return _user_ref(uid).collection("preferences").document("default")


def get_preferences(uid: str) -> dict | None:
    """Return user preferences or None."""
    doc = _prefs_ref(uid).get()
    if not doc.exists:
        return None
    return doc.to_dict()


def update_preferences(uid: str, data: dict) -> dict:
    """Create or merge user preferences. Returns the stored data."""
    data["updated_at"] = datetime.utcnow().isoformat()
    _prefs_ref(uid).set(data, merge=True)
    return data


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _delete_collection(col_ref, batch_size: int = 100):
    """Recursively delete all documents in a collection."""
    docs = col_ref.limit(batch_size).stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted += 1
    if deleted >= batch_size:
        _delete_collection(col_ref, batch_size)
