from __future__ import annotations
from google.cloud import firestore
from datetime import datetime
from typing import Optional, List
from app.core.firebase import get_firestore_client
from app.schemas.cv import (
    CVAnalysisResult,
    MatchedKeyword,
    MissingKeyword,
    ScoreBreakdown,
    ExperienceAlignment,
    TechnicalSkillsAnalysis,
    SoftSkillsAnalysis,
    AtsFormattingCheck,
    OptimizationSuggestion,
)


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
            "matchScore": analysis.matchScore,
            "scoreBreakdown": analysis.scoreBreakdown.model_dump(),
            "matchedKeywords": [mk.model_dump() for mk in analysis.matchedKeywords],
            "missingKeywords": [mk.model_dump() for mk in analysis.missingKeywords],
            "experienceAlignment": analysis.experienceAlignment.model_dump(),
            "technicalSkillsAnalysis": analysis.technicalSkillsAnalysis.model_dump(),
            "softSkillsAnalysis": analysis.softSkillsAnalysis.model_dump(),
            "atsFormattingCheck": analysis.atsFormattingCheck.model_dump(),
            "optimizationSuggestions": [s.model_dump() for s in analysis.optimizationSuggestions],
            "summary": analysis.summary,
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
        sb = data.get("scoreBreakdown", {})
        ea = data.get("experienceAlignment", {})
        ts = data.get("technicalSkillsAnalysis", {})
        ss = data.get("softSkillsAnalysis", {})
        fc = data.get("atsFormattingCheck", {})

        return CVAnalysisResult(
            id=doc_id,
            user_id=data.get("userId"),
            matchScore=data.get("matchScore", 0),
            scoreBreakdown=ScoreBreakdown(**sb) if sb else ScoreBreakdown(),
            matchedKeywords=[MatchedKeyword(**mk) for mk in data.get("matchedKeywords", [])],
            missingKeywords=[MissingKeyword(**mk) for mk in data.get("missingKeywords", [])],
            experienceAlignment=ExperienceAlignment(**ea) if ea else ExperienceAlignment(),
            technicalSkillsAnalysis=TechnicalSkillsAnalysis(**ts) if ts else TechnicalSkillsAnalysis(),
            softSkillsAnalysis=SoftSkillsAnalysis(**ss) if ss else SoftSkillsAnalysis(),
            atsFormattingCheck=AtsFormattingCheck(**fc) if fc else AtsFormattingCheck(),
            optimizationSuggestions=[OptimizationSuggestion(**s) for s in data.get("optimizationSuggestions", [])],
            summary=data.get("summary", ""),
            created_at=data.get("createdAt"),
        )


# Singleton instance
cv_service = CVService()
