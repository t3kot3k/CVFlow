from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, CurrentUser
from app.services.firebase import user_service, credit_service
from app.services.stripe import stripe_service
from app.schemas.credit import (
    ACTION_COSTS,
    PRO_COVERED_ACTIONS,
    CreditBalance,
    ActionCheckRequest,
    ActionCheckResponse,
    CreditPurchaseRequest,
    CreditPurchaseResponse,
    CreditHistoryResponse,
    CREDIT_PACKS,
)
import stripe

router = APIRouter()


@router.get("/balance", response_model=CreditBalance)
async def get_credit_balance(
    current_user: CurrentUser = Depends(get_current_user),
):
    """Get current credit balance and plan status."""
    user = await user_service.get_user(current_user.uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return CreditBalance(
        balance=user.credits,
        plan=user.plan,
        is_premium=user.plan == "premium",
    )


@router.post("/check-action", response_model=ActionCheckResponse)
async def check_action(
    request: ActionCheckRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Check if an action is allowed WITHOUT performing it.
    Used by frontend to decide whether to show paywall.
    Does NOT deduct credits.
    """
    user = await user_service.get_user(current_user.uid)
    plan = user.plan if user else "free"
    cost = ACTION_COSTS.get(request.action, 0)
    balance = await credit_service.get_balance(current_user.uid)

    is_premium = plan == "premium"
    is_covered = request.action in PRO_COVERED_ACTIONS

    if cost == 0:
        allowed, reason = True, "free_action"
    elif is_premium and is_covered:
        allowed, reason = True, "pro_subscription"
    elif balance >= cost:
        allowed, reason = True, "credits_available"
    else:
        allowed, reason = False, "insufficient_credits"

    return ActionCheckResponse(
        allowed=allowed,
        reason=reason,
        credits_required=cost,
        credits_remaining=balance,
        covered_by_pro=is_covered,
    )


@router.post("/purchase", response_model=CreditPurchaseResponse)
async def purchase_credits(
    request: CreditPurchaseRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Create a Stripe Checkout session to purchase a credit pack."""
    if not current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email is required for checkout",
        )

    pack = CREDIT_PACKS.get(request.pack_id)
    if not pack:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credit pack",
        )

    price_id = stripe_service._get_price_id_for_pack(request.pack_id.value)
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Credit pack price not configured",
        )

    try:
        session = await stripe_service.create_credit_checkout_session(
            user_id=current_user.uid,
            email=current_user.email,
            pack_id=request.pack_id.value,
            price_id=price_id,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )
        return CreditPurchaseResponse(
            checkout_url=session.url,
            session_id=session.id,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create checkout session: {str(e)}",
        )


@router.get("/history", response_model=CreditHistoryResponse)
async def get_credit_history(
    limit: int = 50,
    offset: int = 0,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Get paginated credit transaction history."""
    history = await credit_service.get_transaction_history(
        current_user.uid, limit=limit, offset=offset
    )
    return history
