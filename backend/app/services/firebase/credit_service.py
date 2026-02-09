from google.cloud import firestore
from datetime import datetime
from typing import Optional, Tuple
from app.core.firebase import get_firestore_client
from app.core.config import settings
from app.schemas.credit import (
    ActionType,
    ACTION_COSTS,
    PRO_COVERED_ACTIONS,
    CreditTransaction,
    CreditHistoryResponse,
)


class CreditService:
    """Service for managing user credits and action authorization."""

    USERS_COLLECTION = "users"

    def __init__(self):
        self.db = get_firestore_client()

    # --- Balance Management ---

    async def get_balance(self, user_id: str) -> int:
        """Get current credit balance for a user."""
        doc_ref = self.db.collection(self.USERS_COLLECTION).document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return 0
        return doc.to_dict().get("credits", 0)

    async def add_credits(
        self,
        user_id: str,
        amount: int,
        source: str,
        description: str,
        stripe_session_id: Optional[str] = None,
    ) -> int:
        """Add credits to user balance. Returns new balance.
        Uses a Firestore transaction to ensure atomicity."""
        user_ref = self.db.collection(self.USERS_COLLECTION).document(user_id)

        @firestore.transactional
        def _add_in_transaction(transaction, ref):
            snapshot = ref.get(transaction=transaction)
            current = snapshot.to_dict().get("credits", 0) if snapshot.exists else 0
            new_balance = current + amount
            transaction.update(ref, {
                "credits": new_balance,
                "updatedAt": datetime.utcnow(),
            })
            return new_balance

        transaction = self.db.transaction()
        new_balance = _add_in_transaction(transaction, user_ref)

        # Log the transaction
        await self._log_transaction(
            user_id=user_id,
            action=None,
            credits_delta=amount,
            balance_after=new_balance,
            description=description,
            source=source,
            stripe_session_id=stripe_session_id,
        )

        return new_balance

    async def deduct_credits(
        self,
        user_id: str,
        amount: int,
        action: ActionType,
        description: str,
    ) -> Tuple[bool, int]:
        """Deduct credits from user balance. Returns (success, new_balance).
        Uses a Firestore transaction for atomicity. Fails if insufficient."""
        user_ref = self.db.collection(self.USERS_COLLECTION).document(user_id)

        @firestore.transactional
        def _deduct_in_transaction(transaction, ref):
            snapshot = ref.get(transaction=transaction)
            current = snapshot.to_dict().get("credits", 0) if snapshot.exists else 0
            if current < amount:
                return False, current
            new_balance = current - amount
            transaction.update(ref, {
                "credits": new_balance,
                "updatedAt": datetime.utcnow(),
            })
            return True, new_balance

        transaction = self.db.transaction()
        success, new_balance = _deduct_in_transaction(transaction, user_ref)

        if success:
            await self._log_transaction(
                user_id=user_id,
                action=action,
                credits_delta=-amount,
                balance_after=new_balance,
                description=description,
                source="action",
            )

        return success, new_balance

    # --- Action Authorization (the core hybrid logic) ---

    async def authorize_action(
        self, user_id: str, action: ActionType, plan: str
    ) -> dict:
        """
        Determine if a user can perform an action and deduct credits if needed.

        Business rules:
        1. Free actions (cost=0) -> always allowed
        2. Pro-covered action + active premium -> allowed, no credit deduction
        3. Non-pro action (headshots) or free plan -> check credits
        4. Insufficient credits -> blocked
        """
        cost = ACTION_COSTS.get(action, 0)

        # Free actions are always allowed
        if cost == 0:
            balance = await self.get_balance(user_id)
            return {
                "allowed": True,
                "reason": "free_action",
                "credits_required": 0,
                "credits_remaining": balance,
                "covered_by_pro": False,
            }

        is_premium = plan == "premium"
        is_pro_covered = action in PRO_COVERED_ACTIONS

        # Pro subscriber + action is covered by Pro
        if is_premium and is_pro_covered:
            balance = await self.get_balance(user_id)
            # Log the action but no credit deduction
            await self._log_transaction(
                user_id=user_id,
                action=action,
                credits_delta=0,
                balance_after=balance,
                description=f"{action.value} (covered by Pro subscription)",
                source="action",
            )
            return {
                "allowed": True,
                "reason": "pro_subscription",
                "credits_required": 0,
                "credits_remaining": balance,
                "covered_by_pro": True,
            }

        # Credit-based check (non-pro action OR free user)
        balance = await self.get_balance(user_id)
        if balance >= cost:
            success, new_balance = await self.deduct_credits(
                user_id, cost, action,
                f"{action.value} ({cost} credit{'s' if cost > 1 else ''})"
            )
            if success:
                return {
                    "allowed": True,
                    "reason": "credits_deducted",
                    "credits_required": cost,
                    "credits_remaining": new_balance,
                    "covered_by_pro": False,
                }

        # Blocked - insufficient credits
        return {
            "allowed": False,
            "reason": "insufficient_credits",
            "credits_required": cost,
            "credits_remaining": balance,
            "covered_by_pro": False,
        }

    # --- Welcome Credits ---

    async def grant_welcome_credits(self, user_id: str) -> int:
        """Grant welcome credits to a new user. Idempotent via a flag."""
        user_ref = self.db.collection(self.USERS_COLLECTION).document(user_id)
        doc = user_ref.get()

        if doc.exists and doc.to_dict().get("welcomeCreditsGranted"):
            return doc.to_dict().get("credits", 0)

        amount = settings.WELCOME_CREDITS
        if doc.exists:
            current_credits = doc.to_dict().get("credits", 0)
            new_balance = current_credits + amount
            user_ref.update({
                "credits": new_balance,
                "welcomeCreditsGranted": True,
                "updatedAt": datetime.utcnow(),
            })
        else:
            new_balance = amount
            user_ref.set({
                "credits": new_balance,
                "welcomeCreditsGranted": True,
                "updatedAt": datetime.utcnow(),
            }, merge=True)

        await self._log_transaction(
            user_id=user_id,
            action=None,
            credits_delta=amount,
            balance_after=new_balance,
            description=f"Welcome bonus: {amount} credits",
            source="welcome_bonus",
        )

        return new_balance

    # --- Transaction Logging ---

    async def _log_transaction(
        self,
        user_id: str,
        action: Optional[ActionType],
        credits_delta: int,
        balance_after: int,
        description: str,
        source: str,
        stripe_session_id: Optional[str] = None,
    ) -> str:
        """Log a credit transaction to Firestore subcollection."""
        tx_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection("credit_transactions")
            .document()
        )
        tx_data = {
            "action": action.value if action else None,
            "creditsDelta": credits_delta,
            "balanceAfter": balance_after,
            "description": description,
            "source": source,
            "stripeSessionId": stripe_session_id,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        tx_ref.set(tx_data)
        return tx_ref.id

    async def get_transaction_history(
        self, user_id: str, limit: int = 50, offset: int = 0
    ) -> CreditHistoryResponse:
        """Get paginated credit transaction history."""
        base_query = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection("credit_transactions")
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
        )

        # Get total count
        all_docs = list(base_query.stream())
        total = len(all_docs)

        # Get paginated results
        query = base_query.limit(limit).offset(offset)
        docs = query.stream()

        transactions = []
        for doc in docs:
            data = doc.to_dict()
            transactions.append(CreditTransaction(
                id=doc.id,
                action=data.get("action"),
                credits_delta=data.get("creditsDelta", 0),
                balance_after=data.get("balanceAfter", 0),
                description=data.get("description", ""),
                source=data.get("source", "action"),
                stripe_session_id=data.get("stripeSessionId"),
                created_at=data.get("createdAt"),
            ))

        return CreditHistoryResponse(
            transactions=transactions,
            total_count=total,
        )


# Singleton instance
credit_service = CreditService()
