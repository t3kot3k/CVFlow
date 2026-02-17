"""
AI-powered mock interview engine using Gemini.

Generates interview questions based on CV content, job title, and
interview type, then evaluates candidate answers with detailed feedback.
"""

from __future__ import annotations

from typing import Any

from app.services.ai import gemini_client


# ---------------------------------------------------------------------------
# Type-specific guidance
# ---------------------------------------------------------------------------

_TYPE_GUIDANCE: dict[str, str] = {
    "behavioral": (
        "Focus on behavioural / situational questions using the STAR method "
        "(Situation, Task, Action, Result). Ask about past experiences, "
        "teamwork, conflict resolution, leadership, and adaptability."
    ),
    "technical": (
        "Focus on technical questions relevant to the candidate's field. "
        "Include problem-solving scenarios, system-design considerations, "
        "and questions about tools, technologies, and methodologies "
        "mentioned in the CV or job description."
    ),
    "case": (
        "Present short business-case or problem-solving scenarios. "
        "Ask the candidate to walk through their approach, structure their "
        "thinking, and propose solutions."
    ),
    "cultural": (
        "Ask questions about work style, values, motivation, career goals, "
        "and company-culture fit. Include questions about collaboration, "
        "remote work, diversity, and professional growth."
    ),
}

_DIFFICULTY_LABEL: dict[str, str] = {
    "easy": "entry-level / junior",
    "medium": "mid-level / intermediate",
    "hard": "senior / advanced",
}


# ---------------------------------------------------------------------------
# generate_questions
# ---------------------------------------------------------------------------


async def generate_questions(
    cv_content: str,
    job_title: str,
    interview_type: str = "behavioral",
    difficulty: int = 50,
    language: str = "en",
    count: int = 10,
) -> list[dict[str, Any]]:
    """Generate a batch of interview questions.

    Parameters
    ----------
    cv_content:
        Text representation of the candidate's CV.
    job_title:
        The target job title.
    interview_type:
        One of ``behavioral``, ``technical``, ``case``, ``cultural``.
    difficulty:
        0-100 scale.  Mapped to easy / medium / hard internally.
    language:
        ISO-639 language code.
    count:
        Number of questions to generate.

    Returns
    -------
    list[dict] – Each dict has keys: ``question``, ``type``, ``tip``.
    """

    if difficulty <= 33:
        diff_label = _DIFFICULTY_LABEL["easy"]
    elif difficulty <= 66:
        diff_label = _DIFFICULTY_LABEL["medium"]
    else:
        diff_label = _DIFFICULTY_LABEL["hard"]

    type_guide = _TYPE_GUIDANCE.get(interview_type, _TYPE_GUIDANCE["behavioral"])

    system_instruction = (
        "You are an expert interview coach and hiring manager. "
        f"{type_guide} "
        f"Target difficulty: {diff_label}. "
        f"Write in the language whose ISO code is '{language}'. "
        f"Generate exactly {count} questions. "
        "Return a JSON array of objects, each with:\n"
        '  "question": the interview question text,\n'
        '  "type": a short category label (e.g. "behavioral", "technical", "situational"),\n'
        '  "tip": a one-sentence tip for answering the question well.\n'
        "Return ONLY the JSON array."
    )

    prompt = (
        f"Job title: {job_title}\n\n"
        f"--- CANDIDATE CV ---\n{cv_content}\n\n"
        f"Generate {count} {interview_type} interview questions for this candidate."
    )

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    if isinstance(result, list):
        return [_normalise_question(q) for q in result if isinstance(q, dict)]
    return []


# ---------------------------------------------------------------------------
# evaluate_answer
# ---------------------------------------------------------------------------


async def evaluate_answer(
    question: str,
    answer: str,
    interview_type: str = "behavioral",
    language: str = "en",
) -> dict[str, Any]:
    """Evaluate a candidate's answer to an interview question.

    Parameters
    ----------
    question:
        The interview question that was asked.
    answer:
        The candidate's response.
    interview_type:
        The type of interview for context-appropriate evaluation.
    language:
        ISO-639 language code.

    Returns
    -------
    dict with keys:
        scores          – dict with relevance, clarity, depth, examples (each 0-100)
        overall_score   – int 0-100
        strengths       – list[str]
        improvements    – list[str]
        model_answer    – str (an ideal sample answer)
    """

    type_guide = _TYPE_GUIDANCE.get(interview_type, _TYPE_GUIDANCE["behavioral"])

    system_instruction = (
        "You are an expert interview coach. "
        f"Evaluate the candidate's answer to a {interview_type} interview question. "
        f"{type_guide} "
        f"Write in the language whose ISO code is '{language}'. "
        "Be constructive and specific in your feedback."
    )

    prompt = f"""Evaluate the following interview answer and return a JSON object with EXACTLY these keys:

1. "scores": an object with integer scores (0-100) for:
   - "relevance": how well the answer addresses the question
   - "clarity": how clear and well-structured the answer is
   - "depth": how thorough and detailed the answer is
   - "examples": how well the candidate uses concrete examples
2. "overall_score": a single integer 0-100 summarising overall quality
3. "strengths": an array of 2-3 specific things the candidate did well
4. "improvements": an array of 2-3 specific, actionable improvements
5. "model_answer": a concise ideal answer (3-5 sentences) for comparison

--- QUESTION ---
{question}

--- CANDIDATE ANSWER ---
{answer}

Return ONLY the JSON object."""

    result = await gemini_client.generate_json(prompt, system_instruction=system_instruction)

    return _normalise_feedback(result)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _normalise_question(q: dict) -> dict[str, str]:
    return {
        "question": str(q.get("question", "")),
        "type": str(q.get("type", "general")),
        "tip": str(q.get("tip", "")),
    }


def _clamp(value: Any, lo: int = 0, hi: int = 100) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return 0


def _normalise_feedback(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        return {
            "scores": {"relevance": 0, "clarity": 0, "depth": 0, "examples": 0},
            "overall_score": 0,
            "strengths": [],
            "improvements": [],
            "model_answer": "",
        }

    raw_scores = data.get("scores", {})
    if not isinstance(raw_scores, dict):
        raw_scores = {}

    scores = {
        "relevance": _clamp(raw_scores.get("relevance", 0)),
        "clarity": _clamp(raw_scores.get("clarity", 0)),
        "depth": _clamp(raw_scores.get("depth", 0)),
        "examples": _clamp(raw_scores.get("examples", 0)),
    }

    strengths = data.get("strengths", [])
    improvements = data.get("improvements", [])

    return {
        "scores": scores,
        "overall_score": _clamp(data.get("overall_score", 0)),
        "strengths": [str(s) for s in strengths] if isinstance(strengths, list) else [],
        "improvements": [str(s) for s in improvements] if isinstance(improvements, list) else [],
        "model_answer": str(data.get("model_answer", "")),
    }
