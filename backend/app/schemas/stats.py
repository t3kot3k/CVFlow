from pydantic import BaseModel
from typing import Optional


class CompletenessStatus(BaseModel):
    """Profile completeness indicators."""
    has_cv: bool = False
    has_photo: bool = False
    has_letter: bool = False
    has_application: bool = False


class UserStats(BaseModel):
    """Dashboard statistics for a user."""
    cv_count: int = 0
    letter_count: int = 0
    photo_count: int = 0
    application_count: int = 0
    latest_cv_score: Optional[int] = None
    completeness: CompletenessStatus = CompletenessStatus()
