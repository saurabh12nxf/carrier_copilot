from fastapi import APIRouter, UploadFile, File
from services.resume_service import analyze_resume

router = APIRouter()

@router.post("/resume-analyze")
async def resume_analysis(file: UploadFile = File(...)):
    result = await analyze_resume(file)
    return result
