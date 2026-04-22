from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.db import get_db
from services.auth_service import (
    create_user,
    authenticate_user,
    get_user,
    mark_onboarding_complete
)

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Register new user"""
    user = create_user(
        db, 
        email=request.email, 
        password=request.password, 
        name=request.name
    )
    
    if not user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return {
        "message": "User created successfully",
        "email": user.email,
        "name": user.name
    }

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "user": {
            "email": user.email,
            "name": user.name,
            "isFirstLogin": user.is_first_login,
            "resumeCompleted": user.resume_completed,
            "skillGapCompleted": user.skill_gap_completed,
            "roadmapCompleted": user.roadmap_completed,
            "skills": user.skills.split(",") if user.skills else [],
            "targetRole": user.target_role
        }
    }

@router.get("/user/{email}")
async def get_user_data(email: str, db: Session = Depends(get_db)):
    """Get user data including all analysis results"""
    from services.auth_service import get_user_analysis_data
    
    data = get_user_analysis_data(db, email)
    
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return data

@router.post("/complete-onboarding")
async def complete_onboarding(email: str, db: Session = Depends(get_db)):
    """Mark onboarding complete"""
    success = mark_onboarding_complete(db, email)
    
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Onboarding completed"}
