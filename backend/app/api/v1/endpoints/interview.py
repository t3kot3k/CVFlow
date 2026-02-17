"""Interview practice session endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from app.core.security import get_current_user
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewAnswerRequest,
    InterviewSession,
    ChatMessage,
    SessionSummary,
    SessionReport,
)

router = APIRouter()


@router.post("/start", response_model=InterviewSession, status_code=status.HTTP_201_CREATED)
async def start_interview(
    body: InterviewStartRequest,
    user: dict = Depends(get_current_user),
):
    """Start a new interview practice session."""
    try:
        from app.services.firebase.cv_service import get_cv
        from app.services.ai.gemini_client import generate_json
        from app.core.firebase import get_db
        import json

        # Fetch CV for context
        cv = get_cv(user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        cv_content = json.dumps(cv.get("content", {}), indent=2)

        # Generate first question using AI
        prompt = (
            f"You are an expert interviewer conducting a {body.interview_type} interview "
            f"for a {body.job_title or 'general'} position"
            f"{' at ' + body.company if body.company else ''}. "
            f"Difficulty level: {body.difficulty}/100. Language: {body.language}.\n\n"
            f"Candidate CV:\n{cv_content[:4000]}\n\n"
            "Generate the first interview question. Return a JSON object with:\n"
            "- content: string (the question)\n"
            "- question_type: string (e.g. 'behavioral', 'technical', 'situational')"
        )

        question_data = await generate_json(prompt)
        now = datetime.utcnow().isoformat()

        # Build initial messages
        system_msg = ChatMessage(
            id=0,
            role="system",
            content=f"Starting {body.interview_type} interview practice session.",
        )
        first_question = ChatMessage(
            id=1,
            role="ai-question",
            content=question_data.get("content", "Tell me about yourself."),
            question_number=1,
            question_type=question_data.get("question_type", body.interview_type),
        )

        # Save session to Firestore
        db = get_db()
        session_data = {
            "cv_id": body.cv_id,
            "job_title": body.job_title,
            "company": body.company,
            "interview_type": body.interview_type,
            "difficulty": body.difficulty,
            "total_questions": body.session_length,
            "current_question": 1,
            "status": "active",
            "messages": [system_msg.model_dump(), first_question.model_dump()],
            "created_at": now,
            "uid": user["uid"],
            "language": body.language,
        }

        _, ref = db.collection("users").document(user["uid"]).collection("interviews").add(session_data)

        return InterviewSession(
            id=ref.id,
            cv_id=body.cv_id,
            job_title=body.job_title,
            company=body.company,
            interview_type=body.interview_type,
            difficulty=body.difficulty,
            total_questions=body.session_length,
            current_question=1,
            status="active",
            messages=[system_msg, first_question],
            created_at=now,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start interview: {exc}",
        )


@router.post("/{session_id}/answer", response_model=ChatMessage)
async def submit_answer(
    session_id: str,
    body: InterviewAnswerRequest,
    user: dict = Depends(get_current_user),
):
    """Submit an answer to the current interview question and get AI feedback."""
    try:
        from app.core.firebase import get_db
        from app.services.ai.gemini_client import generate_json
        import json

        db = get_db()
        session_ref = db.collection("users").document(user["uid"]).collection("interviews").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found",
            )

        session = session_doc.to_dict()
        if session.get("status") != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This interview session has ended",
            )

        messages = session.get("messages", [])
        current_q = session.get("current_question", 1)

        # Get the last question for context
        last_question = ""
        for msg in reversed(messages):
            if msg.get("role") == "ai-question":
                last_question = msg.get("content", "")
                break

        # Generate AI feedback
        prompt = (
            f"You are an interview coach. The candidate was asked:\n"
            f'"{last_question}"\n\n'
            f"Their answer was:\n"
            f'"{body.answer}"\n\n'
            f"Interview type: {session.get('interview_type', 'behavioral')}\n"
            f"Difficulty: {session.get('difficulty', 50)}/100\n\n"
            "Evaluate the answer. Return a JSON object with:\n"
            "- content: string (detailed feedback)\n"
            "- scores: object with keys relevance, clarity, depth, confidence (each 0-100)\n"
            "- strengths: list of strings\n"
            "- improvements: list of strings\n"
            "- model_answer: string (an example of an ideal answer)\n"
            "- star_tip: boolean (true if answer could benefit from STAR method)"
        )

        feedback_data = await generate_json(prompt)

        # Build feedback message
        msg_id = len(messages) + 1
        user_msg = ChatMessage(
            id=msg_id,
            role="user",
            content=body.answer,
            question_number=current_q,
        )
        messages.append(user_msg.model_dump())

        feedback_msg = ChatMessage(
            id=msg_id + 1,
            role="ai-feedback",
            content=feedback_data.get("content", "Good answer."),
            question_number=current_q,
            scores=feedback_data.get("scores"),
            strengths=feedback_data.get("strengths", []),
            improvements=feedback_data.get("improvements", []),
            model_answer=feedback_data.get("model_answer"),
            star_tip=feedback_data.get("star_tip", False),
        )
        messages.append(feedback_msg.model_dump())

        # Generate next question if session is not over
        total_q = session.get("total_questions", 10)
        if current_q < total_q:
            next_prompt = (
                f"Generate the next interview question (question {current_q + 1}/{total_q}) "
                f"for a {session.get('interview_type', 'behavioral')} interview. "
                f"Previous questions and answers are in context. "
                "Return a JSON object with: content, question_type"
            )
            next_q_data = await generate_json(next_prompt)
            next_question = ChatMessage(
                id=msg_id + 2,
                role="ai-question",
                content=next_q_data.get("content", "Can you elaborate further?"),
                question_number=current_q + 1,
                question_type=next_q_data.get("question_type", session.get("interview_type")),
            )
            messages.append(next_question.model_dump())

        # Update session
        update_data = {
            "messages": messages,
            "current_question": min(current_q + 1, total_q),
        }
        session_ref.update(update_data)

        return feedback_msg
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process answer: {exc}",
        )


@router.post("/{session_id}/end", response_model=SessionReport)
async def end_interview(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """End an interview session and generate a performance report."""
    try:
        from app.core.firebase import get_db
        from app.services.ai.gemini_client import generate_json
        import json

        db = get_db()
        session_ref = db.collection("users").document(user["uid"]).collection("interviews").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found",
            )

        session = session_doc.to_dict()
        messages = session.get("messages", [])

        # Count answered questions
        answered = sum(1 for m in messages if m.get("role") == "user")
        total = session.get("total_questions", 10)

        # Generate overall report using AI
        prompt = (
            "Based on the following interview session, generate a performance report.\n"
            f"Interview type: {session.get('interview_type')}\n"
            f"Messages:\n{json.dumps(messages[-20:], indent=2)}\n\n"
            "Return a JSON object with:\n"
            "- overall_score: float (0-100)\n"
            "- performance: object with keys communication, relevance, depth, confidence, structure (each 0-100)\n"
            "- best_answer: string (quote the best answer)\n"
            "- areas_for_improvement: list of strings"
        )

        report_data = await generate_json(prompt)

        # Mark session as ended
        session_ref.update({"status": "ended"})

        return SessionReport(
            session_id=session_id,
            overall_score=report_data.get("overall_score", 0),
            performance=report_data.get("performance", {}),
            best_answer=report_data.get("best_answer"),
            areas_for_improvement=report_data.get("areas_for_improvement", []),
            total_questions=total,
            answered_questions=answered,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to end interview: {exc}",
        )


@router.get("/sessions", response_model=List[SessionSummary])
async def list_sessions(user: dict = Depends(get_current_user)):
    """List all interview sessions for the current user."""
    try:
        from app.core.firebase import get_db

        db = get_db()
        docs = (
            db.collection("users")
            .document(user["uid"])
            .collection("interviews")
            .order_by("created_at", direction="DESCENDING")
            .stream()
        )

        sessions = []
        for doc in docs:
            data = doc.to_dict()
            # Calculate average score from feedback messages
            scores = []
            for msg in data.get("messages", []):
                if msg.get("role") == "ai-feedback" and msg.get("scores"):
                    score_vals = msg["scores"].values()
                    if score_vals:
                        scores.append(sum(score_vals) / len(score_vals))

            avg_score = sum(scores) / len(scores) if scores else None

            sessions.append(SessionSummary(
                id=doc.id,
                job_title=data.get("job_title"),
                company=data.get("company"),
                interview_type=data.get("interview_type", "behavioral"),
                score=avg_score,
                created_at=data.get("created_at", ""),
            ))
        return sessions
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list sessions: {exc}",
        )


@router.get("/{session_id}/report", response_model=SessionReport)
async def get_report(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Get the performance report for a completed interview session."""
    try:
        from app.core.firebase import get_db
        from app.services.ai.gemini_client import generate_json
        import json

        db = get_db()
        session_ref = db.collection("users").document(user["uid"]).collection("interviews").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found",
            )

        session = session_doc.to_dict()
        messages = session.get("messages", [])
        answered = sum(1 for m in messages if m.get("role") == "user")
        total = session.get("total_questions", 10)

        # Generate report
        prompt = (
            "Based on the following interview session, generate a performance report.\n"
            f"Interview type: {session.get('interview_type')}\n"
            f"Messages:\n{json.dumps(messages[-20:], indent=2)}\n\n"
            "Return a JSON object with:\n"
            "- overall_score: float (0-100)\n"
            "- performance: object with keys communication, relevance, depth, confidence, structure (each 0-100)\n"
            "- best_answer: string\n"
            "- areas_for_improvement: list of strings"
        )

        report_data = await generate_json(prompt)

        return SessionReport(
            session_id=session_id,
            overall_score=report_data.get("overall_score", 0),
            performance=report_data.get("performance", {}),
            best_answer=report_data.get("best_answer"),
            areas_for_improvement=report_data.get("areas_for_improvement", []),
            total_questions=total,
            answered_questions=answered,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get report: {exc}",
        )
