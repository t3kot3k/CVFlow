"""Billing and subscription endpoints: plan, checkout, webhook, history, portal."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import List

from app.core.security import get_current_user
from app.schemas.billing import (
    CurrentPlan,
    CheckoutRequest,
    CheckoutResponse,
    Invoice,
    PortalResponse,
    UsageItem,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Plan feature definitions
# ---------------------------------------------------------------------------

PLAN_FEATURES = {
    "free": {
        "price": 0,
        "features": [
            "1 CV",
            "Basic ATS analysis",
            "3 AI improvements/month",
            "1 cover letter/month",
            "Basic templates",
        ],
        "limits": {
            "cvs": 1,
            "ai_improvements": 3,
            "cover_letters": 1,
            "interview_sessions": 2,
            "ats_analyses": 3,
        },
    },
    "starter": {
        "price": 9.99,
        "features": [
            "5 CVs",
            "Full ATS analysis",
            "25 AI improvements/month",
            "10 cover letters/month",
            "All templates",
            "Interview practice",
            "Job tracker",
        ],
        "limits": {
            "cvs": 5,
            "ai_improvements": 25,
            "cover_letters": 10,
            "interview_sessions": 10,
            "ats_analyses": 20,
        },
    },
    "pro": {
        "price": 19.99,
        "features": [
            "Unlimited CVs",
            "Full ATS analysis",
            "Unlimited AI improvements",
            "Unlimited cover letters",
            "All templates",
            "Interview practice",
            "Job tracker",
            "Market intelligence",
            "LinkedIn optimizer",
            "Priority support",
        ],
        "limits": {
            "cvs": -1,  # unlimited
            "ai_improvements": -1,
            "cover_letters": -1,
            "interview_sessions": -1,
            "ats_analyses": -1,
        },
    },
}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/plan", response_model=CurrentPlan)
async def get_current_plan(user: dict = Depends(get_current_user)):
    """Get the current user's plan, features, and usage."""
    try:
        from app.services.firebase.user_service import get_user

        profile = get_user(user["uid"])
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        plan_name = profile.get("plan", "free")
        plan_info = PLAN_FEATURES.get(plan_name, PLAN_FEATURES["free"])
        limits = plan_info["limits"]

        # Get current usage from Firestore
        try:
            from app.core.firebase import get_db

            db = get_db()
            usage_doc = db.collection("users").document(user["uid"]).collection("usage").document("current").get()
            usage_data = usage_doc.to_dict() if usage_doc.exists else {}
        except Exception:
            usage_data = {}

        # Build usage items
        usage_items = []
        usage_map = {
            "cvs": "CVs created",
            "ai_improvements": "AI improvements",
            "cover_letters": "Cover letters",
            "interview_sessions": "Interview sessions",
            "ats_analyses": "ATS analyses",
        }

        for key, label in usage_map.items():
            limit = limits.get(key, 0)
            used = usage_data.get(key, 0)
            limit_str = "Unlimited" if limit == -1 else str(limit)
            pct = 0 if limit == -1 else (int(used / limit * 100) if limit > 0 else 0)
            remaining = None if limit == -1 else max(0, limit - used)

            usage_items.append(UsageItem(
                label=label,
                used=used,
                limit=limit_str,
                pct=min(pct, 100),
                remaining=remaining,
            ))

        return CurrentPlan(
            plan=plan_name,
            price=plan_info["price"],
            billing_cycle=profile.get("billing_cycle", "monthly"),
            next_billing_date=profile.get("next_billing_date"),
            features=plan_info["features"],
            usage=usage_items,
            usage_reset_date=profile.get("usage_reset_date"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get plan: {exc}",
        )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    body: CheckoutRequest,
    user: dict = Depends(get_current_user),
):
    """Create a Stripe checkout session for plan upgrade."""
    try:
        from app.core.config import settings
        import stripe

        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Map plan to Stripe price IDs
        price_map = {
            ("starter", "monthly"): settings.STRIPE_PRICE_STARTER_MONTHLY,
            ("starter", "yearly"): settings.STRIPE_PRICE_STARTER_YEARLY,
            ("pro", "monthly"): settings.STRIPE_PRICE_PRO_MONTHLY,
            ("pro", "yearly"): settings.STRIPE_PRICE_PRO_YEARLY,
        }

        price_id = price_map.get((body.plan, body.billing_cycle))
        if not price_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid plan/billing combination: {body.plan}/{body.billing_cycle}",
            )

        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{settings.FRONTEND_URL}/settings/billing?success=true",
            cancel_url=f"{settings.FRONTEND_URL}/settings/billing?canceled=true",
            client_reference_id=user["uid"],
            customer_email=user.get("email"),
            metadata={
                "uid": user["uid"],
                "plan": body.plan,
                "billing_cycle": body.billing_cycle,
            },
        )

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {exc}",
        )


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events (no auth, uses Stripe signature verification)."""
    try:
        from app.core.config import settings
        import stripe

        stripe.api_key = settings.STRIPE_SECRET_KEY
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature", "")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature",
            )

        event_type = event["type"]
        data = event["data"]["object"]

        if event_type == "checkout.session.completed":
            uid = data.get("client_reference_id") or data.get("metadata", {}).get("uid")
            plan = data.get("metadata", {}).get("plan", "starter")
            billing_cycle = data.get("metadata", {}).get("billing_cycle", "monthly")

            if uid:
                from app.services.firebase.user_service import update_user

                update_user(uid, {
                    "plan": plan,
                    "billing_cycle": billing_cycle,
                    "stripe_customer_id": data.get("customer"),
                    "stripe_subscription_id": data.get("subscription"),
                })

        elif event_type == "customer.subscription.deleted":
            # Downgrade to free
            customer_id = data.get("customer")
            if customer_id:
                try:
                    from app.core.firebase import get_db

                    db = get_db()
                    users = db.collection("users").where("stripe_customer_id", "==", customer_id).limit(1).stream()
                    for user_doc in users:
                        user_doc.reference.update({"plan": "free"})
                except Exception:
                    pass

        elif event_type == "invoice.paid":
            # Record invoice
            customer_id = data.get("customer")
            if customer_id:
                try:
                    from app.core.firebase import get_db

                    db = get_db()
                    users = db.collection("users").where("stripe_customer_id", "==", customer_id).limit(1).stream()
                    for user_doc in users:
                        user_doc.reference.collection("invoices").add({
                            "stripe_invoice_id": data.get("id"),
                            "amount": data.get("amount_paid", 0) / 100,
                            "currency": data.get("currency", "usd"),
                            "status": "paid",
                            "date": data.get("created"),
                            "pdf_url": data.get("invoice_pdf"),
                        })
                except Exception:
                    pass

        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {exc}",
        )


@router.get("/history", response_model=List[Invoice])
async def get_billing_history(user: dict = Depends(get_current_user)):
    """List billing invoices for the current user."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        docs = (
            db.collection("users")
            .document(user["uid"])
            .collection("invoices")
            .order_by("date", direction="DESCENDING")
            .stream()
        )

        invoices = []
        for doc in docs:
            data = doc.to_dict()
            invoices.append(Invoice(
                id=doc.id,
                date=str(data.get("date", "")),
                amount=data.get("amount", 0),
                currency=data.get("currency", "usd"),
                status=data.get("status", "paid"),
                pdf_url=data.get("pdf_url"),
            ))
        return invoices
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get billing history: {exc}",
        )


@router.post("/portal", response_model=PortalResponse)
async def create_portal_session(user: dict = Depends(get_current_user)):
    """Create a Stripe customer portal session for managing subscriptions."""
    try:
        from app.core.config import settings
        from app.services.firebase.user_service import get_user
        import stripe

        stripe.api_key = settings.STRIPE_SECRET_KEY

        profile = get_user(user["uid"])
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        customer_id = profile.get("stripe_customer_id")
        if not customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscription found. Please subscribe first.",
            )

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.FRONTEND_URL}/settings/billing",
        )

        return PortalResponse(portal_url=session.url)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portal session: {exc}",
        )
