from pydantic import BaseModel
from typing import List, Optional


class JobCreate(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    stage: str = "saved"  # saved, applied, interview, offer, rejected
    salary: Optional[str] = None
    tags: List[str] = []


class JobUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    job_url: Optional[str] = None
    salary: Optional[str] = None
    tags: Optional[List[str]] = None
    interview_date: Optional[str] = None
    interview_type: Optional[str] = None
    cv_id: Optional[str] = None


class JobStageUpdate(BaseModel):
    stage: str  # saved, applied, interview, offer, rejected


class JobDetail(BaseModel):
    id: str
    company: str
    role: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    stage: str
    salary: Optional[str] = None
    tags: List[str] = []
    interview_date: Optional[str] = None
    interview_type: Optional[str] = None
    cv_id: Optional[str] = None
    ats_match: Optional[int] = None
    days_waiting: Optional[int] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str


class JobStats(BaseModel):
    total: int = 0
    saved: int = 0
    applied: int = 0
    interview: int = 0
    offer: int = 0
    rejected: int = 0
    response_rate: float = 0.0


class ImportJobUrlRequest(BaseModel):
    url: str


class TimelineEvent(BaseModel):
    id: str
    event_type: str  # applied, interview_scheduled, email_sent, cv_tailored, saved
    description: str
    created_at: str


class LogActivityRequest(BaseModel):
    event_type: str
    description: str
