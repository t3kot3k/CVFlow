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
    max_output_tokens: int = 8192,
) -> Any:
    """Send a prompt to Gemini and parse the response as JSON.

    Uses response_mime_type='application/json' for strict JSON output.
    Falls back to regex extraction if the model still wraps in markdown.
    """
    base_instruction = (
        "You MUST respond with valid JSON only. "
        "Do NOT wrap the JSON in markdown code fences or add any text outside the JSON object."
    )
    if system_instruction:
        full_instruction = f"{system_instruction}\n\n{base_instruction}"
    else:
        full_instruction = base_instruction

    try:
        config = types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=max_output_tokens,
            response_mime_type="application/json",
        )
        if full_instruction:
            config.system_instruction = full_instruction

        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=config,
        )
        raw = response.text.strip()
    except Exception as exc:
        logger.error("Gemini JSON generation failed: %s", exc, exc_info=True)
        raise RuntimeError(f"AI generation failed: {exc}") from exc

    # ── Try direct parse first ────────────────────────────────────────────────
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # ── Strip markdown code fences ────────────────────────────────────────────
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # ── Last resort: extract first JSON object/array from response ────────────
    match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    logger.error(
        "Failed to parse Gemini JSON response.\nRaw (first 500 chars): %s",
        raw[:500],
    )
    raise RuntimeError("AI returned invalid JSON. Please try again.")
