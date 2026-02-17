"""User profile and preferences endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.schemas.user import (
    UserProfile,
    UserProfileUpdate,
    UserPreferences,
    UserPreferencesUpdate,
    EmailPreferences,
    ReminderPreferences,
)

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    try:
        from app.services.firebase.user_service import get_user

        profile = get_user(user["uid"])
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
        return profile
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {exc}",
        )


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    body: UserProfileUpdate,
    user: dict = Depends(get_current_user),
):
    """Update the current user's profile."""
    try:
        from app.services.firebase.user_service import update_user

        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        updated = update_user(user["uid"], update_data)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {exc}",
        )


@router.get("/preferences", response_model=UserPreferences)
async def get_preferences(user: dict = Depends(get_current_user)):
    """Get the current user's preferences."""
    try:
        from app.services.firebase.user_service import get_preferences

        prefs = get_preferences(user["uid"])
        if prefs is None:
            # Return defaults
            return UserPreferences()
        return prefs
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get preferences: {exc}",
        )


@router.put("/preferences", response_model=UserPreferences)
async def update_preferences(
    body: UserPreferencesUpdate,
    user: dict = Depends(get_current_user),
):
    """Update the current user's preferences."""
    try:
        from app.services.firebase.user_service import update_preferences

        update_data = body.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        updated = update_preferences(user["uid"], update_data)
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {exc}",
        )


@router.put("/email-preferences", response_model=EmailPreferences)
async def update_email_preferences(
    body: EmailPreferences,
    user: dict = Depends(get_current_user),
):
    """Update the current user's email notification preferences."""
    try:
        from app.services.firebase.user_service import update_preferences

        data = {"email_preferences": body.model_dump()}
        update_preferences(user["uid"], data)
        return body
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update email preferences: {exc}",
        )


@router.put("/reminders", response_model=ReminderPreferences)
async def update_reminders(
    body: ReminderPreferences,
    user: dict = Depends(get_current_user),
):
    """Update the current user's reminder preferences."""
    try:
        from app.services.firebase.user_service import update_preferences

        data = {"reminder_preferences": body.model_dump()}
        update_preferences(user["uid"], data)
        return body
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update reminder preferences: {exc}",
        )


@router.post("/export-data", status_code=status.HTTP_200_OK)
async def export_data(user: dict = Depends(get_current_user)):
    """Export all user data as a JSON object."""
    try:
        from app.services.firebase.user_service import get_user, get_preferences
        from app.services.firebase.cv_service import list_cvs

        profile = get_user(user["uid"])
        prefs = get_preferences(user["uid"])
        cvs = list_cvs(user["uid"])

        return {
            "profile": profile,
            "preferences": prefs,
            "cvs": cvs,
            "exported_at": __import__("datetime").datetime.utcnow().isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {exc}",
        )


@router.delete("/account", status_code=status.HTTP_200_OK)
async def delete_account(user: dict = Depends(get_current_user)):
    """Delete the user's account and all associated data."""
    try:
        from app.services.firebase.user_service import delete_user
        from app.core.firebase import get_auth

        # Delete Firestore data
        deleted = delete_user(user["uid"])
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Delete Firebase Auth user
        try:
            auth = get_auth()
            auth.delete_user(user["uid"])
        except Exception:
            pass  # Best-effort deletion of auth record

        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {exc}",
        )
