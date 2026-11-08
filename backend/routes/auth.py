import os
import sys
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database.db import get_db
from models.user import User
from services.auth_service import (
    create_user,
    authenticate_user,
    get_user,
    mark_onboarding_complete,
    reset_password,
    check_email_exists,
    normalize_email,
    create_access_token,
    verify_access_token,
    user_to_dict,
    get_user_analysis_data,
)

router = APIRouter()


# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------

class SignupRequest(BaseModel):
    name: Optional[str] = Field(None, description="Full name of the user")
    full_name: Optional[str] = Field(None, description="Full name of the user (alias)")
    fullName: Optional[str] = Field(None, description="Full name of the user (camelCase alias)")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password with minimum 6 characters")


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Registered email address")
    username: Optional[str] = Field(None, description="Registered email or username")
    password: str = Field(..., min_length=1, description="Account password")


class ForgotPasswordRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Registered email address")
    username: Optional[str] = Field(None, description="Registered email or username")


class ResetPasswordRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Registered email address")
    username: Optional[str] = Field(None, description="Registered email or username")
    new_password: Optional[str] = Field(None, min_length=6, description="New password")
    newPassword: Optional[str] = Field(None, min_length=6, description="New password")
    confirm_password: Optional[str] = Field(None, min_length=6, description="Confirmation of new password")
    confirmPassword: Optional[str] = Field(None, min_length=6, description="Confirmation of new password")


class CompleteOnboardingRequest(BaseModel):
    email: Optional[str] = Field(None, description="Registered email of the user completing onboarding")


# ---------------------------------------------------------
# Authentication Dependency for Protected Endpoints
# ---------------------------------------------------------

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """Validate Bearer JWT token from Authorization header and return current User."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split("Bearer ", 1)[1].strip()
    payload = verify_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user(db, payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account associated with this token was not found.",
        )

    return user


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user, hash password, and issue JWT session token."""
    clean_email = normalize_email(request.email)
    raw_name = request.full_name or request.name or request.fullName or ""
    clean_name = raw_name.strip()

    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter your full name.",
        )

    if check_email_exists(db, clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )

    user = create_user(
        db,
        email=clean_email,
        password=request.password,
        name=clean_name,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create account. Please check your information and try again.",
        )

    # Issue production JWT token
    token = create_access_token({
        "sub": user.email,
        "name": user.name,
    })

    user_info = user_to_dict(user)
    user_info["full_name"] = user.name
    user_info["fullName"] = user.name

    return {
        "message": "User created successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": user_info,
        "email": user.email,
        "name": user.name,
        "full_name": user.name,
    }


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user credentials and issue JWT session token."""
    target_email = request.email or request.username
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your registered email address.",
        )
    clean_email = normalize_email(str(target_email))

    if not check_email_exists(db, clean_email):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered. Please sign up first.",
        )

    user = authenticate_user(db, clean_email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Click 'Forgot Password' if you need to reset it.",
        )

    # Issue production JWT token
    token = create_access_token({
        "sub": user.email,
        "name": user.name,
    })

    user_info = user_to_dict(user)
    user_info["full_name"] = user.name
    user_info["fullName"] = user.name

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": user_info,
        "email": user.email,
        "name": user.name,
        "full_name": user.name,
    }


@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the currently authenticated user's profile and analysis data."""
    user_info = user_to_dict(current_user)
    analysis_data = get_user_analysis_data(db, current_user.email)
    return {
        "user": user_info,
        "data": analysis_data,
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Acknowledge session termination on backend."""
    return {"message": "Session terminated successfully"}


@router.get("/user/{email}")
async def get_user_data(email: str, db: Session = Depends(get_db)):
    """Get user data including all analysis results (case-insensitive)."""
    clean_email = normalize_email(email)
    data = get_user_analysis_data(db, clean_email)

    if not data:
        user = get_user(db, clean_email)
        if user:
            return {
                "email": user.email,
                "name": user.name,
                "resume_analysis": None,
                "skill_gap_analysis": None,
                "roadmap_data": None,
                "progress": {
                    "resume_completed": bool(user.resume_completed),
                    "skill_gap_completed": bool(user.skill_gap_completed),
                    "roadmap_completed": bool(user.roadmap_completed),
                },
            }
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return data


@router.post("/complete-onboarding")
async def complete_onboarding_endpoint(
    request: Optional[CompleteOnboardingRequest] = None,
    email: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Mark onboarding as complete for the specified user."""
    target_email = None
    if request and request.email:
        target_email = request.email
    elif email:
        target_email = email
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        payload = verify_access_token(token)
        if payload and payload.get("sub"):
            target_email = payload["sub"]

    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email is required to complete onboarding.",
        )

    clean_email = normalize_email(str(target_email))
    success = mark_onboarding_complete(db, clean_email)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {"message": "Onboarding completed successfully", "isFirstLogin": False}


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Verify if email exists for password reset."""
    target_email = request.email or request.username
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your registered email address.",
        )
    clean_email = normalize_email(str(target_email))
    if not check_email_exists(db, clean_email):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email. Please check your email or sign up.",
        )

    return {
        "message": "Email verified. You can now set your new password.",
        "email": clean_email,
    }


@router.post("/reset-password")
async def reset_password_endpoint(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password after matching confirmation."""
    target_email = request.email or request.username
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your registered email address.",
        )
    clean_email = normalize_email(str(target_email))

    new_pw = request.new_password or request.newPassword
    confirm_pw = request.confirm_password or request.confirmPassword

    if not new_pw or not confirm_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide both new password and password confirmation.",
        )

    if new_pw != confirm_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    if len(new_pw) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters",
        )

    if not check_email_exists(db, clean_email):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email",
        )

    success = reset_password(db, clean_email, new_pw)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password. Please try again.",
        )

    return {
        "message": "Password reset successful! You can now log in with your new password.",
        "email": clean_email,
    }
