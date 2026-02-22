from pydantic import BaseModel, field_validator
from typing import List, Optional


class ATSAnalyzeRequest(BaseModel):
    cv_id: str
    job_description: str


class DownloadRequest(BaseModel):
    cv_id: str


class FetchJobRequest(BaseModel):
    url: str


class ScoreBreakdown(BaseModel):
    label: str
    score: int
    icon: str = "key"

    @field_validator("score", mode="before")
    @classmethod
    def coerce_score(cls, v):
        return int(round(float(v)))


class DiffChange(BaseModel):
    section: str = "General"
    before: str = ""
    after: str = ""


class Keyword(BaseModel):
    word: str
    present: bool = False
    priority: str = "medium"  # high, medium, low


class ComparisonItem(BaseModel):
    requirement: str = ""
    cv_value: str = ""
    status: str = "missing"  # match | missing | partial

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        v = str(v).lower().strip()
        return v if v in ("match", "missing", "partial") else "missing"


class ATSAnalysisResult(BaseModel):
    overall_score: int
    breakdown: List[ScoreBreakdown] = []
    missing_keywords: List[str] = []
    present_keywords: List[str] = []
    suggestions: List[str] = []
    diff_changes: List[DiffChange] = []
    keyword_match_pct: int = 0
    comparison: List[ComparisonItem] = []

    @field_validator("overall_score", "keyword_match_pct", mode="before")
    @classmethod
    def coerce_int(cls, v):
        return int(round(float(v)))


class ApplyChangesRequest(BaseModel):
    cv_id: str
    accepted_changes: List[int]
    added_keywords: List[str]


class ATSDownloadRequest(BaseModel):
    cv_id: str
    diff_changes: List[DiffChange]      # full list from the analysis result
    accepted_changes: List[int]         # indices of changes accepted by the user
    added_keywords: List[str]           # keywords the user clicked to add


class JobPostingData(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: str
    requirements: List[str] = []
