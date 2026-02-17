from pydantic import BaseModel
from typing import List, Optional


class ATSAnalyzeRequest(BaseModel):
    cv_id: str
    job_description: str


class FetchJobRequest(BaseModel):
    url: str


class ScoreBreakdown(BaseModel):
    label: str
    score: int
    icon: str = "check"


class DiffChange(BaseModel):
    section: str
    before: str
    after: str


class Keyword(BaseModel):
    word: str
    present: bool = False
    priority: str = "medium"  # high, medium, low


class ATSAnalysisResult(BaseModel):
    overall_score: int
    breakdown: List[ScoreBreakdown]
    missing_keywords: List[str]
    present_keywords: List[str]
    suggestions: List[str]
    diff_changes: List[DiffChange]
    keyword_match_pct: int


class ApplyChangesRequest(BaseModel):
    cv_id: str
    accepted_changes: List[int]
    added_keywords: List[str]


class JobPostingData(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: str
    requirements: List[str] = []
