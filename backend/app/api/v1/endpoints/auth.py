"""Authentication endpoints: signup, login, OAuth, refresh, verify-email."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    OAuthRequest,
    AuthResponse,
    RefreshRequest,
)

router = APIRouter()


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    """Create a new Firebase user + Firestore document and return an AuthResponse."""
    try:
        from app.core.firebase import get_auth, get_db

        # Create Firebase Auth user
        auth = get_auth()
        firebase_user = auth.create_user(
            email=body.email,
            password=body.password,
            display_name=body.full_name,
        )

        # Create Firestore user document
        from app.services.firebase.user_service import create_user

        user_data = create_user(
            uid=firebase_user.uid,
            data={
                "email": body.email,
                "full_name": body.full_name,
                "country": body.country,
                "plan": "free",
            },
        )

        # Generate a custom token for the client
        custom_token = auth.create_custom_token(firebase_user.uid).decode("utf-8")

        return AuthResponse(
            uid=firebase_user.uid,
            email=body.email,
            full_name=body.full_name,
            token=custom_token,
            is_new_user=True,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {exc}",
        )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Verify credentials with Firebase Auth and return a token."""
    try:
        import requests
        from app.core.config import settings

        # Use Firebase REST API to sign in with email/password
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"
        resp = requests.post(url, json={
            "email": body.email,
            "password": body.password,
            "returnSecureToken": True,
        }, timeout=10)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        data = resp.json()

        return AuthResponse(
            uid=data["localId"],
            email=data["email"],
            full_name=data.get("displayName", ""),
            token=data["idToken"],
            is_new_user=False,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {exc}",
        )


@router.post("/google", response_model=AuthResponse)
async def google_oauth(body: OAuthRequest):
    """Verify a Google OAuth id_token and create/get the user."""
    try:
        from app.core.firebase import get_auth

        auth = get_auth()
        decoded = auth.verify_id_token(body.id_token)
        uid = decoded["uid"]

        from app.services.firebase.user_service import get_user, create_user

        user = get_user(uid)
        is_new = False

        if user is None:
            is_new = True
            user = create_user(
                uid=uid,
                data={
                    "email": decoded.get("email", ""),
                    "full_name": decoded.get("name", ""),
                    "country": "",
                    "plan": "free",
                    "auth_provider": "google",
                },
            )

        return AuthResponse(
            uid=uid,
            email=user.get("email", ""),
            full_name=user.get("full_name", ""),
            token=body.id_token,
            is_new_user=is_new,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {exc}",
        )


@router.post("/linkedin", response_model=AuthResponse)
async def linkedin_oauth(body: OAuthRequest):
    """Verify a LinkedIn OAuth id_token and create/get the user."""
    try:
        from app.core.firebase import get_auth

        auth = get_auth()
        decoded = auth.verify_id_token(body.id_token)
        uid = decoded["uid"]

        from app.services.firebase.user_service import get_user, create_user

        user = get_user(uid)
        is_new = False

        if user is None:
            is_new = True
            user = create_user(
                uid=uid,
                data={
                    "email": decoded.get("email", ""),
                    "full_name": decoded.get("name", ""),
                    "country": "",
                    "plan": "free",
                    "auth_provider": "linkedin",
                },
            )

        return AuthResponse(
            uid=uid,
            email=user.get("email", ""),
            full_name=user.get("full_name", ""),
            token=body.id_token,
            is_new_user=is_new,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"LinkedIn authentication failed: {exc}",
        )


@router.post("/refresh")
async def refresh_token(body: RefreshRequest):
    """Refresh a Firebase token using the refresh_token."""
    try:
        import requests
        from app.core.config import settings

        url = f"https://securetoken.googleapis.com/v1/token?key={settings.FIREBASE_API_KEY}"
        resp = requests.post(url, json={
            "grant_type": "refresh_token",
            "refresh_token": body.refresh_token,
        }, timeout=10)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        data = resp.json()
        return {
            "token": data["id_token"],
            "refresh_token": data["refresh_token"],
            "expires_in": data["expires_in"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {exc}",
        )


@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(body: LoginRequest):
    """Send a verification email to the user."""
    try:
        import requests
        from app.core.config import settings

        # First sign in to get the id_token
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"
        resp = requests.post(url, json={
            "email": body.email,
            "password": body.password,
            "returnSecureToken": True,
        }, timeout=10)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid credentials",
            )

        id_token = resp.json()["idToken"]

        # Send verification email
        verify_url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={settings.FIREBASE_API_KEY}"
        verify_resp = requests.post(verify_url, json={
            "requestType": "VERIFY_EMAIL",
            "idToken": id_token,
        }, timeout=10)

        if verify_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email",
            )

        return {"message": "Verification email sent successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification email: {exc}",
        )
