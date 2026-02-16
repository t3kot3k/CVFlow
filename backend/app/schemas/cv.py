from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CVAnalysisRequest(BaseModel):
    """Request schema for CV analysis."""
    job_description: str = Field(..., min_length=50, max_length=10000)


# ── New detailed ATS analysis models ─────────────────────────────────

class MatchedKeyword(BaseModel):
    keyword: str
    context: str = ""


class MissingKeyword(BaseModel):
    keyword: str
    importance: str = "Medium"  # High, Medium, Low
    suggestion: str = ""


class ScoreBreakdown(BaseModel):
    skillsMatch: int = Field(0, ge=0, le=100)
    experienceMatch: int = Field(0, ge=0, le=100)
    educationMatch: int = Field(0, ge=0, le=100)
    keywordsMatch: int = Field(0, ge=0, le=100)
    overallRelevance: int = Field(0, ge=0, le=100)


class ExperienceAlignment(BaseModel):
    strongMatches: List[str] = []
    partialMatches: List[str] = []
    gaps: List[str] = []


class TechnicalSkillsAnalysis(BaseModel):
    alignedSkills: List[str] = []
    missingCriticalSkills: List[str] = []
    recommendedAdditions: List[str] = []


class SoftSkillsAnalysis(BaseModel):
    alignedSoftSkills: List[str] = []
    missingSoftSkills: List[str] = []


class AtsFormattingCheck(BaseModel):
    formatScore: int = Field(0, ge=0, le=100)
    issuesDetected: List[str] = []
    recommendations: List[str] = []


class OptimizationSuggestion(BaseModel):
    priority: str = "Medium"  # High, Medium, Low
    title: str = ""
    description: str = ""
    exampleRewrite: str = ""


class CVAnalysisResult(BaseModel):
    """Complete detailed ATS analysis result."""
    id: Optional[str] = None
    user_id: Optional[str] = None

    matchScore: int = Field(0, ge=0, le=100)
    scoreBreakdown: ScoreBreakdown = ScoreBreakdown()
    matchedKeywords: List[MatchedKeyword] = []
    missingKeywords: List[MissingKeyword] = []
    experienceAlignment: ExperienceAlignment = ExperienceAlignment()
    technicalSkillsAnalysis: TechnicalSkillsAnalysis = TechnicalSkillsAnalysis()
    softSkillsAnalysis: SoftSkillsAnalysis = SoftSkillsAnalysis()
    atsFormattingCheck: AtsFormattingCheck = AtsFormattingCheck()
    optimizationSuggestions: List[OptimizationSuggestion] = []
    summary: str = ""

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CVAnalysisPreview(BaseModel):
    """Partial CV analysis for free / unauthenticated users."""
    matchScore: int = Field(0, ge=0, le=100)
    scoreBreakdown: ScoreBreakdown = ScoreBreakdown()
    matchedKeywords: List[MatchedKeyword] = []  # limited to 3
    summary: str = ""
    upgrade_message: str = "Create an account for the full analysis with all keywords, detailed section feedback, and personalized improvement tips."


class OptimizedCVSection(BaseModel):
    """A section entry in the optimized CV (experience or education)."""
    title: str
    organization: str = ""
    period: str = ""
    bullets: list[str] = []
    details: Optional[str] = None


class OptimizedCV(BaseModel):
    """Complete optimized CV output from AI."""
    contact_name: str = ""
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_location: Optional[str] = None
    contact_linkedin: Optional[str] = None
    summary: str = ""
    experience: list[OptimizedCVSection] = []
    education: list[OptimizedCVSection] = []
    skills: list[str] = []
    certifications: list[str] = []
    estimated_score: int = Field(0, ge=0, le=100)


class CVExportRequest(BaseModel):
    """Request schema for exporting optimized CV to PDF."""
    template: str = Field("classic", pattern="^(minimalist|executive|classic)$")


class CVUploadResponse(BaseModel):
    """Response after uploading a CV."""
    file_id: str
    filename: str
    content_type: str
    size_bytes: int
    upload_url: Optional[str] = None
