from pydantic import BaseModel
from typing import List, Optional


class OnboardingSaveRequest(BaseModel):
    situation: str  # student, active, transition, exploring
    country: str
    industries: List[str]  # max 3


class OnboardingStatus(BaseModel):
    completed: bool
    situation: Optional[str] = None
    country: Optional[str] = None
    industries: Optional[List[str]] = None
