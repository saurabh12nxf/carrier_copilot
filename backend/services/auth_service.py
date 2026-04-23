from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.user import User
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password (bcrypt has 72 byte limit)"""
    # Truncate password to 72 characters (safe for bcrypt)
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    # Truncate password to 72 characters (safe for bcrypt)
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"Password verification: {result}")
        return result
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def create_user(db: Session, email: str, password: str, name: str):
    """Create new user"""
    # Check if exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return None
    
    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password),
        name=name,
        is_first_login=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    return user

def get_user(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def update_resume(db: Session, email: str, resume_text: str, skills: list):
    """Update user resume"""
    user = get_user(db, email)
    if user:
        user.resume_text = resume_text
        user.skills = ",".join(skills)
        user.resume_completed = True
        db.commit()
        return True
    return False

def mark_skill_gap_complete(db: Session, email: str, target_role: str):
    """Mark skill gap analysis complete"""
    user = get_user(db, email)
    if user:
        user.target_role = target_role
        user.skill_gap_completed = True
        db.commit()
        return True
    return False

def mark_roadmap_complete(db: Session, email: str):
    """Mark roadmap complete"""
    user = get_user(db, email)
    if user:
        user.roadmap_completed = True
        db.commit()
        return True
    return False

def mark_onboarding_complete(db: Session, email: str):
    """Mark onboarding complete"""
    user = get_user(db, email)
    if user:
        user.is_first_login = False
        db.commit()
        return True
    return False


def save_resume_analysis(db: Session, email: str, analysis_data: dict):
    """Save resume analysis to database"""
    import json
    user = get_user(db, email)
    if user:
        user.resume_analysis = json.dumps(analysis_data)
        user.resume_completed = True
        db.commit()
        return True
    return False

def save_skill_gap_analysis(db: Session, email: str, analysis_data: dict):
    """Save skill gap analysis to database"""
    import json
    user = get_user(db, email)
    if user:
        user.skill_gap_analysis = json.dumps(analysis_data)
        user.skill_gap_completed = True
        if analysis_data.get('target_role'):
            user.target_role = analysis_data['target_role']
        db.commit()
        return True
    return False

def save_roadmap_data(db: Session, email: str, roadmap_data: dict):
    """Save roadmap data to database"""
    import json
    user = get_user(db, email)
    if user:
        user.roadmap_data = json.dumps(roadmap_data)
        user.roadmap_completed = True
        db.commit()
        return True
    return False

def get_user_analysis_data(db: Session, email: str):
    """Get all analysis data for user"""
    import json
    user = get_user(db, email)
    if not user:
        return None
    
    return {
        "email": user.email,
        "name": user.name,
        "resume_analysis": json.loads(user.resume_analysis) if user.resume_analysis else None,
        "skill_gap_analysis": json.loads(user.skill_gap_analysis) if user.skill_gap_analysis else None,
        "roadmap_data": json.loads(user.roadmap_data) if user.roadmap_data else None,
        "progress": {
            "resume_completed": user.resume_completed,
            "skill_gap_completed": user.skill_gap_completed,
            "roadmap_completed": user.roadmap_completed
        }
    }

def reset_password(db: Session, email: str, new_password: str):
    """Reset user password"""
    user = get_user(db, email)
    if user:
        user.password_hash = hash_password(new_password)
        db.commit()
        return True
    return False

def check_email_exists(db: Session, email: str) -> bool:
    """Check if email exists in database"""
    user = db.query(User).filter(User.email == email).first()
    return user is not None
