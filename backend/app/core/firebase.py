import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.core.config import settings

_app = None
_db = None


def init_firebase():
    global _app, _db
    if _app is not None:
        return

    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    _app = firebase_admin.initialize_app(cred, {
        "projectId": settings.FIREBASE_PROJECT_ID,
    })
    _db = firestore.client()


def get_db():
    if _db is None:
        init_firebase()
    return _db


def get_auth():
    if _app is None:
        init_firebase()
    return auth
