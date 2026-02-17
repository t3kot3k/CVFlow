from pydantic import BaseModel
from typing import Optional, List


class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None


class Experience(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current: bool = False
    bullets: List[str] = []


class Education(BaseModel):
    school: str
    degree: str
    field: Optional[str] = None
    graduation_date: Optional[str] = None
    gpa: Optional[str] = None


class CVContent(BaseModel):
    contact_info: Optional[ContactInfo] = None
    summary: Optional[str] = None
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    certifications: List[str] = []
    languages: List[str] = []
    projects: List[dict] = []
    publications: List[dict] = []
    volunteer: List[dict] = []
    custom_sections: List[dict] = []


class CVCreate(BaseModel):
    title: str = "Untitled CV"
    template_id: str = "olive"


class CVUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[str] = None
    content: Optional[CVContent] = None


class CVSectionUpdate(BaseModel):
    section: str
    data: dict


class CVSummary(BaseModel):
    id: str
    title: str
    template_id: str
    ats_score: Optional[int] = None
    status: str = "draft"
    created_at: str
    updated_at: str


class CVDetail(BaseModel):
    id: str
    title: str
    template_id: str
    content: CVContent
    ats_score: Optional[int] = None
    status: str = "draft"
    created_at: str
    updated_at: str
