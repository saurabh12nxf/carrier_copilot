"""
AI Career Coach API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from services.ai_coach_service import get_ai_coach

router = APIRouter()

class ChatRequest(BaseModel):
    email: str
    message: str

class ClearHistoryRequest(BaseModel):
    email: str

@router.post("/chat")
async def chat_with_coach(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat with AI Career Coach
    Context-aware responses based on user's skills, roadmap, and progress
    """
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        coach = get_ai_coach()
        response = coach.chat(db, request.email, request.message)
        
        return response
    
    except Exception as e:
        print(f"[AI COACH] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.get("/history/{email}")
async def get_chat_history(email: str):
    """Get conversation history for user"""
    try:
        coach = get_ai_coach()
        history = coach.get_history(email)
        
        return {
            "email": email,
            "history": history,
            "message_count": len(history)
        }
    
    except Exception as e:
        print(f"[AI COACH] Error getting history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.post("/clear-history")
async def clear_chat_history(request: ClearHistoryRequest):
    """Clear conversation history for user"""
    try:
        coach = get_ai_coach()
        coach.clear_history(request.email)
        
        return {
            "message": "Chat history cleared successfully",
            "email": request.email
        }
    
    except Exception as e:
        print(f"[AI COACH] Error clearing history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")
