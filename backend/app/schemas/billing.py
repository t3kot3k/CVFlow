from pydantic import BaseModel
from typing import List, Optional


class UsageItem(BaseModel):
    label: str
    used: int
    limit: str
    pct: int
    remaining: Optional[int] = None


class CurrentPlan(BaseModel):
    plan: str  # free, starter, pro
    price: float
    billing_cycle: str = "monthly"
    next_billing_date: Optional[str] = None
    features: List[str]
    usage: List[UsageItem]
    usage_reset_date: Optional[str] = None


class CheckoutRequest(BaseModel):
    plan: str  # starter, pro
    billing_cycle: str = "monthly"  # monthly, yearly


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class Invoice(BaseModel):
    id: str
    date: str
    amount: float
    currency: str
    status: str
    pdf_url: Optional[str] = None


class PortalResponse(BaseModel):
    portal_url: str
