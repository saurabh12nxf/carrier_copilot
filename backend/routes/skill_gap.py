from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.skill_service import analyze_skill_gap

router = APIRouter()

class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_role: str

@router.post("/skill-gap")
async def skill_gap_analysis(request: SkillGapRequest):
    result = analyze_skill_gap(request.current_skills, request.target_role)
    return result
