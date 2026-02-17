from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserProfile(BaseModel):
    uid: str
    email: str
    full_name: str
    country: str
    city: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    plan: str = "free"
    plan_expires: Optional[str] = None
    created_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None


class UserPreferences(BaseModel):
    auto_save: bool = True
    ats_tips: bool = True
    ai_suggestions: bool = True
    language: str = "en"
    cv_language: str = "en"
    date_format: str = "DD/MM/YYYY"
    currency: str = "USD"


class UserPreferencesUpdate(BaseModel):
    auto_save: Optional[bool] = None
    ats_tips: Optional[bool] = None
    ai_suggestions: Optional[bool] = None
    language: Optional[str] = None
    cv_language: Optional[str] = None
    date_format: Optional[str] = None
    currency: Optional[str] = None


class EmailPreferences(BaseModel):
    job_alerts: bool = True
    weekly_summary: bool = True
    tips_and_guides: bool = True
    product_updates: bool = True


class ReminderPreferences(BaseModel):
    follow_up_reminders: bool = True
    interview_reminders: bool = True
    application_deadlines: bool = True
