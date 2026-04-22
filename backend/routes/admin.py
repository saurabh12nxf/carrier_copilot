"""
Admin routes for system initialization and management
"""
from fastapi import APIRouter, HTTPException
from services.data_ingestion_service import get_data_ingestion_service

router = APIRouter()

@router.post("/initialize-rag")
async def initialize_rag():
    """Initialize RAG system by populating vector database"""
    try:
        data_service = get_data_ingestion_service()
        data_service.initialize_database()
        return {
            "status": "success",
            "message": "RAG system initialized successfully",
            "details": {
                "vector_db": "ChromaDB populated",
                "job_descriptions": "Ingested",
                "learning_resources": "Ingested"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Initialization failed: {str(e)}")

@router.get("/rag-status")
async def rag_status():
    """Check RAG system status"""
    try:
        from rag.vector_store import VectorStore
        vector_store = VectorStore()
        count = vector_store.collection.count()
        
        return {
            "status": "operational",
            "vector_db": "ChromaDB",
            "documents_count": count,
            "llm": "Gemini (gemini-1.5-flash)",
            "embeddings": "sentence-transformers"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
