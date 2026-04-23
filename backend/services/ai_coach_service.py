"""
AI Career Coach Service - Context-aware chatbot for career guidance
Uses user's skills, roadmap, and progress to provide personalized advice
"""
from typing import Dict, List, Optional
from utils.multi_llm import get_multi_llm
from services.auth_service import get_user
from sqlalchemy.orm import Session
import json
from datetime import datetime

class AICoachService:
    """AI Career Coach with context awareness"""
    
    def __init__(self):
        self.llm = get_multi_llm()
        self.conversation_history = {}  # Store per user
        
    def chat(self, db: Session, email: str, message: str) -> Dict:
        """
        Chat with AI Career Coach
        
        Args:
            db: Database session
            email: User email
            message: User's question
        
        Returns:
            AI response with context
        """
        # Get user context
        user = get_user(db, email)
        if not user:
            return {
                "response": "Please login first to use the AI Career Coach.",
                "context_used": False
            }
        
        # Build context from user data
        context = self._build_user_context(user)
        
        # Get conversation history
        history = self.conversation_history.get(email, [])
        
        # Create context-aware prompt
        prompt = self._create_coach_prompt(message, context, history)
        
        # Get AI response
        print(f"[AI COACH] Generating response for: {message[:50]}...")
        print(f"[AI COACH] Available providers: {self.llm.providers}")
        response = self.llm.generate(prompt, temperature=0.7, max_tokens=500)
        print(f"[AI COACH] Response length: {len(response) if response else 0}")
        print(f"[AI COACH] Provider used: {self.llm.current_provider}")
        
        if not response:
            print(f"[AI COACH] LLM returned empty, using fallback")
            response = self._get_fallback_response(message, context)
        
        # Update conversation history
        history.append({"user": message, "ai": response, "timestamp": datetime.utcnow().isoformat()})
        self.conversation_history[email] = history[-10:]  # Keep last 10 messages
        
        return {
            "response": response,
            "context_used": True,
            "llm_provider": self.llm.current_provider,
            "user_context": {
                "skills_count": len(context["skills"]),
                "target_role": context["target_role"],
                "completion": context["completion_percentage"]
            }
        }
    
    def _build_user_context(self, user) -> Dict:
        """Build context from user data"""
        context = {
            "name": user.name,
            "email": user.email,
            "skills": user.skills.split(",") if user.skills else [],
            "target_role": user.target_role or "Not set",
            "resume_completed": user.resume_completed,
            "skill_gap_completed": user.skill_gap_completed,
            "roadmap_completed": user.roadmap_completed,
            "completion_percentage": 0
        }
        
        # Parse analysis data if available
        if user.skill_gap_analysis:
            try:
                analysis = json.loads(user.skill_gap_analysis)
                context["completion_percentage"] = analysis.get("skill_gap", {}).get("completion_percentage", 0)
                context["missing_skills"] = analysis.get("skill_gap", {}).get("missing_skills", [])
                context["matching_skills"] = analysis.get("skill_gap", {}).get("matching_skills", [])
            except:
                pass
        
        return context
    
    def _create_coach_prompt(self, message: str, context: Dict, history: List) -> str:
        """Create context-aware prompt for AI coach"""
        
        # Build conversation history
        history_text = ""
        if history:
            recent = history[-3:]  # Last 3 exchanges
            for h in recent:
                history_text += f"User: {h['user']}\nCoach: {h['ai']}\n\n"
        
        prompt = f"""You are an expert AI Career Coach helping {context['name']} achieve their career goals.

USER PROFILE:
- Current Skills: {', '.join(context['skills'][:10]) if context['skills'] else 'No skills uploaded yet'}
- Target Role: {context['target_role']}
- Progress: {context['completion_percentage']}% ready for target role
- Resume Status: {'✅ Completed' if context['resume_completed'] else '❌ Not uploaded'}
- Skill Gap Analysis: {'✅ Done' if context['skill_gap_completed'] else '❌ Not done'}
- Roadmap: {'✅ Generated' if context['roadmap_completed'] else '❌ Not generated'}

RECENT CONVERSATION:
{history_text if history_text else 'This is the first message'}

USER'S QUESTION:
{message}

INSTRUCTIONS:
1. Be a supportive, encouraging mentor (not a generic AI)
2. Use their name occasionally
3. Reference their specific skills and progress
4. Give ACTIONABLE advice (not vague)
5. Be honest but motivating
6. If they're stuck, break down the problem
7. Suggest specific next steps
8. Keep response under 150 words
9. Use emojis sparingly (1-2 max)
10. If they ask about skills they don't have, guide them to learn it

RESPONSE STYLE:
- Conversational and friendly
- Like a senior developer mentoring a junior
- Practical and specific
- Encouraging but realistic

Your response:"""

        return prompt
    
    def _get_fallback_response(self, message: str, context: Dict) -> str:
        """Fallback response if LLM fails"""
        message_lower = message.lower()
        
        # Common questions
        if "weak" in message_lower or "struggle" in message_lower:
            return f"I understand you're facing challenges. Based on your profile, I'd recommend focusing on one skill at a time. Start with the fundamentals and build projects to practice. What specific area are you finding most difficult?"
        
        elif "dsa" in message_lower or "algorithm" in message_lower:
            return "Data Structures & Algorithms are crucial! Start with arrays and strings, then move to linked lists and trees. Practice on LeetCode daily - even 1 problem helps. Want me to suggest a learning path?"
        
        elif "project" in message_lower:
            return f"Great question! For {context['target_role']}, I'd suggest building projects that showcase the skills you're learning. Start small, then increase complexity. What technologies are you comfortable with?"
        
        elif "job" in message_lower or "interview" in message_lower:
            if context['completion_percentage'] > 50:
                readiness_msg = "you're on the right track"
            else:
                readiness_msg = "focus on building your skills first"
            return f"With {context['completion_percentage']}% readiness, {readiness_msg}. Work on projects, contribute to open source, and network on LinkedIn. Need specific interview prep advice?"
        
        elif "time" in message_lower or "long" in message_lower:
            return "Learning takes time, but consistency matters more than speed. Aim for 2-3 hours daily of focused practice. You'll see progress in weeks, not months. What's your current study schedule?"
        
        else:
            return f"That's a great question! Based on your current progress ({context['completion_percentage']}% ready for {context['target_role']}), I'd recommend focusing on your missing skills first. Can you be more specific about what you need help with?"
    
    def clear_history(self, email: str):
        """Clear conversation history for user"""
        if email in self.conversation_history:
            del self.conversation_history[email]
    
    def get_history(self, email: str) -> List[Dict]:
        """Get conversation history for user"""
        return self.conversation_history.get(email, [])


# Singleton
_ai_coach = None

def get_ai_coach() -> AICoachService:
    """Get or create AI Coach service"""
    global _ai_coach
    if _ai_coach is None:
        _ai_coach = AICoachService()
    return _ai_coach
