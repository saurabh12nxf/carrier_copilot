from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.db import get_db
from services.auth_service import (
    create_user,
    authenticate_user,
    get_user,
    mark_onboarding_complete,
    reset_password,
    check_email_exists
)

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    confirm_password: str

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
    # First check if email exists
    if not check_email_exists(db, request.email):
        raise HTTPException(status_code=404, detail="Email not registered. Please sign up first.")
    
    # Try to authenticate
    user = authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect password. Try 'Forgot Password' if you don't remember it.")
    
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

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Check if email exists for password reset"""
    if not check_email_exists(db, request.email):
        raise HTTPException(status_code=404, detail="Email not found. Please check your email or sign up.")
    
    # In a real app, you'd send an email with reset link
    # For now, we'll just confirm the email exists
    return {
        "message": "Email verified. You can now reset your password.",
        "email": request.email
    }

@router.post("/reset-password")
async def reset_password_endpoint(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password"""
    # Validate passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Validate password length
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Check if email exists
    if not check_email_exists(db, request.email):
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Reset password
    success = reset_password(db, request.email, request.new_password)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to reset password")
    
    return {
        "message": "Password reset successful. You can now login with your new password.",
        "email": request.email
    }
