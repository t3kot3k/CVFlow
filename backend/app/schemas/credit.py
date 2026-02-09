from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class ActionType(str, Enum):
    """All billable and free actions in the system."""
    ATS_CV_ANALYSIS = "ats_cv_analysis"
    CV_OPTIMIZATION = "cv_optimization"
    CV_DOWNLOAD = "cv_download"
    CV_REGENERATION = "cv_regeneration"
    COVER_LETTER = "cover_letter"
    AI_HEADSHOT = "ai_headshot"
    SEND_CV_EMAIL = "send_cv_email"
    EMAIL_TRACKING = "email_tracking"


# Credit cost per action; 0 means free
ACTION_COSTS: dict[ActionType, int] = {
    ActionType.ATS_CV_ANALYSIS: 0,
    ActionType.CV_OPTIMIZATION: 1,
    ActionType.CV_DOWNLOAD: 1,
    ActionType.CV_REGENERATION: 1,
    ActionType.COVER_LETTER: 1,
    ActionType.AI_HEADSHOT: 2,
    ActionType.SEND_CV_EMAIL: 1,
    ActionType.EMAIL_TRACKING: 0,
}

# Actions that Pro subscription covers (headshots excluded)
PRO_COVERED_ACTIONS: set[ActionType] = {
    ActionType.CV_OPTIMIZATION,
    ActionType.CV_DOWNLOAD,
    ActionType.CV_REGENERATION,
    ActionType.COVER_LETTER,
    ActionType.SEND_CV_EMAIL,
}


class CreditPackId(str, Enum):
    """Available credit pack sizes."""
    PACK_5 = "pack_5"
    PACK_15 = "pack_15"
    PACK_40 = "pack_40"


CREDIT_PACKS = {
    CreditPackId.PACK_5: {"credits": 5, "price_cents": 499, "label": "5 Credits"},
    CreditPackId.PACK_15: {"credits": 15, "price_cents": 1299, "label": "15 Credits"},
    CreditPackId.PACK_40: {"credits": 40, "price_cents": 2999, "label": "40 Credits"},
}


class CreditBalance(BaseModel):
    """Current credit balance for a user."""
    balance: int
    plan: Literal["free", "premium"]
    is_premium: bool


class ActionCheckRequest(BaseModel):
    """Request to check if an action is allowed."""
    action: ActionType


class ActionCheckResponse(BaseModel):
    """Response indicating whether an action is allowed and why."""
    allowed: bool
    reason: str
    credits_required: int
    credits_remaining: int
    covered_by_pro: bool


class CreditPurchaseRequest(BaseModel):
    """Request to purchase a credit pack."""
    pack_id: CreditPackId
    success_url: str
    cancel_url: str


class CreditPurchaseResponse(BaseModel):
    """Response with Stripe checkout URL for credit purchase."""
    checkout_url: str
    session_id: str


class CreditTransaction(BaseModel):
    """A single credit transaction record."""
    id: Optional[str] = None
    action: Optional[str] = None
    credits_delta: int
    balance_after: int
    description: str
    source: Literal["action", "purchase", "welcome_bonus", "admin_adjustment"]
    stripe_session_id: Optional[str] = None
    created_at: Optional[datetime] = None


class CreditHistoryResponse(BaseModel):
    """Paginated credit transaction history."""
    transactions: List[CreditTransaction]
    total_count: int
