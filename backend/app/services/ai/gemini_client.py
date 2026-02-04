import google.generativeai as genai
from typing import Optional
from app.core.config import settings


_model: Optional[genai.GenerativeModel] = None


def get_gemini_model() -> genai.GenerativeModel:
    """Get or initialize the Gemini model."""
    global _model

    if _model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel(settings.GEMINI_MODEL)

    return _model


async def generate_content(prompt: str, max_tokens: int = 4096) -> str:
    """
    Generate content using Gemini.

    Args:
        prompt: The prompt to send to Gemini.
        max_tokens: Maximum tokens in the response.

    Returns:
        The generated text response.
    """
    model = get_gemini_model()

    generation_config = genai.GenerationConfig(
        max_output_tokens=max_tokens,
        temperature=0.7,
    )

    response = model.generate_content(
        prompt,
        generation_config=generation_config,
    )

    return response.text
