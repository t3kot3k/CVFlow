"""ATS (Applicant Tracking System) analysis endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from app.core.security import get_current_user
from app.schemas.ats import (
    ATSAnalyzeRequest,
    ATSAnalysisResult,
    ApplyChangesRequest,
    ATSDownloadRequest,
    FetchJobRequest,
    JobPostingData,
)

router = APIRouter()


@router.post("/analyze", response_model=ATSAnalysisResult)
async def analyze_cv(
    body: ATSAnalyzeRequest,
    user: dict = Depends(get_current_user),
):
    """Analyze a CV against a job description for ATS compatibility."""
    import asyncio
    import json
    from app.services.firebase.cv_service import get_cv
    from app.services.ai.gemini_client import generate_json

    # ── 1. Fetch the CV ───────────────────────────────────────────────────────
    # get_cv is a synchronous Firestore call — run in a thread to keep the
    # event loop free during the network round-trip.
    try:
        cv = await asyncio.to_thread(get_cv, user["uid"], body.cv_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load CV: {exc}")

    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    # ── 2. Build prompt ───────────────────────────────────────────────────────
    cv_content = json.dumps(cv.get("content", {}), indent=2)

    prompt = (
        "You are an ATS expert. Analyze the CV against the job description.\n"
        "Return a JSON object with EXACTLY these keys (no extras):\n"
        "{\n"
        '  "overall_score": <integer 0-100>,\n'
        '  "keyword_match_pct": <integer 0-100>,\n'
        '  "breakdown": [\n'
        '    {"label": "Keyword Match", "score": <int>, "icon": "key"},\n'
        '    {"label": "Skills Alignment", "score": <int>, "icon": "layers"},\n'
        '    {"label": "Experience Level", "score": <int>, "icon": "ruler"},\n'
        '    {"label": "Formatting", "score": <int>, "icon": "file-check"}\n'
        "  ],\n"
        '  "missing_keywords": [<up to 12 short keyword strings missing from CV>],\n'
        '  "present_keywords": [<up to 12 short keyword strings present in CV>],\n'
        '  "suggestions": [<5 to 8 specific, actionable improvement tip strings>],\n'
        '  "diff_changes": [\n'
        '    {"section": "<section name>", "before": "<original short phrase>", "after": "<improved short phrase>"}\n'
        "  ],\n"
        '  "comparison": [\n'
        '    {"requirement": "<specific job requirement>", "cv_value": "<matching content from CV or \'Not mentioned\'>", "status": "<match|missing|partial>"}\n'
        "  ] (up to 12 key requirements from the job description vs what the CV shows)\n"
        "}\n\n"
        f"CV:\n{cv_content[:5000]}\n\n"
        f"Job Description:\n{body.job_description[:3000]}"
    )

    # ── 3. Call Gemini ────────────────────────────────────────────────────────
    try:
        result = await generate_json(prompt)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {exc}")

    # ── 4. Normalise Gemini output ────────────────────────────────────────────
    # Keywords: Gemini sometimes returns [{word: "Python", ...}] instead of ["Python"]
    for key in ("missing_keywords", "present_keywords"):
        if isinstance(result.get(key), list):
            result[key] = [
                k["word"] if isinstance(k, dict) else str(k)
                for k in result[key]
                if k
            ]

    # ── 5. Parse result ───────────────────────────────────────────────────────
    try:
        analysis = ATSAnalysisResult(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ATS result parsing failed: {exc}")

    # ── 6. Persist ats_score back to the CV document ─────────────────────────
    try:
        from app.services.firebase.cv_service import update_cv
        await asyncio.to_thread(update_cv, user["uid"], body.cv_id, {"ats_score": analysis.overall_score})
    except Exception:
        pass  # Non-blocking — don't fail the response if save fails

    return analysis


@router.post("/apply-changes")
async def apply_changes(
    body: ApplyChangesRequest,
    user: dict = Depends(get_current_user),
):
    """Apply accepted ATS changes to a CV."""
    try:
        import asyncio
        from app.services.firebase.cv_service import get_cv, update_cv

        cv = await asyncio.to_thread(get_cv, user["uid"], body.cv_id)
        if cv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CV not found",
            )

        content = cv.get("content", {})

        # Add missing keywords to skills if they aren't already present
        existing_skills = content.get("skills", [])
        for keyword in body.added_keywords:
            if keyword.lower() not in [s.lower() for s in existing_skills]:
                existing_skills.append(keyword)
        content["skills"] = existing_skills

        updated = await asyncio.to_thread(update_cv, user["uid"], body.cv_id, {"content": content})
        return {
            "message": "Changes applied successfully",
            "cv": updated,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply changes: {exc}",
        )


@router.post("/fetch-job", response_model=JobPostingData)
async def fetch_job(
    body: FetchJobRequest,
    user: dict = Depends(get_current_user),
):
    """Fetch and parse a job posting from a URL."""
    try:
        import asyncio
        import requests
        from bs4 import BeautifulSoup
        from app.services.ai.gemini_client import generate_json

        # Browser-like headers to reduce bot detection
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }

        # requests.get is synchronous — run in thread to keep event loop free
        resp = await asyncio.to_thread(requests.get, body.url, timeout=15, headers=headers)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # ── Remove noise elements ──────────────────────────────────────────────
        for tag in soup(["script", "style", "nav", "header", "footer",
                         "noscript", "iframe", "svg", "img"]):
            tag.decompose()

        # ── LinkedIn-specific selectors (try first) ────────────────────────────
        description_text = ""
        linkedin_selectors = [
            "div.description__text",
            "div.show-more-less-html__markup",
            "section.description",
            "[class*='description']",
        ]
        for selector in linkedin_selectors:
            node = soup.select_one(selector)
            if node:
                description_text = node.get_text(separator="\n", strip=True)
                if len(description_text) > 200:
                    break

        # ── Generic fallback: largest <div> block of text ─────────────────────
        if len(description_text) < 200:
            divs = soup.find_all(["div", "section", "article"])
            best = max(divs, key=lambda d: len(d.get_text(strip=True)), default=None)
            if best:
                description_text = best.get_text(separator="\n", strip=True)

        # ── Fallback: full page text ──────────────────────────────────────────
        if len(description_text) < 200:
            description_text = soup.get_text(separator="\n", strip=True)

        # Trim to a reasonable size for the AI prompt
        page_text = description_text[:12000]

        if len(page_text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Could not extract text from this URL. "
                    "The page may require login (e.g. LinkedIn). "
                    "Please copy and paste the job description manually."
                ),
            )

        # Use AI to extract structured job data from the clean text
        prompt = (
            "Extract job posting data from this text. "
            "Return a JSON object with:\n"
            "- title: string (job title)\n"
            "- company: string\n"
            "- location: string\n"
            "- description: string (full job description, preserve all details)\n"
            "- requirements: list of strings\n\n"
            f"Page text:\n{page_text}"
        )

        result = await generate_json(prompt)
        return JobPostingData(**result)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch job posting: {exc}",
        )


@router.post("/download-optimized")
async def download_optimized(
    body: ATSDownloadRequest,
    user: dict = Depends(get_current_user),
):
    """
    Return the *original* uploaded PDF with accepted ATS changes applied in-place
    (text search-and-replace via PyMuPDF) and added keywords injected near the
    skills section.

    Falls back to a ReportLab-generated PDF if the original is not in Firebase
    Storage (e.g. the CV was created via the manual editor, not PDF upload).
    """
    import asyncio
    import logging
    from app.services.firebase.cv_service import get_cv
    from app.core.config import settings as _settings

    _log = logging.getLogger(__name__)

    # ── 1. Load CV metadata ──────────────────────────────────────────────────
    try:
        cv = await asyncio.to_thread(get_cv, user["uid"], body.cv_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load CV: {exc}")
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    # ── 2. Get original PDF bytes (Firebase Storage → ReportLab fallback) ────
    # NOTE: blob.exists() and blob.download_as_bytes() are synchronous blocking
    # calls — run them in a thread to avoid blocking the asyncio event loop.
    pdf_bytes: bytes | None = None
    if _settings.FIREBASE_STORAGE_BUCKET:
        try:
            from app.core.firebase import get_storage_bucket
            bucket = get_storage_bucket()
            blob = bucket.blob(f"cvs/{user['uid']}/{body.cv_id}/original.pdf")
            blob_exists = await asyncio.to_thread(blob.exists)
            if blob_exists:
                pdf_bytes = await asyncio.to_thread(blob.download_as_bytes)
        except Exception as exc:
            _log.warning("Could not fetch original PDF from Storage: %s", exc)

    if pdf_bytes is None:
        # No original stored — generate with ReportLab
        from app.services.pdf.generator import generate_cv_pdf
        try:
            pdf_bytes = await generate_cv_pdf(cv)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    # ── 3. Build list of accepted DiffChange dicts ───────────────────────────
    accepted_diffs = [
        body.diff_changes[i].model_dump()
        for i in body.accepted_changes
        if 0 <= i < len(body.diff_changes)
    ]

    # ── 4. Apply in-place modifications with PyMuPDF ─────────────────────────
    # Run in a thread: apply_ats_to_pdf is CPU-bound (synchronous PyMuPDF ops)
    # that would block the event loop if called directly.
    if accepted_diffs or body.added_keywords:
        try:
            from app.services.pdf.ats_modifier import apply_ats_to_pdf
            pdf_bytes = await asyncio.to_thread(
                apply_ats_to_pdf, pdf_bytes, accepted_diffs, list(body.added_keywords)
            )
        except Exception as exc:
            _log.warning(
                "PyMuPDF modification failed, serving unmodified PDF: %s", exc
            )
            # Non-fatal: serve the original (or ReportLab) PDF unchanged

    # ── 5. Return ────────────────────────────────────────────────────────────
    title = (cv.get("title") or "cv").replace('"', "").replace("'", "")
    # HTTP headers must be latin-1; replace common unicode dashes then drop the rest
    title = title.replace("\u2014", "-").replace("\u2013", "-")
    title = title.encode("latin-1", "ignore").decode("latin-1").strip() or "cv"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="optimized_{title}.pdf"',
        },
    )


@router.get("/download-tailored")
async def download_tailored(
    cv_id: str,
    user: dict = Depends(get_current_user),
):
    """Generate and download a tailored PDF CV optimized for the job description."""
    import asyncio
    from app.services.firebase.cv_service import get_cv
    from app.services.pdf.generator import generate_cv_pdf

    try:
        cv = await asyncio.to_thread(get_cv, user["uid"], cv_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load CV: {exc}")

    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    try:
        pdf_bytes = await generate_cv_pdf(cv)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    title = cv.get("title", "cv") or "cv"
    title = title.replace('"', '').replace("'", "")
    title = title.replace("\u2014", "-").replace("\u2013", "-")
    title = title.encode("latin-1", "ignore").decode("latin-1").strip() or "cv"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="tailored_{title}.pdf"',
        },
    )
