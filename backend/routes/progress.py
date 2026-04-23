"""
Progress Tracking API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from services.progress_tracker import get_progress_tracker

router = APIRouter()

class LogActivityRequest(BaseModel):
    email: str
    topic: str
    hours: float = 0.5

class MarkCompleteRequest(BaseModel):
    email: str
    topic: str

@router.get("/progress/{email}")
async def get_user_progress(email: str, db: Session = Depends(get_db)):
    """Get user's progress and streak data"""
    try:
        tracker = get_progress_tracker()
        progress = tracker.get_progress(db, email)
        
        if "error" in progress:
            raise HTTPException(status_code=404, detail=progress["error"])
        
        return progress
    
    except Exception as e:
        print(f"[PROGRESS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")

@router.post("/log-activity")
async def log_activity(request: LogActivityRequest, db: Session = Depends(get_db)):
    """Log daily activity"""
    try:
        tracker = get_progress_tracker()
        result = tracker.log_activity(db, request.email, request.topic, request.hours)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    
    except Exception as e:
        print(f"[PROGRESS] Error logging activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to log activity: {str(e)}")

@router.post("/mark-complete")
async def mark_topic_complete(request: MarkCompleteRequest, db: Session = Depends(get_db)):
    """Mark a topic as completed"""
    try:
        tracker = get_progress_tracker()
        result = tracker.mark_topic_complete(db, request.email, request.topic)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    
    except Exception as e:
        print(f"[PROGRESS] Error marking complete: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to mark complete: {str(e)}")
