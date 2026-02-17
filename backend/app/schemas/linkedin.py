from pydantic import BaseModel
from typing import List, Optional


class LinkedInImportRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None


class SectionSuggestion(BaseModel):
    text: str
    boost: str  # e.g. "+12"


class LinkedInSection(BaseModel):
    id: str
    label: str
    score: int
    current: str
    weaknesses: List[str]
    suggestions: List[SectionSuggestion]


class LinkedInAnalysis(BaseModel):
    base_score: int
    sections: List[LinkedInSection]
    missing_skills: List[str]
    quick_wins: List[str]


class GenerateSuggestionsRequest(BaseModel):
    section_id: str
    current_content: str
    target_role: Optional[str] = None
