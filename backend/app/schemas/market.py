from pydantic import BaseModel
from typing import List, Optional


class SalaryData(BaseModel):
    min_salary: int
    max_salary: int
    median: int
    p25: int
    p75: int
    user_low: Optional[int] = None
    user_high: Optional[int] = None
    currency: str = "EUR"


class CitySalary(BaseModel):
    city: str
    salary: int


class DemandTrend(BaseModel):
    months: List[str]
    values: List[int]
    yoy_change: float  # year-over-year percentage


class SkillDemand(BaseModel):
    name: str
    demand: int  # percentage
    have: bool = False


class CompetitionData(BaseModel):
    competition_pct: int
    avg_applications: int
    top_pct_interviews: int
    estimated_rank_before: Optional[int] = None
    estimated_rank_after: Optional[int] = None


class CountryComparison(BaseModel):
    name: str
    salary: str
    demand: str
    cost_adjusted: str
    tip: str


class MarketInsight(BaseModel):
    title: str
    description: str
    category: str  # salary, timing, opportunity
