"""
Adaptive Roadmap Tracker - Monitors Progress and Adjusts Timeline
Tracks completion, calculates velocity, and adapts roadmap based on student pace
"""
from typing import Dict, List
from datetime import datetime, timedelta
import json

class AdaptiveTracker:
    """Track progress and adapt roadmap dynamically"""
    
    def __init__(self):
        pass
    
    def initialize_tracking(self, roadmap: Dict, email: str) -> Dict:
        """
        Initialize tracking data for a new roadmap
        
        Returns:
            Tracking data structure
        """
        tracking_data = {
            "email": email,
            "start_date": datetime.now().isoformat(),
            "current_week": 1,
            "total_weeks": roadmap.get("total_weeks", 20),
            "completed_weeks": [],
            "week_progress": {},  # week_num: {completed: bool, completion_date: str, hours_spent: float}
            "velocity": 1.0,  # 1.0 = on track, >1.0 = faster, <1.0 = slower
            "adjusted_timeline": roadmap.get("timeline", "5 months"),
            "last_activity": datetime.now().isoformat(),
            "streak_days": 0,
            "total_hours_spent": 0
        }
        
        # Initialize each week
        for week in roadmap.get("weekly_plan", []):
            week_num = week.get("week", 0)
            tracking_data["week_progress"][str(week_num)] = {
                "completed": False,
                "completion_date": None,
                "hours_spent": 0,
                "tasks_completed": [],
                "started": False,
                "start_date": None
            }
        
        return tracking_data
    
    def mark_week_complete(
        self, 
        tracking_data: Dict, 
        week_num: int, 
        hours_spent: float = 0
    ) -> Dict:
        """
        Mark a week as complete and recalculate velocity
        
        Args:
            tracking_data: Current tracking data
            week_num: Week number to mark complete
            hours_spent: Hours spent on this week
        
        Returns:
            Updated tracking data with adjusted timeline
        """
        week_key = str(week_num)
        
        if week_key not in tracking_data["week_progress"]:
            return tracking_data
        
        # Mark week complete
        tracking_data["week_progress"][week_key]["completed"] = True
        tracking_data["week_progress"][week_key]["completion_date"] = datetime.now().isoformat()
        tracking_data["week_progress"][week_key]["hours_spent"] = hours_spent
        
        # Add to completed weeks
        if week_num not in tracking_data["completed_weeks"]:
            tracking_data["completed_weeks"].append(week_num)
        
        # Update total hours
        tracking_data["total_hours_spent"] += hours_spent
        
        # Update current week
        tracking_data["current_week"] = week_num + 1
        
        # Calculate velocity and adjust timeline
        tracking_data = self._calculate_velocity(tracking_data)
        tracking_data = self._adjust_timeline(tracking_data)
        
        # Update last activity
        tracking_data["last_activity"] = datetime.now().isoformat()
        
        print(f"[TRACKER] Week {week_num} completed. Velocity: {tracking_data['velocity']:.2f}x")
        
        return tracking_data
    
    def mark_task_complete(
        self, 
        tracking_data: Dict, 
        week_num: int, 
        task_index: int
    ) -> Dict:
        """Mark a specific task within a week as complete"""
        week_key = str(week_num)
        
        if week_key not in tracking_data["week_progress"]:
            return tracking_data
        
        # Mark week as started if not already
        if not tracking_data["week_progress"][week_key]["started"]:
            tracking_data["week_progress"][week_key]["started"] = True
            tracking_data["week_progress"][week_key]["start_date"] = datetime.now().isoformat()
        
        # Add task to completed list
        if task_index not in tracking_data["week_progress"][week_key]["tasks_completed"]:
            tracking_data["week_progress"][week_key]["tasks_completed"].append(task_index)
        
        tracking_data["last_activity"] = datetime.now().isoformat()
        
        return tracking_data
    
    def _calculate_velocity(self, tracking_data: Dict) -> Dict:
        """
        Calculate learning velocity based on completion rate
        
        Velocity = Actual weeks taken / Expected weeks
        - velocity > 1.0 = faster than expected
        - velocity < 1.0 = slower than expected
        """
        completed_count = len(tracking_data["completed_weeks"])
        
        if completed_count == 0:
            tracking_data["velocity"] = 1.0
            return tracking_data
        
        # Calculate expected weeks based on start date
        start_date = datetime.fromisoformat(tracking_data["start_date"])
        weeks_elapsed = (datetime.now() - start_date).days / 7
        
        if weeks_elapsed < 0.5:  # Less than half a week
            tracking_data["velocity"] = 1.0
            return tracking_data
        
        # Velocity = completed weeks / elapsed weeks
        velocity = completed_count / weeks_elapsed
        
        # Clamp velocity between 0.3 and 2.0
        velocity = max(0.3, min(2.0, velocity))
        
        tracking_data["velocity"] = round(velocity, 2)
        
        return tracking_data
    
    def _adjust_timeline(self, tracking_data: Dict) -> Dict:
        """
        Adjust remaining timeline based on velocity
        """
        velocity = tracking_data["velocity"]
        total_weeks = tracking_data["total_weeks"]
        completed_weeks = len(tracking_data["completed_weeks"])
        remaining_weeks = total_weeks - completed_weeks
        
        if remaining_weeks <= 0:
            tracking_data["adjusted_timeline"] = "Completed!"
            return tracking_data
        
        # Adjust remaining weeks based on velocity
        adjusted_remaining = remaining_weeks / velocity if velocity > 0 else remaining_weeks
        adjusted_remaining = max(1, round(adjusted_remaining))
        
        # Convert to months
        adjusted_months = adjusted_remaining / 4
        
        if adjusted_months < 1:
            timeline_str = f"{adjusted_remaining} weeks"
        else:
            timeline_str = f"{adjusted_months:.1f} months"
        
        tracking_data["adjusted_timeline"] = timeline_str
        
        # Add recommendation
        if velocity > 1.3:
            tracking_data["pace_status"] = "fast"
            tracking_data["recommendation"] = "🚀 You're ahead of schedule! Consider adding advanced features to projects."
        elif velocity < 0.7:
            tracking_data["pace_status"] = "slow"
            tracking_data["recommendation"] = "⏰ You're behind schedule. Try to dedicate more time or simplify some tasks."
        else:
            tracking_data["pace_status"] = "on-track"
            tracking_data["recommendation"] = "✅ Perfect pace! Keep up the great work."
        
        return tracking_data
    
    def get_progress_summary(self, tracking_data: Dict) -> Dict:
        """Get a summary of current progress"""
        completed_count = len(tracking_data["completed_weeks"])
        total_weeks = tracking_data["total_weeks"]
        completion_percentage = (completed_count / total_weeks * 100) if total_weeks > 0 else 0
        
        return {
            "completed_weeks": completed_count,
            "total_weeks": total_weeks,
            "completion_percentage": round(completion_percentage, 1),
            "current_week": tracking_data["current_week"],
            "velocity": tracking_data["velocity"],
            "adjusted_timeline": tracking_data["adjusted_timeline"],
            "pace_status": tracking_data.get("pace_status", "on-track"),
            "recommendation": tracking_data.get("recommendation", "Keep learning!"),
            "total_hours_spent": tracking_data["total_hours_spent"],
            "last_activity": tracking_data["last_activity"]
        }
    
    def should_adjust_roadmap(self, tracking_data: Dict) -> bool:
        """
        Determine if roadmap should be regenerated based on velocity
        
        Returns True if velocity is significantly off (>1.5x or <0.5x)
        """
        velocity = tracking_data.get("velocity", 1.0)
        completed_count = len(tracking_data.get("completed_weeks", []))
        
        # Only suggest adjustment after at least 3 weeks
        if completed_count < 3:
            return False
        
        # Suggest adjustment if very fast or very slow
        return velocity > 1.5 or velocity < 0.5


# Singleton
_adaptive_tracker = None

def get_adaptive_tracker():
    """Get or create adaptive tracker"""
    global _adaptive_tracker
    if _adaptive_tracker is None:
        _adaptive_tracker = AdaptiveTracker()
    return _adaptive_tracker
