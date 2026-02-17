from pydantic import BaseModel
from typing import List, Optional


class CoverLetterGenerateRequest(BaseModel):
    cv_id: str
    job_description: str
    tone: str = "professional"  # professional, enthusiastic, concise, creative
    format: str = "us"  # us, french, international
    language: str = "en"
    custom_instructions: Optional[str] = None


class CoverLetterRewriteRequest(BaseModel):
    paragraph_index: int
    current_text: str
    tone: str = "professional"
    instructions: Optional[str] = None


class CoverLetterVersion(BaseModel):
    id: str
    tone: str
    created_at: str


class CoverLetterContent(BaseModel):
    id: Optional[str] = None
    cv_id: str
    paragraphs: List[str]
    tone: str
    format: str
    language: str
    word_count: int
    created_at: Optional[str] = None


class CoverLetterDownloadRequest(BaseModel):
    paragraphs: List[str]
    format: str = "pdf"  # pdf, docx
    tone: str = "professional"
    letter_format: str = "us"
