from __future__ import annotations

import asyncio
import logging
from typing import Optional

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Optional[genai.Client] = None

# Timeout for Gemini calls (seconds)
GEMINI_TIMEOUT = 120


def _get_client() -> genai.Client:
    """Get or initialize the Gemini client (new google-genai SDK)."""
    global _client

    if _client is None:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.startswith("your_") or len(api_key) < 10:
            raise RuntimeError(
                "GEMINI_API_KEY is missing or invalid. "
                "Set it in backend/.env"
            )
        _client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialised – model: %s", settings.GEMINI_MODEL)

    return _client


async def generate_content(
    prompt: str,
    max_tokens: int = 4096,
    temperature: float = 0.7,
    system_instruction: Optional[str] = None,
    thinking_budget: Optional[int] = None,
) -> str:
    """
    Generate content using the Gemini API (google-genai SDK).

    Runs the synchronous SDK call in a thread-pool executor
    so it never blocks the async event loop, wrapped with a timeout.

    Args:
        prompt: The prompt to send to Gemini.
        max_tokens: Maximum tokens in the response.
        temperature: Sampling temperature (lower = more deterministic).
        system_instruction: Optional system-level instruction.
        thinking_budget: Thinking token budget for Gemini 2.5+.
            Set to 0 to disable thinking (best for structured JSON).
            None = model default.

    Returns:
        The generated text response.

    Raises:
        TimeoutError: If Gemini takes too long.
        RuntimeError: If the response is empty or blocked.
    """
    client = _get_client()
    model_name = settings.GEMINI_MODEL

    logger.info(
        "Gemini call – model=%s, prompt_len=%d, max_tokens=%d, temp=%.2f, sys=%s, think=%s",
        model_name,
        len(prompt),
        max_tokens,
        temperature,
        bool(system_instruction),
        thinking_budget,
    )

    def _call() -> str:
        config: dict = {
            "max_output_tokens": max_tokens,
            "temperature": temperature,
        }
        if system_instruction:
            config["system_instruction"] = system_instruction

        # Thinking budget for Gemini 2.5+ models
        if thinking_budget is not None:
            config["thinking_config"] = {"thinking_budget": thinking_budget}

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )

        # Safety-block guard
        try:
            text = response.text
        except (ValueError, AttributeError):
            logger.warning("Gemini response blocked by safety filters")
            raise RuntimeError("The AI response was blocked by safety filters.")

        if not text or not text.strip():
            raise RuntimeError("Gemini returned an empty response.")

        logger.info("Gemini response received – %d chars", len(text))
        return text

    try:
        result = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(None, _call),
            timeout=GEMINI_TIMEOUT,
        )
        return result
    except asyncio.TimeoutError:
        logger.error("Gemini call timed out after %ds", GEMINI_TIMEOUT)
        raise TimeoutError(f"AI analysis timed out after {GEMINI_TIMEOUT}s. Please try again.")
    except RuntimeError:
        raise
    except Exception as exc:
        logger.exception("Gemini call failed: %s", exc)
        raise RuntimeError(f"AI service error: {exc}") from exc
