from pydantic import BaseModel
from typing import List, Optional


class InterviewStartRequest(BaseModel):
    cv_id: str
    job_title: Optional[str] = None
    company: Optional[str] = None
    interview_type: str = "behavioral"  # behavioral, technical, case, cultural
    difficulty: int = 50  # 0-100
    session_length: int = 10  # 5, 10, 15
    language: str = "en"


class InterviewAnswerRequest(BaseModel):
    answer: str


class ChatMessage(BaseModel):
    id: int
    role: str  # system, ai-question, user, ai-feedback, next-prompt
    content: str
    question_number: Optional[int] = None
    question_type: Optional[str] = None
    scores: Optional[dict] = None
    strengths: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    model_answer: Optional[str] = None
    star_tip: Optional[bool] = None


class InterviewSession(BaseModel):
    id: str
    cv_id: str
    job_title: Optional[str] = None
    company: Optional[str] = None
    interview_type: str
    difficulty: int
    total_questions: int
    current_question: int = 0
    status: str = "active"  # active, ended
    messages: List[ChatMessage] = []
    created_at: str


class SessionSummary(BaseModel):
    id: str
    job_title: Optional[str] = None
    company: Optional[str] = None
    interview_type: str
    score: Optional[float] = None
    created_at: str


class SessionReport(BaseModel):
    session_id: str
    overall_score: float
    performance: dict  # radar chart data
    best_answer: Optional[str] = None
    areas_for_improvement: List[str] = []
    total_questions: int
    answered_questions: int
