from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class SubscriptionStatus(BaseModel):
    """Current subscription status."""
    plan: Literal["free", "premium"]
    status: Literal["active", "canceled", "past_due", "unpaid", "trialing"] = "active"
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False


class UsageLimits(BaseModel):
    """Monthly usage limits and current usage."""
    cv_analyses_limit: int
    cv_analyses_used: int
    cover_letters_limit: int
    cover_letters_used: int
    photo_enhancements_limit: int
    photo_enhancements_used: int
    reset_date: datetime


class CheckoutSessionRequest(BaseModel):
    """Request to create a Stripe checkout session."""
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    """Response with Stripe checkout session URL."""
    checkout_url: str
    session_id: str


class PortalSessionResponse(BaseModel):
    """Response with Stripe customer portal URL."""
    portal_url: str
