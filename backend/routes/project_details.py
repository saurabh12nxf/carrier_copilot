from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from services.project_builder import get_project_builder
from typing import List

router = APIRouter()

class ProjectRequest(BaseModel):
    project_title: str
    target_role: str
    skills_to_practice: List[str]
    difficulty: str = "intermediate"

@router.post("/project-details")
async def get_project_details(request: ProjectRequest):
    """
    Generate detailed project specification with AI
    """
    try:
        project_builder = get_project_builder()
        
        project_details = project_builder.generate_project_details(
            project_title=request.project_title,
            target_role=request.target_role,
            skills_to_practice=request.skills_to_practice,
            difficulty=request.difficulty
        )
        
        return project_details
        
    except Exception as e:
        print(f"[PROJECT] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate project details: {str(e)}")
