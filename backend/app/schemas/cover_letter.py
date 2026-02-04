from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class CoverLetterRequest(BaseModel):
    """Request schema for cover letter generation."""
    job_title: str = Field(..., min_length=2, max_length=200)
    company_name: str = Field(..., min_length=2, max_length=200)
    job_description: str = Field(..., min_length=50, max_length=10000)
    tone: Literal["classic", "startup", "corporate"] = "classic"
    additional_context: Optional[str] = Field(None, max_length=2000)


class CoverLetterResponse(BaseModel):
    """Response schema for generated cover letter."""
    id: Optional[str] = None
    user_id: Optional[str] = None
    job_title: str
    company_name: str
    tone: str
    content: str
    word_count: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CoverLetterUpdate(BaseModel):
    """Schema for updating a cover letter."""
    content: str = Field(..., min_length=100, max_length=10000)


class CoverLetterListItem(BaseModel):
    """Schema for cover letter list item."""
    id: str
    job_title: str
    company_name: str
    tone: str
    word_count: int
    created_at: datetime

    class Config:
        from_attributes = True
