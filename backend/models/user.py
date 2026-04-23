from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    email = Column(String, primary_key=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    
    # Resume data
    resume_text = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated
    target_role = Column(String, nullable=True)
    
    # Analysis results (stored as JSON)
    resume_analysis = Column(Text, nullable=True)  # JSON string
    skill_gap_analysis = Column(Text, nullable=True)  # JSON string
    roadmap_data = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    
    # Progress tracking
    is_first_login = Column(Boolean, default=True)
    resume_completed = Column(Boolean, default=False)
    skill_gap_completed = Column(Boolean, default=False)
    roadmap_completed = Column(Boolean, default=False)
    progress_data = Column(Text, nullable=True)  # JSON string for daily progress and streaks
    roadmap_tracking = Column(Text, nullable=True)  # JSON string for adaptive roadmap tracking
