from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from typing import Optional
from .firebase import verify_firebase_token


security = HTTPBearer()


class CurrentUser:
    """Represents the currently authenticated user."""

    def __init__(self, uid: str, email: Optional[str], email_verified: bool):
        self.uid = uid
        self.email = email
        self.email_verified = email_verified


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    """
    Dependency to get the current authenticated user from Firebase token.

    Args:
        credentials: The HTTP authorization credentials containing the Bearer token.

    Returns:
        CurrentUser: The authenticated user information.

    Raises:
        HTTPException: If the token is invalid, expired, or missing.
    """
    token = credentials.credentials

    try:
        decoded_token = verify_firebase_token(token)
        return CurrentUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            email_verified=decoded_token.get("email_verified", False),
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[CurrentUser]:
    """
    Dependency to optionally get the current user. Returns None if no token is provided.
    Useful for endpoints that have different behavior for authenticated/anonymous users.
    """
    if credentials is None:
        return None

    try:
        decoded_token = verify_firebase_token(credentials.credentials)
        return CurrentUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            email_verified=decoded_token.get("email_verified", False),
        )
    except Exception:
        return None
