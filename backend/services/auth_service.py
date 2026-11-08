import os
import sys
import hmac
import hashlib
import base64
import json
import time
from datetime import datetime
from typing import Optional, Dict, Any, List

import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import func

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from models.user import User

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "career-copilot-production-jwt-secret-2024-secure-random")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 60 * 60 * 24 * 7  # 7 days expiration


# ---------------------------------------------------------
# Password Hashing & Verification (Native Bcrypt)
# ---------------------------------------------------------

def hash_password(password: str) -> str:
    """Hash password using native bcrypt (safe for 72-byte limit)."""
    if not password:
        raise ValueError("Password cannot be empty")
    # Truncate at 72 bytes to adhere to bcrypt standard specification
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against a bcrypt hash string."""
    if not plain_password or not hashed_password:
        return False
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception as e:
        print(f"[AUTH] Password verification error: {e}")
        return False


# ---------------------------------------------------------
# JWT Token Generation & Verification (RFC 7519 compliant)
# ---------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    rem = len(data) % 4
    if rem > 0:
        data += "=" * (4 - rem)
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_access_token(data: Dict[str, Any], expires_in_seconds: int = JWT_EXPIRE_SECONDS) -> str:
    """Create a signed JWT token."""
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = data.copy()
    now = int(time.time())
    payload["iat"] = now
    payload["exp"] = now + expires_in_seconds

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token. Returns payload dict or None if invalid/expired."""
    if not token or not isinstance(token, str):
        return None
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = _b64url_encode(expected_sig)

        if not hmac.compare_digest(expected_sig_b64, sig_b64):
            return None

        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if "exp" in payload and payload["exp"] < time.time():
            return None

        return payload
    except Exception as e:
        print(f"[AUTH] Token verification error: {e}")
        return None


# ---------------------------------------------------------
# User Helpers & Database Operations
# ---------------------------------------------------------

def normalize_email(email: str) -> str:
    """Clean, URL-decode and normalize email address to lowercase."""
    if not email:
        return ""
    import urllib.parse
    return urllib.parse.unquote(str(email)).strip().lower()


def user_to_dict(user: User) -> Dict[str, Any]:
    """Convert User model to a clean frontend-ready dictionary."""
    skills_list = []
    if user.skills:
        skills_list = [s.strip() for s in user.skills.split(",") if s.strip()]

    return {
        "email": user.email,
        "name": user.name,
        "isFirstLogin": bool(user.is_first_login),
        "is_first_login": bool(user.is_first_login),
        "resumeCompleted": bool(user.resume_completed),
        "skillGapCompleted": bool(user.skill_gap_completed),
        "roadmapCompleted": bool(user.roadmap_completed),
        "skills": skills_list,
        "targetRole": user.target_role or "",
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "lastLogin": user.last_login.isoformat() if user.last_login else None,
    }


def get_user(db: Session, email: str) -> Optional[User]:
    """Get user by email (case-insensitive and trimmed)."""
    if not email:
        return None
    normalized = normalize_email(email)
    return db.query(User).filter(func.lower(User.email) == normalized).first()


def check_email_exists(db: Session, email: str) -> bool:
    """Check if email already exists in database."""
    return get_user(db, email) is not None


def create_user(db: Session, email: str, password: str, name: str) -> Optional[User]:
    """Create a new user with bcrypt-hashed password."""
    normalized = normalize_email(email)
    if not normalized or not password:
        return None

    # Check if user already exists
    if get_user(db, normalized):
        return None

    clean_name = name.strip() if name else "User"

    user = User(
        email=normalized,
        password_hash=hash_password(password),
        name=clean_name,
        is_first_login=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    user = get_user(db, email)
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    return user


def reset_password(db: Session, email: str, new_password: str) -> bool:
    """Reset user password to a newly hashed password."""
    user = get_user(db, email)
    if user:
        user.password_hash = hash_password(new_password)
        db.commit()
        return True
    return False


def mark_onboarding_complete(db: Session, email: str) -> bool:
    """Mark user onboarding complete."""
    user = get_user(db, email)
    if user:
        user.is_first_login = False
        db.commit()
        return True
    return False


def update_resume(db: Session, email: str, resume_text: str, skills: List[str]) -> bool:
    """Update user resume text and skills."""
    user = get_user(db, email)
    if user:
        user.resume_text = resume_text
        user.skills = ",".join(skills) if skills else ""
        user.resume_completed = True
        db.commit()
        return True
    return False


def mark_skill_gap_complete(db: Session, email: str, target_role: str) -> bool:
    """Mark skill gap complete and save target role."""
    user = get_user(db, email)
    if user:
        user.target_role = target_role
        user.skill_gap_completed = True
        db.commit()
        return True
    return False


def mark_roadmap_complete(db: Session, email: str) -> bool:
    """Mark roadmap generation complete."""
    user = get_user(db, email)
    if user:
        user.roadmap_completed = True
        db.commit()
        return True
    return False


def save_resume_analysis(db: Session, email: str, analysis_data: Dict[str, Any]) -> bool:
    """Save resume analysis to database."""
    user = get_user(db, email)
    if user:
        user.resume_analysis = json.dumps(analysis_data)
        user.resume_completed = True
        db.commit()
        return True
    return False


def save_skill_gap_analysis(db: Session, email: str, analysis_data: Dict[str, Any]) -> bool:
    """Save skill gap analysis to database."""
    user = get_user(db, email)
    if user:
        user.skill_gap_analysis = json.dumps(analysis_data)
        user.skill_gap_completed = True
        if analysis_data.get("target_role"):
            user.target_role = analysis_data["target_role"]
        db.commit()
        return True
    return False


def save_roadmap_data(db: Session, email: str, roadmap_data: Dict[str, Any]) -> bool:
    """Save roadmap data to database."""
    user = get_user(db, email)
    if user:
        user.roadmap_data = json.dumps(roadmap_data)
        user.roadmap_completed = True
        db.commit()
        return True
    return False


def get_user_analysis_data(db: Session, email: str) -> Optional[Dict[str, Any]]:
    """Get all analysis data stored for user."""
    user = get_user(db, email)
    if not user:
        return None

    def _safe_json_loads(data):
        if not data:
            return None
        try:
            return json.loads(data)
        except Exception:
            return None

    return {
        "email": user.email,
        "name": user.name,
        "isFirstLogin": bool(user.is_first_login),
        "is_first_login": bool(user.is_first_login),
        "resume_analysis": _safe_json_loads(user.resume_analysis),
        "skill_gap_analysis": _safe_json_loads(user.skill_gap_analysis),
        "roadmap_data": _safe_json_loads(user.roadmap_data),
        "progress": {
            "resume_completed": bool(user.resume_completed),
            "skill_gap_completed": bool(user.skill_gap_completed),
            "roadmap_completed": bool(user.roadmap_completed),
        },
    }
