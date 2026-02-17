from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    onboarding,
    cv,
    cv_ai,
    ats,
    cover_letter,
    interview,
    jobs,
    linkedin,
    market,
    templates,
    billing,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["Onboarding"])
api_router.include_router(cv.router, prefix="/cv", tags=["CV Management"])
api_router.include_router(cv_ai.router, prefix="/cv/ai", tags=["CV AI"])
api_router.include_router(ats.router, prefix="/ats", tags=["ATS Analysis"])
api_router.include_router(cover_letter.router, prefix="/cover-letter", tags=["Cover Letter"])
api_router.include_router(interview.router, prefix="/interview", tags=["Interview"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs Tracker"])
api_router.include_router(linkedin.router, prefix="/linkedin", tags=["LinkedIn"])
api_router.include_router(market.router, prefix="/market", tags=["Market Intelligence"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(billing.router, prefix="/billing", tags=["Billing"])
