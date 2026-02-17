from pydantic import BaseModel
from typing import List, Optional


class TemplatePreview(BaseModel):
    accent: str
    has_sidebar: bool = False
    has_photo: bool = False
    header_style: str = "standard"


class Template(BaseModel):
    id: str
    name: str
    region: str
    style: str
    layout: str
    features: List[str]
    industry: str = "general"
    uses: int = 0
    ats_compatible: bool = True
    description: str = ""
    colors: List[str] = []
    preview: Optional[TemplatePreview] = None


class TemplateListResponse(BaseModel):
    templates: List[Template]
    total: int
