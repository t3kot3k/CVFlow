"""Market intelligence endpoints: salary, skills, competition, countries, insights."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional

from app.core.security import get_current_user
from app.schemas.market import (
    SalaryData,
    SkillDemand,
    CompetitionData,
    CountryComparison,
    MarketInsight,
)

router = APIRouter()


@router.get("/salary", response_model=SalaryData)
async def get_salary_data(
    role: str = Query(..., description="Job title / role"),
    country: str = Query(..., description="Country code or name"),
    city: Optional[str] = Query(None, description="City name"),
    experience: Optional[str] = Query(None, description="Experience level: junior, mid, senior"),
    user: dict = Depends(get_current_user),
):
    """Get salary data for a role in a specific location."""
    try:
        from app.services.ai.gemini_client import generate_json

        prompt = (
            "You are a compensation data expert. Provide realistic salary data "
            f"for a {role} in {country}"
            f"{', ' + city if city else ''}"
            f"{' at ' + experience + ' level' if experience else ''}.\n\n"
            "Return a JSON object with:\n"
            "- min_salary: int (annual, local currency)\n"
            "- max_salary: int\n"
            "- median: int\n"
            "- p25: int (25th percentile)\n"
            "- p75: int (75th percentile)\n"
            "- currency: string (3-letter code)\n"
            "Provide realistic market data."
        )

        result = await generate_json(prompt)
        return SalaryData(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get salary data: {exc}",
        )


@router.get("/skills", response_model=List[SkillDemand])
async def get_skills_demand(
    role: str = Query(..., description="Job title / role"),
    country: Optional[str] = Query(None, description="Country code or name"),
    user: dict = Depends(get_current_user),
):
    """Get in-demand skills for a role."""
    try:
        from app.services.ai.gemini_client import generate_json

        # Get user's current skills for matching
        try:
            from app.services.firebase.user_service import get_user

            user_profile = get_user(user["uid"])
        except Exception:
            user_profile = None

        location_str = f" in {country}" if country else ""
        prompt = (
            f"List the top 15 most in-demand skills for a {role}{location_str}.\n\n"
            "Return a JSON array of objects, each with:\n"
            "- name: string (skill name)\n"
            "- demand: int (0-100, percentage of job postings requiring this skill)\n"
            "- have: boolean (set to false for all)\n"
            "Order by demand descending."
        )

        result = await generate_json(prompt)

        skills = []
        for item in result if isinstance(result, list) else []:
            skills.append(SkillDemand(**item))
        return skills
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get skills demand: {exc}",
        )


@router.get("/competition", response_model=CompetitionData)
async def get_competition_data(
    role: str = Query(..., description="Job title / role"),
    country: Optional[str] = Query(None, description="Country code or name"),
    user: dict = Depends(get_current_user),
):
    """Get competition data for a role in a market."""
    try:
        from app.services.ai.gemini_client import generate_json

        location_str = f" in {country}" if country else ""
        prompt = (
            f"Provide job market competition data for a {role}{location_str}.\n\n"
            "Return a JSON object with:\n"
            "- competition_pct: int (0-100, how competitive the market is)\n"
            "- avg_applications: int (average applications per job posting)\n"
            "- top_pct_interviews: int (what percentile typically gets interviews)\n"
            "Provide realistic estimates."
        )

        result = await generate_json(prompt)
        return CompetitionData(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get competition data: {exc}",
        )


@router.get("/countries", response_model=List[CountryComparison])
async def get_country_comparison(
    role: str = Query(..., description="Job title / role"),
    user: dict = Depends(get_current_user),
):
    """Compare job markets for a role across countries."""
    try:
        from app.services.ai.gemini_client import generate_json

        prompt = (
            f"Compare the top 8 countries for a {role} position.\n\n"
            "Return a JSON array of objects, each with:\n"
            "- name: string (country name)\n"
            "- salary: string (e.g. '$80K-$120K')\n"
            "- demand: string (e.g. 'High', 'Medium', 'Low')\n"
            "- cost_adjusted: string (salary adjusted for cost of living, e.g. '$65K-$95K')\n"
            "- tip: string (one-sentence tip about that market)\n"
            "Order by overall attractiveness."
        )

        result = await generate_json(prompt)

        countries = []
        for item in result if isinstance(result, list) else []:
            countries.append(CountryComparison(**item))
        return countries
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get country comparison: {exc}",
        )


@router.get("/insights", response_model=List[MarketInsight])
async def get_personalized_insights(
    user: dict = Depends(get_current_user),
):
    """Get personalized market insights based on the user's profile and activity."""
    try:
        from app.services.ai.gemini_client import generate_json
        from app.services.firebase.user_service import get_user
        import json

        profile = get_user(user["uid"])
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        # Get user's CVs for additional context
        try:
            from app.services.firebase.cv_service import list_cvs

            cvs = list_cvs(user["uid"])
            cv_context = json.dumps([{"title": cv.get("title"), "skills": cv.get("content", {}).get("skills", [])} for cv in cvs[:3]], indent=2)
        except Exception:
            cv_context = "No CVs available"

        prompt = (
            "You are a career advisor. Based on this user profile, generate 5 personalized "
            "market insights.\n\n"
            f"User profile:\n{json.dumps({k: v for k, v in profile.items() if k not in ('uid',)}, indent=2)}\n\n"
            f"User CVs:\n{cv_context}\n\n"
            "Return a JSON array of objects, each with:\n"
            "- title: string (short insight title)\n"
            "- description: string (1-2 sentence explanation)\n"
            "- category: string (one of: salary, timing, opportunity)"
        )

        result = await generate_json(prompt)

        insights = []
        for item in result if isinstance(result, list) else []:
            insights.append(MarketInsight(**item))
        return insights
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get insights: {exc}",
        )
