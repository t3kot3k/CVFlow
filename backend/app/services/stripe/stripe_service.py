import stripe
from typing import Optional
from app.core.config import settings
from app.services.firebase import user_service


# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service for managing Stripe subscriptions and credit purchases."""

    async def get_or_create_customer(
        self, user_id: str, email: str
    ) -> stripe.Customer:
        """Get existing or create new Stripe customer for user."""
        user = await user_service.get_user(user_id)

        if user and user.stripe_customer_id:
            try:
                return stripe.Customer.retrieve(user.stripe_customer_id)
            except stripe.error.InvalidRequestError:
                # Customer was deleted, create new one
                pass

        # Create new customer
        customer = stripe.Customer.create(
            email=email,
            metadata={"firebase_uid": user_id},
        )

        # Save customer ID to user profile
        await user_service.update_stripe_customer_id(user_id, customer.id)

        return customer

    async def create_checkout_session(
        self,
        user_id: str,
        email: str,
        success_url: str,
        cancel_url: str,
    ) -> stripe.checkout.Session:
        """Create a Stripe Checkout session for premium subscription."""
        customer = await self.get_or_create_customer(user_id, email)

        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.STRIPE_PRICE_ID_PREMIUM,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"firebase_uid": user_id},
        )

        return session

    async def create_credit_checkout_session(
        self,
        user_id: str,
        email: str,
        pack_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
    ) -> stripe.checkout.Session:
        """Create a Stripe Checkout session for one-time credit pack purchase."""
        customer = await self.get_or_create_customer(user_id, email)

        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "firebase_uid": user_id,
                "type": "credit_purchase",
                "pack_id": pack_id,
            },
        )

        return session

    def _get_price_id_for_pack(self, pack_id: str) -> Optional[str]:
        """Map credit pack ID to Stripe price ID from config."""
        mapping = {
            "pack_5": settings.STRIPE_PRICE_ID_CREDITS_5,
            "pack_15": settings.STRIPE_PRICE_ID_CREDITS_15,
            "pack_40": settings.STRIPE_PRICE_ID_CREDITS_40,
        }
        price_id = mapping.get(pack_id)
        return price_id if price_id else None

    async def create_portal_session(
        self, user_id: str, return_url: str
    ) -> Optional[stripe.billing_portal.Session]:
        """Create a Stripe Customer Portal session for managing subscription."""
        user = await user_service.get_user(user_id)

        if not user or not user.stripe_customer_id:
            return None

        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url,
        )

        return session

    async def handle_webhook_event(self, event: stripe.Event) -> None:
        """Handle Stripe webhook events."""
        event_type = event.type
        data = event.data.object

        if event_type == "checkout.session.completed":
            await self._handle_checkout_completed(data)
        elif event_type == "customer.subscription.updated":
            await self._handle_subscription_updated(data)
        elif event_type == "customer.subscription.deleted":
            await self._handle_subscription_deleted(data)
        elif event_type == "invoice.payment_failed":
            await self._handle_payment_failed(data)

    async def _handle_checkout_completed(
        self, session: stripe.checkout.Session
    ) -> None:
        """Handle successful checkout completion (subscription or credit purchase)."""
        firebase_uid = session.metadata.get("firebase_uid")
        if not firebase_uid:
            return

        purchase_type = session.metadata.get("type", "subscription")

        if purchase_type == "credit_purchase":
            pack_id = session.metadata.get("pack_id")
            await self._handle_credit_purchase(firebase_uid, pack_id, session.id)
        else:
            # Subscription activation
            await user_service.update_plan(firebase_uid, "premium")

    async def _handle_credit_purchase(
        self, user_id: str, pack_id: str, session_id: str
    ) -> None:
        """Credit user's account with purchased credits."""
        from app.schemas.credit import CreditPackId, CREDIT_PACKS
        from app.services.firebase import credit_service

        try:
            pack_enum = CreditPackId(pack_id)
        except ValueError:
            return  # Unknown pack

        pack = CREDIT_PACKS.get(pack_enum)
        if not pack:
            return

        await credit_service.add_credits(
            user_id=user_id,
            amount=pack["credits"],
            source="purchase",
            description=f"Purchased {pack['label']}",
            stripe_session_id=session_id,
        )

    async def _handle_subscription_updated(
        self, subscription: stripe.Subscription
    ) -> None:
        """Handle subscription status changes."""
        customer_id = subscription.customer
        user = await user_service.get_user_by_stripe_customer_id(customer_id)

        if user:
            if subscription.status == "active":
                await user_service.update_plan(user.uid, "premium")
            elif subscription.status in ["canceled", "unpaid", "past_due"]:
                await user_service.update_plan(user.uid, "free")

    async def _handle_subscription_deleted(
        self, subscription: stripe.Subscription
    ) -> None:
        """Handle subscription cancellation."""
        customer_id = subscription.customer
        user = await user_service.get_user_by_stripe_customer_id(customer_id)

        if user:
            await user_service.update_plan(user.uid, "free")

    async def _handle_payment_failed(self, invoice: stripe.Invoice) -> None:
        """Handle failed payment - could send notification email."""
        pass

    def construct_webhook_event(
        self, payload: bytes, signature: str
    ) -> stripe.Event:
        """Construct and verify a webhook event from Stripe."""
        return stripe.Webhook.construct_event(
            payload,
            signature,
            settings.STRIPE_WEBHOOK_SECRET,
        )


# Singleton instance
stripe_service = StripeService()
