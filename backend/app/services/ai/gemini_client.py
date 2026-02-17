"""
Gemini AI client wrapper for CVFlow.

Provides async helper functions to call Google Gemini for both free-text
and structured-JSON generation.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Client initialisation
# ---------------------------------------------------------------------------

client = genai.Client(api_key=settings.GEMINI_API_KEY)


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


async def generate(
    prompt: str,
    system_instruction: str | None = None,
) -> str:
    """Send a prompt to Gemini and return the raw text response."""
    try:
        config = types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=4096,
        )
        if system_instruction:
            config.system_instruction = system_instruction

        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=config,
        )
        return response.text.strip()

    except Exception as exc:
        logger.error("Gemini generation failed: %s", exc, exc_info=True)
        raise RuntimeError(f"AI generation failed: {exc}") from exc


async def generate_json(
    prompt: str,
    system_instruction: str | None = None,
) -> Any:
    """Send a prompt to Gemini and parse the response as JSON.

    The model is instructed to reply with pure JSON.  If the response
    contains a Markdown code-fence we strip it before parsing.
    """
    base_instruction = (
        "You MUST respond with valid JSON only. "
        "Do NOT wrap the JSON in markdown code fences or add any text outside the JSON object."
    )
    if system_instruction:
        full_instruction = f"{system_instruction}\n\n{base_instruction}"
    else:
        full_instruction = base_instruction

    raw = await generate(prompt, system_instruction=full_instruction)

    # Strip optional ```json ... ``` wrapper
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error(
            "Failed to parse Gemini JSON response: %s\nRaw: %s",
            exc,
            raw[:500],
        )
        raise RuntimeError(
            "AI returned invalid JSON. Please try again."
        ) from exc
