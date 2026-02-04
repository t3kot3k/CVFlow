from typing import Optional
from .gemini_client import generate_content
from app.schemas.cover_letter import CoverLetterResponse


TONE_PROMPTS = {
    "classic": """Write in a formal, professional tone. Use traditional business language.
Focus on qualifications and experience. Maintain a respectful, conventional approach.""",

    "startup": """Write in a dynamic, enthusiastic tone. Show passion and energy.
Highlight innovation, adaptability, and growth mindset. Be personable but professional.""",

    "corporate": """Write in an executive, polished tone. Emphasize leadership and strategic thinking.
Use sophisticated language. Focus on achievements and impact. Maintain gravitas.""",
}


COVER_LETTER_PROMPT = """You are an expert cover letter writer. Create a compelling, personalized cover letter based on the following information.

## Job Title: {job_title}
## Company: {company_name}

## Job Description:
{job_description}

## Tone Style:
{tone_instructions}

## Additional Context (if provided):
{additional_context}

## Instructions:
1. Write a complete cover letter (3-4 paragraphs)
2. Start with a strong opening that shows enthusiasm for the role
3. Highlight relevant skills and experiences that match the job description
4. Show knowledge of the company and why you want to work there
5. End with a confident call to action
6. Keep the letter between 250-400 words
7. Do NOT include placeholders like [Your Name] - write it as if it's ready to send
8. Do NOT include the date or addresses - just the letter body

Write only the cover letter content, no additional commentary.
"""


async def generate_cover_letter(
    job_title: str,
    company_name: str,
    job_description: str,
    tone: str = "classic",
    additional_context: Optional[str] = None,
) -> CoverLetterResponse:
    """
    Generate a cover letter using Gemini AI.

    Args:
        job_title: The job title being applied for.
        company_name: The company name.
        job_description: The full job description.
        tone: The tone style (classic, startup, corporate).
        additional_context: Optional additional context about the candidate.

    Returns:
        CoverLetterResponse with the generated content.
    """
    tone_instructions = TONE_PROMPTS.get(tone, TONE_PROMPTS["classic"])

    prompt = COVER_LETTER_PROMPT.format(
        job_title=job_title,
        company_name=company_name,
        job_description=job_description,
        tone_instructions=tone_instructions,
        additional_context=additional_context or "No additional context provided.",
    )

    content = await generate_content(prompt, max_tokens=2048)

    # Clean up the response
    content = content.strip()

    # Calculate word count
    word_count = len(content.split())

    return CoverLetterResponse(
        job_title=job_title,
        company_name=company_name,
        tone=tone,
        content=content,
        word_count=word_count,
    )
