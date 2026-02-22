import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
from app.core.config import settings

_db = None


def init_firebase():
    global _db

    # Reuse existing default app if already initialized (survives uvicorn hot-reload)
    try:
        app = firebase_admin.get_app()
    except ValueError:
        # No app initialized yet — create it
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        init_opts: dict = {"projectId": settings.FIREBASE_PROJECT_ID}
        if settings.FIREBASE_STORAGE_BUCKET:
            init_opts["storageBucket"] = settings.FIREBASE_STORAGE_BUCKET
        app = firebase_admin.initialize_app(cred, init_opts)

    _db = firestore.client(app)


def get_db():
    global _db
    if _db is None:
        init_firebase()
    return _db


def get_auth():
    try:
        firebase_admin.get_app()
    except ValueError:
        init_firebase()
    return auth


def get_storage_bucket():
    """Return the Firebase Storage bucket. Raises if FIREBASE_STORAGE_BUCKET is not configured."""
    try:
        firebase_admin.get_app()
    except ValueError:
        init_firebase()
    return storage.bucket()
