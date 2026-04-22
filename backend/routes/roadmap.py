from fastapi import APIRouter
from pydantic import BaseModel
from services.roadmap_service import generate_roadmap

router = APIRouter()

class RoadmapRequest(BaseModel):
    target_role: str

@router.post("/roadmap")
async def career_roadmap(request: RoadmapRequest):
    result = await generate_roadmap(request.target_role)
    return result
