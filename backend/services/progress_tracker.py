"""
Daily Progress Tracker with Streak System
Tracks user's daily learning progress, streaks, and goals
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from models.user import User
import json

class ProgressTracker:
    """Track daily progress and streaks"""
    
    def __init__(self):
        self.daily_goal_hours = 2  # Default: 2 hours per day
    
    def get_progress(self, db: Session, email: str) -> Dict:
        """Get user's progress data"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"error": "User not found"}
        
        # Parse progress data
        progress_data = self._parse_progress_data(user)
        
        # Calculate streak
        streak = self._calculate_streak(progress_data)
        
        # Get today's progress
        today = datetime.utcnow().date().isoformat()
        today_progress = progress_data.get("daily_logs", {}).get(today, {})
        
        return {
            "current_streak": streak["current"],
            "longest_streak": streak["longest"],
            "today_completed": today_progress.get("completed", False),
            "today_hours": today_progress.get("hours", 0),
            "today_topics": today_progress.get("topics", []),
            "total_days_active": len(progress_data.get("daily_logs", {})),
            "total_hours": progress_data.get("total_hours", 0),
            "daily_goal": self.daily_goal_hours,
            "last_active": progress_data.get("last_active"),
            "missed_yesterday": self._missed_yesterday(progress_data)
        }
    
    def log_activity(self, db: Session, email: str, topic: str, hours: float) -> Dict:
        """Log daily activity"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"error": "User not found"}
        
        progress_data = self._parse_progress_data(user)
        
        today = datetime.utcnow().date().isoformat()
        
        # Initialize today's log if not exists
        if "daily_logs" not in progress_data:
            progress_data["daily_logs"] = {}
        
        if today not in progress_data["daily_logs"]:
            progress_data["daily_logs"][today] = {
                "topics": [],
                "hours": 0,
                "completed": False
            }
        
        # Add topic and hours
        if topic not in progress_data["daily_logs"][today]["topics"]:
            progress_data["daily_logs"][today]["topics"].append(topic)
        
        progress_data["daily_logs"][today]["hours"] += hours
        
        # Check if daily goal met
        if progress_data["daily_logs"][today]["hours"] >= self.daily_goal_hours:
            progress_data["daily_logs"][today]["completed"] = True
        
        # Update total hours
        progress_data["total_hours"] = progress_data.get("total_hours", 0) + hours
        progress_data["last_active"] = datetime.utcnow().isoformat()
        
        # Save to database
        self._save_progress_data(user, progress_data, db)
        
        return {
            "success": True,
            "today_hours": progress_data["daily_logs"][today]["hours"],
            "goal_met": progress_data["daily_logs"][today]["completed"],
            "streak": self._calculate_streak(progress_data)["current"]
        }
    
    def mark_topic_complete(self, db: Session, email: str, topic: str) -> Dict:
        """Mark a topic as completed"""
        return self.log_activity(db, email, topic, 0.5)  # Default 30 min per topic
    
    def _parse_progress_data(self, user: User) -> Dict:
        """Parse progress data from user"""
        if hasattr(user, 'progress_data') and user.progress_data:
            try:
                return json.loads(user.progress_data)
            except:
                pass
        return {
            "daily_logs": {},
            "total_hours": 0,
            "last_active": None
        }
    
    def _save_progress_data(self, user: User, data: Dict, db: Session):
        """Save progress data to user"""
        user.progress_data = json.dumps(data)
        db.commit()
    
    def _calculate_streak(self, progress_data: Dict) -> Dict:
        """Calculate current and longest streak"""
        daily_logs = progress_data.get("daily_logs", {})
        if not daily_logs:
            return {"current": 0, "longest": 0}
        
        # Sort dates
        dates = sorted([datetime.fromisoformat(d).date() for d in daily_logs.keys()])
        
        current_streak = 0
        longest_streak = 0
        temp_streak = 0
        
        today = datetime.utcnow().date()
        
        # Calculate current streak (working backwards from today)
        check_date = today
        while True:
            date_str = check_date.isoformat()
            if date_str in daily_logs and daily_logs[date_str].get("completed"):
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        # Calculate longest streak
        for i, date in enumerate(dates):
            if daily_logs[date.isoformat()].get("completed"):
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
                
                # Check if next day is consecutive
                if i < len(dates) - 1:
                    next_date = dates[i + 1]
                    if (next_date - date).days > 1:
                        temp_streak = 0
            else:
                temp_streak = 0
        
        return {
            "current": current_streak,
            "longest": max(longest_streak, current_streak)
        }
    
    def _missed_yesterday(self, progress_data: Dict) -> bool:
        """Check if user missed yesterday"""
        yesterday = (datetime.utcnow().date() - timedelta(days=1)).isoformat()
        daily_logs = progress_data.get("daily_logs", {})
        
        if yesterday not in daily_logs:
            return True
        
        return not daily_logs[yesterday].get("completed", False)


# Singleton
_tracker = None

def get_progress_tracker() -> ProgressTracker:
    """Get or create progress tracker"""
    global _tracker
    if _tracker is None:
        _tracker = ProgressTracker()
    return _tracker
