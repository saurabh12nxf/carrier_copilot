from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from services.adaptive_tracker import get_adaptive_tracker
from services.auth_service import get_user
import json

router = APIRouter()

class MarkWeekCompleteRequest(BaseModel):
    email: str
    week_num: int
    hours_spent: float = 0

class MarkTaskCompleteRequest(BaseModel):
    email: str
    week_num: int
    task_index: int

class InitializeTrackingRequest(BaseModel):
    email: str

@router.post("/roadmap/initialize-tracking")
async def initialize_tracking(request: InitializeTrackingRequest, db: Session = Depends(get_db)):
    """Initialize tracking for user's roadmap"""
    try:
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.roadmap_data:
            raise HTTPException(status_code=404, detail="No roadmap found. Generate roadmap first.")
        
        roadmap = json.loads(user.roadmap_data)
        
        tracker = get_adaptive_tracker()
        tracking_data = tracker.initialize_tracking(roadmap, request.email)
        
        # Save tracking data
        user.roadmap_tracking = json.dumps(tracking_data)
        db.commit()
        
        return {
            "message": "Tracking initialized",
            "tracking_data": tracking_data
        }
        
    except Exception as e:
        print(f"[TRACKING] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roadmap/mark-week-complete")
async def mark_week_complete(request: MarkWeekCompleteRequest, db: Session = Depends(get_db)):
    """Mark a week as complete and update velocity"""
    try:
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.roadmap_tracking:
            raise HTTPException(status_code=404, detail="Tracking not initialized")
        
        tracking_data = json.loads(user.roadmap_tracking)
        
        tracker = get_adaptive_tracker()
        updated_tracking = tracker.mark_week_complete(
            tracking_data, 
            request.week_num, 
            request.hours_spent
        )
        
        # Save updated tracking
        user.roadmap_tracking = json.dumps(updated_tracking)
        db.commit()
        
        # Get progress summary
        summary = tracker.get_progress_summary(updated_tracking)
        
        return {
            "message": f"Week {request.week_num} marked complete!",
            "tracking_data": updated_tracking,
            "progress_summary": summary,
            "should_adjust": tracker.should_adjust_roadmap(updated_tracking)
        }
        
    except Exception as e:
        print(f"[TRACKING] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roadmap/mark-task-complete")
async def mark_task_complete(request: MarkTaskCompleteRequest, db: Session = Depends(get_db)):
    """Mark a specific task as complete"""
    try:
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.roadmap_tracking:
            raise HTTPException(status_code=404, detail="Tracking not initialized")
        
        tracking_data = json.loads(user.roadmap_tracking)
        
        tracker = get_adaptive_tracker()
        updated_tracking = tracker.mark_task_complete(
            tracking_data, 
            request.week_num, 
            request.task_index
        )
        
        # Save updated tracking
        user.roadmap_tracking = json.dumps(updated_tracking)
        db.commit()
        
        return {
            "message": "Task marked complete!",
            "tracking_data": updated_tracking
        }
        
    except Exception as e:
        print(f"[TRACKING] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roadmap/progress/{email}")
async def get_progress(email: str, db: Session = Depends(get_db)):
    """Get current progress summary"""
    try:
        user = get_user(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.roadmap_tracking:
            return {
                "initialized": False,
                "message": "Tracking not initialized yet"
            }
        
        tracking_data = json.loads(user.roadmap_tracking)
        
        tracker = get_adaptive_tracker()
        summary = tracker.get_progress_summary(tracking_data)
        
        return {
            "initialized": True,
            "progress_summary": summary,
            "tracking_data": tracking_data
        }
        
    except Exception as e:
        print(f"[TRACKING] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
