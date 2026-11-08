"""
AI Career Coach API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from database.db import get_db
from services.ai_coach_service import get_ai_coach

router = APIRouter()

class ChatRequest(BaseModel):
    email: str
    message: str

class ClearHistoryRequest(BaseModel):
    email: str

class StartInterviewRequest(BaseModel):
    email: Optional[str] = None
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Mid-Level"
    interview_type: Optional[str] = "Comprehensive (Mixed)"
    count: Optional[int] = 4

class EvaluateAnswerRequest(BaseModel):
    email: Optional[str] = None
    target_role: str
    experience_level: Optional[str] = "Mid-Level"
    question: str
    question_type: Optional[str] = "technical"
    user_answer: str

class SummarizeSessionRequest(BaseModel):
    email: Optional[str] = None
    target_role: str
    evaluations: List[Dict[str, Any]]

@router.post("/chat")
async def chat_with_coach(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat with AI Career Coach
    Context-aware responses based on user's skills, roadmap, and progress
    """
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        coach = get_ai_coach()
        response = coach.chat(db, request.email, request.message)
        
        return response
    
    except Exception as e:
        print(f"[AI COACH] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.get("/history/{email}")
async def get_chat_history(email: str):
    """Get conversation history for user"""
    try:
        coach = get_ai_coach()
        history = coach.get_history(email)
        
        return {
            "email": email,
            "history": history,
            "message_count": len(history)
        }
    
    except Exception as e:
        print(f"[AI COACH] Error getting history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.post("/clear-history")
async def clear_chat_history(request: ClearHistoryRequest):
    """Clear conversation history for user"""
    try:
        coach = get_ai_coach()
        coach.clear_history(request.email)
        
        return {
            "message": "Chat history cleared successfully",
            "email": request.email
        }
    
    except Exception as e:
        print(f"[AI COACH] Error clearing history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")

@router.post("/interview/start")
async def start_mock_interview(request: StartInterviewRequest):
    """
    Generate tailored mock interview questions based on role, level, and focus area.
    """
    try:
        coach = get_ai_coach()
        questions = coach.generate_interview_questions(
            target_role=request.target_role or "Full Stack Developer",
            experience_level=request.experience_level or "Mid-Level",
            interview_type=request.interview_type or "Comprehensive (Mixed)",
            count=request.count or 4
        )
        return {
            "success": True,
            "target_role": request.target_role,
            "experience_level": request.experience_level,
            "interview_type": request.interview_type,
            "questions": questions,
            "total_questions": len(questions)
        }
    except Exception as e:
        print(f"[AI COACH] Error generating interview questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate interview: {str(e)}")

@router.post("/interview/evaluate")
async def evaluate_interview_answer(request: EvaluateAnswerRequest):
    """
    Evaluate candidate's answer with detailed grading, rubric analysis, strengths, and ideal answer.
    """
    try:
        coach = get_ai_coach()
        evaluation = coach.evaluate_interview_answer(
            target_role=request.target_role,
            experience_level=request.experience_level or "Mid-Level",
            question=request.question,
            question_type=request.question_type or "technical",
            user_answer=request.user_answer
        )
        return {
            "success": True,
            "evaluation": evaluation
        }
    except Exception as e:
        print(f"[AI COACH] Error evaluating interview answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")

@router.post("/interview/summary")
async def summarize_interview_session(request: SummarizeSessionRequest):
    """
    Generate final interview session scorecard, hiring recommendation, and prep areas.
    """
    try:
        coach = get_ai_coach()
        summary = coach.summarize_interview_session(
            target_role=request.target_role,
            evaluations=request.evaluations
        )
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        print(f"[AI COACH] Error summarizing session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to summarize session: {str(e)}")
