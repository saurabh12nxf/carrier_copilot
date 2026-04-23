from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from services.enhanced_roadmap_service import get_enhanced_roadmap_service
from services.auth_service import get_user
import json

router = APIRouter()

class RoadmapRequest(BaseModel):
    email: str
    target_role: str

@router.post("/roadmap")
async def career_roadmap(request: RoadmapRequest, db: Session = Depends(get_db)):
    """
    Generate adaptive week-by-week roadmap based on user's current skills
    """
    try:
        # Get user data
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get skill gap analysis to understand current level
        current_skills = []
        missing_skills = []
        completion_percentage = 0
        estimated_months = 6
        
        if user.skill_gap_analysis:
            try:
                analysis = json.loads(user.skill_gap_analysis)
                skill_gap = analysis.get("skill_gap", {})
                current_skills = skill_gap.get("matching_skills", [])
                missing_skills = skill_gap.get("missing_skills", [])
                completion_percentage = skill_gap.get("completion_percentage", 0)
                
                # Calculate estimated time based on completion
                if completion_percentage < 30:
                    estimated_months = 8
                elif completion_percentage < 60:
                    estimated_months = 5
                else:
                    estimated_months = 3
            except:
                pass
        
        # Generate enhanced roadmap
        roadmap_service = get_enhanced_roadmap_service()
        roadmap = roadmap_service.generate_adaptive_roadmap(
            target_role=request.target_role,
            current_skills=current_skills,
            missing_skills=missing_skills,
            completion_percentage=completion_percentage,
            estimated_months=estimated_months
        )
        
        # Save to database
        from services.auth_service import save_roadmap_data
        save_roadmap_data(db, request.email, roadmap)
        
        # Initialize tracking automatically
        from services.adaptive_tracker import get_adaptive_tracker
        tracker = get_adaptive_tracker()
        tracking_data = tracker.initialize_tracking(roadmap, request.email)
        user.roadmap_tracking = json.dumps(tracking_data)
        db.commit()
        
        return roadmap
        
    except Exception as e:
        print(f"[ROADMAP] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")
