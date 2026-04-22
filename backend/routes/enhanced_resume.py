from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from services.enhanced_resume_service import analyze_and_store_resume
from services.auth_service import save_resume_analysis
from database.db import get_db

router = APIRouter()

@router.post("/resume-upload")
async def upload_resume(
    file: UploadFile = File(...),
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    """Upload resume, extract skills using AI, and store in database"""
    try:
        result = await analyze_and_store_resume(file, email)
        
        # Save to database for persistence
        save_resume_analysis(db, email, result)
        
        return result
    except Exception as e:
        print(f"Error in resume upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

