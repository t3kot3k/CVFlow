from google.cloud import firestore
from datetime import datetime, timedelta
from typing import Optional
from app.core.firebase import get_firestore_client
from app.schemas.subscription import UsageLimits


# Usage limits per plan
PLAN_LIMITS = {
    "free": {
        "cv_analyses": 1,
        "cover_letters": 3,
        "photo_enhancements": 0,
    },
    "premium": {
        "cv_analyses": -1,  # Unlimited
        "cover_letters": -1,  # Unlimited
        "photo_enhancements": 10,
    },
}


class UsageService:
    """Service for tracking user usage limits."""

    COLLECTION = "usage_tracking"

    def __init__(self):
        self.db = get_firestore_client()

    def _get_reset_date(self) -> datetime:
        """Get the next monthly reset date (first of next month)."""
        now = datetime.utcnow()
        if now.month == 12:
            return datetime(now.year + 1, 1, 1)
        return datetime(now.year, now.month + 1, 1)

    def _get_current_period_key(self) -> str:
        """Get the current period key (YYYY-MM)."""
        now = datetime.utcnow()
        return f"{now.year}-{now.month:02d}"

    async def get_usage(self, user_id: str, plan: str = "free") -> UsageLimits:
        """Get current usage for a user."""
        period_key = self._get_current_period_key()
        doc_ref = self.db.collection(self.COLLECTION).document(f"{user_id}_{period_key}")
        doc = doc_ref.get()

        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])

        if not doc.exists:
            return UsageLimits(
                cv_analyses_limit=limits["cv_analyses"],
                cv_analyses_used=0,
                cover_letters_limit=limits["cover_letters"],
                cover_letters_used=0,
                photo_enhancements_limit=limits["photo_enhancements"],
                photo_enhancements_used=0,
                reset_date=self._get_reset_date(),
            )

        data = doc.to_dict()
        return UsageLimits(
            cv_analyses_limit=limits["cv_analyses"],
            cv_analyses_used=data.get("cvAnalysesUsed", 0),
            cover_letters_limit=limits["cover_letters"],
            cover_letters_used=data.get("coverLettersUsed", 0),
            photo_enhancements_limit=limits["photo_enhancements"],
            photo_enhancements_used=data.get("photoEnhancementsUsed", 0),
            reset_date=self._get_reset_date(),
        )

    async def can_use_feature(
        self, user_id: str, feature: str, plan: str = "free"
    ) -> bool:
        """Check if user can use a feature based on their limits."""
        usage = await self.get_usage(user_id, plan)

        if feature == "cv_analysis":
            if usage.cv_analyses_limit == -1:  # Unlimited
                return True
            return usage.cv_analyses_used < usage.cv_analyses_limit
        elif feature == "cover_letter":
            if usage.cover_letters_limit == -1:  # Unlimited
                return True
            return usage.cover_letters_used < usage.cover_letters_limit
        elif feature == "photo_enhancement":
            if usage.photo_enhancements_limit == -1:  # Unlimited
                return True
            return usage.photo_enhancements_used < usage.photo_enhancements_limit

        return False

    async def increment_usage(self, user_id: str, feature: str) -> None:
        """Increment usage count for a feature."""
        period_key = self._get_current_period_key()
        doc_ref = self.db.collection(self.COLLECTION).document(f"{user_id}_{period_key}")

        field_map = {
            "cv_analysis": "cvAnalysesUsed",
            "cover_letter": "coverLettersUsed",
            "photo_enhancement": "photoEnhancementsUsed",
        }

        field = field_map.get(feature)
        if not field:
            return

        doc = doc_ref.get()
        if doc.exists:
            doc_ref.update({field: firestore.Increment(1)})
        else:
            doc_ref.set({
                "userId": user_id,
                "period": period_key,
                field: 1,
                "createdAt": firestore.SERVER_TIMESTAMP,
            })


# Singleton instance
usage_service = UsageService()
