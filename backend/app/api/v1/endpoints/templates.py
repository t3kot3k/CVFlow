"""CV template browsing endpoints (no auth required)."""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from app.schemas.template import Template, TemplateListResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory template catalog
# ---------------------------------------------------------------------------

TEMPLATES: List[dict] = [
    {
        "id": "olive",
        "name": "Olive",
        "region": "international",
        "style": "modern",
        "layout": "single",
        "features": ["ats-friendly", "clean"],
        "industry": "general",
        "uses": 12500,
        "ats_compatible": True,
        "description": "A clean, modern single-column template optimized for ATS systems.",
        "colors": ["#556B2F", "#333333", "#FFFFFF"],
    },
    {
        "id": "slate",
        "name": "Slate",
        "region": "international",
        "style": "professional",
        "layout": "single",
        "features": ["ats-friendly", "minimal"],
        "industry": "general",
        "uses": 9800,
        "ats_compatible": True,
        "description": "A professional, minimal template with a slate color accent.",
        "colors": ["#708090", "#333333", "#FFFFFF"],
    },
    {
        "id": "azure",
        "name": "Azure",
        "region": "us",
        "style": "modern",
        "layout": "two-column",
        "features": ["ats-friendly", "sidebar"],
        "industry": "tech",
        "uses": 8200,
        "ats_compatible": True,
        "description": "A modern two-column template with a sidebar, popular in tech.",
        "colors": ["#007FFF", "#333333", "#F5F5F5"],
    },
    {
        "id": "bordeaux",
        "name": "Bordeaux",
        "region": "europe",
        "style": "classic",
        "layout": "single",
        "features": ["ats-friendly", "photo"],
        "industry": "general",
        "uses": 7600,
        "ats_compatible": True,
        "description": "A classic European template with photo support and elegant typography.",
        "colors": ["#722F37", "#333333", "#FFFFFF"],
    },
    {
        "id": "tokyo",
        "name": "Tokyo",
        "region": "international",
        "style": "creative",
        "layout": "two-column",
        "features": ["sidebar", "icons"],
        "industry": "design",
        "uses": 6100,
        "ats_compatible": True,
        "description": "A creative two-column template with icon accents, ideal for designers.",
        "colors": ["#FF6B6B", "#2D3436", "#FFFFFF"],
    },
    {
        "id": "cambridge",
        "name": "Cambridge",
        "region": "uk",
        "style": "professional",
        "layout": "single",
        "features": ["ats-friendly", "traditional"],
        "industry": "finance",
        "uses": 5800,
        "ats_compatible": True,
        "description": "A traditional UK-style CV template, trusted in finance and consulting.",
        "colors": ["#1B4F72", "#333333", "#FFFFFF"],
    },
    {
        "id": "berlin",
        "name": "Berlin",
        "region": "europe",
        "style": "modern",
        "layout": "two-column",
        "features": ["ats-friendly", "photo", "sidebar"],
        "industry": "general",
        "uses": 5200,
        "ats_compatible": True,
        "description": "A modern European template with photo and sidebar sections.",
        "colors": ["#2ECC71", "#333333", "#ECEFF1"],
    },
    {
        "id": "silicon",
        "name": "Silicon",
        "region": "us",
        "style": "minimal",
        "layout": "single",
        "features": ["ats-friendly", "clean", "minimal"],
        "industry": "tech",
        "uses": 4900,
        "ats_compatible": True,
        "description": "Ultra-minimal template inspired by Silicon Valley hiring preferences.",
        "colors": ["#333333", "#666666", "#FFFFFF"],
    },
    {
        "id": "paris",
        "name": "Paris",
        "region": "europe",
        "style": "elegant",
        "layout": "single",
        "features": ["photo", "elegant"],
        "industry": "luxury",
        "uses": 3400,
        "ats_compatible": True,
        "description": "An elegant French-style CV template with refined typography.",
        "colors": ["#C0A062", "#333333", "#FAFAFA"],
    },
    {
        "id": "nova",
        "name": "Nova",
        "region": "international",
        "style": "creative",
        "layout": "two-column",
        "features": ["sidebar", "icons", "colorful"],
        "industry": "marketing",
        "uses": 2800,
        "ats_compatible": False,
        "description": "A bold, colorful template for creative and marketing professionals.",
        "colors": ["#9B59B6", "#E74C3C", "#3498DB"],
    },
]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/", response_model=TemplateListResponse)
async def list_templates(
    region: Optional[str] = Query(None, description="Filter by region: us, uk, europe, international"),
    style: Optional[str] = Query(None, description="Filter by style: modern, classic, creative, minimal, professional, elegant"),
    layout: Optional[str] = Query(None, description="Filter by layout: single, two-column"),
    features: Optional[str] = Query(None, description="Comma-separated features to filter by"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    search: Optional[str] = Query(None, description="Search templates by name or description"),
    sort: Optional[str] = Query("popular", description="Sort: popular, name, newest"),
):
    """List CV templates with optional filters."""
    filtered = TEMPLATES.copy()

    if region:
        filtered = [t for t in filtered if t["region"] == region]

    if style:
        filtered = [t for t in filtered if t["style"] == style]

    if layout:
        filtered = [t for t in filtered if t["layout"] == layout]

    if features:
        feature_list = [f.strip().lower() for f in features.split(",")]
        filtered = [
            t for t in filtered
            if any(f in [feat.lower() for feat in t["features"]] for f in feature_list)
        ]

    if industry:
        filtered = [t for t in filtered if t["industry"] == industry.lower()]

    if search:
        search_lower = search.lower()
        filtered = [
            t for t in filtered
            if search_lower in t["name"].lower() or search_lower in t["description"].lower()
        ]

    # Sort
    if sort == "popular":
        filtered.sort(key=lambda t: t["uses"], reverse=True)
    elif sort == "name":
        filtered.sort(key=lambda t: t["name"])
    # "newest" would sort by created_at, but since these are static, keep order

    templates = [Template(**t) for t in filtered]
    return TemplateListResponse(templates=templates, total=len(templates))


@router.get("/{template_id}", response_model=Template)
async def get_template(template_id: str):
    """Get details for a specific template."""
    for t in TEMPLATES:
        if t["id"] == template_id:
            return Template(**t)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Template '{template_id}' not found",
    )
