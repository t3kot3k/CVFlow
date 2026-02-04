from google.cloud import firestore
from datetime import datetime
from typing import Optional
from app.core.firebase import get_firestore_client
from app.schemas.cv import CVAnalysisResult


class CVService:
    """Service for managing CV data in Firestore."""

    USERS_COLLECTION = "users"
    CV_ANALYSES_SUBCOLLECTION = "cv_analyses"

    def __init__(self):
        self.db = get_firestore_client()

    async def save_analysis(self, user_id: str, analysis: CVAnalysisResult) -> str:
        """Save a CV analysis result to Firestore."""
        user_ref = self.db.collection(self.USERS_COLLECTION).document(user_id)
        analyses_ref = user_ref.collection(self.CV_ANALYSES_SUBCOLLECTION)

        doc_data = {
            "userId": user_id,
            "overallScore": analysis.overall_score,
            "atsCompatibility": analysis.ats_compatibility,
            "keywordMatches": [km.model_dump() for km in analysis.keyword_matches],
            "missingKeywords": analysis.missing_keywords,
            "sections": [s.model_dump() for s in analysis.sections],
            "summary": analysis.summary,
            "improvementTips": analysis.improvement_tips,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }

        doc_ref = analyses_ref.add(doc_data)
        return doc_ref[1].id

    async def get_analysis(self, user_id: str, analysis_id: str) -> Optional[CVAnalysisResult]:
        """Get a specific CV analysis by ID."""
        doc_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.CV_ANALYSES_SUBCOLLECTION)
            .document(analysis_id)
        )
        doc = doc_ref.get()

        if not doc.exists:
            return None

        data = doc.to_dict()
        return self._doc_to_analysis(doc.id, data)

    async def get_user_analyses(
        self, user_id: str, limit: int = 10
    ) -> list[CVAnalysisResult]:
        """Get all CV analyses for a user."""
        analyses_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.CV_ANALYSES_SUBCOLLECTION)
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )

        docs = analyses_ref.stream()
        return [self._doc_to_analysis(doc.id, doc.to_dict()) for doc in docs]

    async def delete_analysis(self, user_id: str, analysis_id: str) -> bool:
        """Delete a CV analysis."""
        doc_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.CV_ANALYSES_SUBCOLLECTION)
            .document(analysis_id)
        )
        doc = doc_ref.get()

        if not doc.exists:
            return False

        doc_ref.delete()
        return True

    def _doc_to_analysis(self, doc_id: str, data: dict) -> CVAnalysisResult:
        """Convert Firestore document to CVAnalysisResult."""
        from app.schemas.cv import KeywordMatch, CVSection

        return CVAnalysisResult(
            id=doc_id,
            user_id=data.get("userId"),
            overall_score=data.get("overallScore", 0),
            ats_compatibility=data.get("atsCompatibility", 0),
            keyword_matches=[
                KeywordMatch(**km) for km in data.get("keywordMatches", [])
            ],
            missing_keywords=data.get("missingKeywords", []),
            sections=[CVSection(**s) for s in data.get("sections", [])],
            summary=data.get("summary", ""),
            improvement_tips=data.get("improvementTips", []),
            created_at=data.get("createdAt"),
        )


# Singleton instance
cv_service = CVService()
