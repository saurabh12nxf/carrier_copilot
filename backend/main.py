import os
import sys
from contextlib import asynccontextmanager

# Ensure backend directory is in Python module search path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    skill_gap,
    resume,
    roadmap,
    enhanced_resume,
    analyze_role,
    admin,
    auth,
    ai_coach,
    progress,
    project_details,
    roadmap_tracking,
)
from database.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    print("✓ Database initialized successfully!")
    yield


app = FastAPI(
    title="GenAI Career Copilot API - RAG Powered",
    lifespan=lifespan,
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []
    for err in errors:
        loc = err.get("loc", [])
        field = loc[-1] if loc else "input"
        msg = err.get("msg", "Invalid value")
        messages.append(f"{field}: {msg}")
    error_summary = ". ".join(messages)
    return JSONResponse(
        status_code=422,
        content={"detail": error_summary, "errors": errors},
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://carrier-copilot-2-1vd3.onrender.com",  # Production frontend
        "http://localhost:5173",  # Local development
        "http://localhost:5174",  # Alternative local port
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai_coach.router, prefix="/api/coach", tags=["AI Career Coach"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress Tracking"])
app.include_router(roadmap_tracking.router, prefix="/api", tags=["Roadmap Tracking"])
app.include_router(project_details.router, prefix="/api", tags=["Project Builder"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(enhanced_resume.router, prefix="/api", tags=["Enhanced Resume"])
app.include_router(analyze_role.router, prefix="/api", tags=["RAG Analysis"])
app.include_router(skill_gap.router, prefix="/api", tags=["Skill Gap"])
app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])

# Direct routes without /api prefix for fallback compatibility
app.include_router(enhanced_resume.router, tags=["Enhanced Resume (Direct)"])
app.include_router(resume.router, tags=["Resume (Direct)"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication (Direct)"])


@app.get("/")
def read_root():
    return {
        "message": "GenAI Career Copilot API - RAG Powered",
        "version": "2.0",
        "features": ["RAG", "Local LLM", "Vector Search", "ChromaDB"],
    }


@app.get("/health")
def health_check():
    try:
        from utils.multi_llm import get_multi_llm
        llm = get_multi_llm()
        llm_status = llm.get_status()
        providers = llm_status.get("available_providers", ["fallback"])
        status = llm_status.get("status", "operational")
        primary = providers[0] if providers else "fallback"
    except Exception as e:
        primary = "fallback"
        providers = ["fallback"]
        status = f"degraded ({str(e)})"

    return {
        "status": "healthy",
        "rag_enabled": True,
        "llm_primary": primary,
        "llm_providers": providers,
        "llm_status": status,
        "vector_db": "ChromaDB",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
