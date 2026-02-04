import firebase_admin
from firebase_admin import credentials, auth, firestore
from typing import Optional
from .config import settings


_firebase_app: Optional[firebase_admin.App] = None


def init_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK."""
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    if settings.FIREBASE_SERVICE_ACCOUNT_PATH:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    else:
        # Use default credentials (for Google Cloud environments)
        cred = credentials.ApplicationDefault()

    _firebase_app = firebase_admin.initialize_app(cred, {
        "projectId": settings.FIREBASE_PROJECT_ID,
    })

    return _firebase_app


def get_firestore_client() -> firestore.Client:
    """Get Firestore client instance."""
    if _firebase_app is None:
        init_firebase()
    return firestore.client()


def verify_firebase_token(token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.

    Args:
        token: The Firebase ID token to verify.

    Returns:
        dict: The decoded token claims containing uid, email, etc.

    Raises:
        firebase_admin.auth.InvalidIdTokenError: If the token is invalid.
        firebase_admin.auth.ExpiredIdTokenError: If the token has expired.
    """
    if _firebase_app is None:
        init_firebase()
    return auth.verify_id_token(token)


def get_user_by_uid(uid: str) -> auth.UserRecord:
    """
    Get a Firebase user record by UID.

    Args:
        uid: The user's Firebase UID.

    Returns:
        auth.UserRecord: The user record.
    """
    if _firebase_app is None:
        init_firebase()
    return auth.get_user(uid)


def delete_user(uid: str) -> None:
    """
    Delete a Firebase user by UID.

    Args:
        uid: The user's Firebase UID.
    """
    if _firebase_app is None:
        init_firebase()
    auth.delete_user(uid)
