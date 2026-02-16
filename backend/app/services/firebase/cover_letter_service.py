from __future__ import annotations
from google.cloud import firestore
from datetime import datetime
from typing import Optional, List
from app.core.firebase import get_firestore_client
from app.schemas.cover_letter import (
    CoverLetterResponse,
    CoverLetterListItem,
)


class CoverLetterService:
    """Service for managing cover letters in Firestore."""

    USERS_COLLECTION = "users"
    COVER_LETTERS_SUBCOLLECTION = "cover_letters"

    def __init__(self):
        self.db = get_firestore_client()

    async def save_cover_letter(
        self, user_id: str, cover_letter: CoverLetterResponse
    ) -> str:
        """Save a cover letter to Firestore."""
        user_ref = self.db.collection(self.USERS_COLLECTION).document(user_id)
        letters_ref = user_ref.collection(self.COVER_LETTERS_SUBCOLLECTION)

        doc_data = {
            "userId": user_id,
            "jobTitle": cover_letter.job_title,
            "companyName": cover_letter.company_name,
            "tone": cover_letter.tone,
            "content": cover_letter.content,
            "wordCount": cover_letter.word_count,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }

        doc_ref = letters_ref.add(doc_data)
        return doc_ref[1].id

    async def get_cover_letter(
        self, user_id: str, letter_id: str
    ) -> Optional[CoverLetterResponse]:
        """Get a specific cover letter by ID."""
        doc_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.COVER_LETTERS_SUBCOLLECTION)
            .document(letter_id)
        )
        doc = doc_ref.get()

        if not doc.exists:
            return None

        data = doc.to_dict()
        return CoverLetterResponse(
            id=doc.id,
            user_id=data.get("userId"),
            job_title=data.get("jobTitle"),
            company_name=data.get("companyName"),
            tone=data.get("tone"),
            content=data.get("content"),
            word_count=data.get("wordCount"),
            created_at=data.get("createdAt"),
        )

    async def get_user_cover_letters(
        self, user_id: str, limit: int = 20
    ) -> list[CoverLetterListItem]:
        """Get all cover letters for a user."""
        letters_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.COVER_LETTERS_SUBCOLLECTION)
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )

        docs = letters_ref.stream()
        return [
            CoverLetterListItem(
                id=doc.id,
                job_title=doc.to_dict().get("jobTitle"),
                company_name=doc.to_dict().get("companyName"),
                tone=doc.to_dict().get("tone"),
                word_count=doc.to_dict().get("wordCount"),
                created_at=doc.to_dict().get("createdAt"),
            )
            for doc in docs
        ]

    async def update_cover_letter(
        self, user_id: str, letter_id: str, content: str
    ) -> Optional[CoverLetterResponse]:
        """Update a cover letter's content."""
        doc_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.COVER_LETTERS_SUBCOLLECTION)
            .document(letter_id)
        )
        doc = doc_ref.get()

        if not doc.exists:
            return None

        word_count = len(content.split())
        doc_ref.update({
            "content": content,
            "wordCount": word_count,
            "updatedAt": datetime.utcnow(),
        })

        return await self.get_cover_letter(user_id, letter_id)

    async def delete_cover_letter(self, user_id: str, letter_id: str) -> bool:
        """Delete a cover letter."""
        doc_ref = (
            self.db.collection(self.USERS_COLLECTION)
            .document(user_id)
            .collection(self.COVER_LETTERS_SUBCOLLECTION)
            .document(letter_id)
        )
        doc = doc_ref.get()

        if not doc.exists:
            return False

        doc_ref.delete()
        return True


# Singleton instance
cover_letter_service = CoverLetterService()
