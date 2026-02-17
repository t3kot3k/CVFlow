"""Stripe payment service."""

import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_checkout_session(
    user_uid: str,
    user_email: str,
    plan: str,
    billing_cycle: str = "monthly",
) -> dict:
    """Create a Stripe checkout session for subscription."""
    price_id = (
        settings.STRIPE_PRICE_ID_STARTER
        if plan == "starter"
        else settings.STRIPE_PRICE_ID_PRO
    )

    session = stripe.checkout.Session.create(
        customer_email=user_email,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url="http://localhost:3066/dashboard?checkout=success",
        cancel_url="http://localhost:3066/dashboard?checkout=cancel",
        metadata={"user_uid": user_uid, "plan": plan},
    )

    return {"checkout_url": session.url, "session_id": session.id}


async def create_portal_session(customer_id: str) -> dict:
    """Create a Stripe customer portal session."""
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url="http://localhost:3066/dashboard/settings",
    )
    return {"portal_url": session.url}


async def get_customer_invoices(customer_id: str) -> list:
    """Get customer invoice history."""
    invoices = stripe.Invoice.list(customer=customer_id, limit=20)
    return [
        {
            "id": inv.id,
            "date": inv.created,
            "amount": inv.amount_paid / 100,
            "currency": inv.currency.upper(),
            "status": inv.status,
            "pdf_url": inv.invoice_pdf,
        }
        for inv in invoices.data
    ]


def verify_webhook_signature(payload: bytes, signature: str) -> dict:
    """Verify and parse a Stripe webhook event."""
    event = stripe.Webhook.construct_event(
        payload, signature, settings.STRIPE_WEBHOOK_SECRET
    )
    return event


async def handle_webhook_event(event: dict, db) -> None:
    """Handle a Stripe webhook event."""
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_uid = session["metadata"].get("user_uid")
        plan = session["metadata"].get("plan", "starter")
        customer_id = session.get("customer")

        if user_uid:
            user_ref = db.collection("users").document(user_uid)
            user_ref.update({
                "plan": plan,
                "stripe_customer_id": customer_id,
                "subscription_status": "active",
            })

    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]

        # Find user by customer_id and downgrade
        users = db.collection("users").where("stripe_customer_id", "==", customer_id).limit(1).get()
        for user_doc in users:
            user_doc.reference.update({
                "plan": "free",
                "subscription_status": "canceled",
            })

    elif event_type == "invoice.payment_failed":
        invoice = event["data"]["object"]
        customer_id = invoice["customer"]

        users = db.collection("users").where("stripe_customer_id", "==", customer_id).limit(1).get()
        for user_doc in users:
            user_doc.reference.update({
                "subscription_status": "past_due",
            })
