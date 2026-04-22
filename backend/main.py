from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import skill_gap, resume, roadmap, enhanced_resume, analyze_role, admin, auth
from database.db import init_db

app = FastAPI(title="GenAI Career Copilot API - RAG Powered")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✓ Database initialized successfully!")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(enhanced_resume.router, prefix="/api", tags=["Enhanced Resume"])
app.include_router(analyze_role.router, prefix="/api", tags=["RAG Analysis"])
app.include_router(skill_gap.router, prefix="/api", tags=["Skill Gap"])
app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])

@app.get("/")
def read_root():
    return {
        "message": "GenAI Career Copilot API - RAG Powered",
        "version": "2.0",
        "features": ["RAG", "Local LLM", "Vector Search", "ChromaDB"]
    }

@app.get("/health")
def health_check():
    from utils.gemini_llm import get_gemini_llm
    llm = get_gemini_llm()
    llm_status = llm.get_status()
    
    return {
        "status": "healthy",
        "rag_enabled": True,
        "llm_primary": llm_status["primary"],
        "llm_fallback": llm_status["fallback"],
        "llm_status": llm_status["status"],
        "vector_db": "ChromaDB"
    }
