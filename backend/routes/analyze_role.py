from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from services.rag_service import get_rag_service
from services.enhanced_resume_service import get_user_skills
from utils.parser import extract_text_from_file
import io

router = APIRouter()

class AnalyzeRoleRequest(BaseModel):
    email: str
    role: str
    job_description: Optional[str] = None

@router.get("/analyze-role/health")
async def analyze_role_health():
    """Health check for analyze-role endpoint"""
    return {"status": "ok", "endpoint": "analyze-role", "rag_enabled": True}

@router.post("/analyze-role")
async def analyze_role(request: AnalyzeRoleRequest):
    """
    Enhanced RAG-powered analysis with job description support:
    1. Fetch user skills from DB/memory
    2. If job description provided, extract required skills from it
    3. Otherwise, retrieve relevant job data from vector DB
    4. Use Gemini AI for accurate, dynamic analysis
    5. Generate personalized roadmap with resources
    """
    try:
        print(f"[RAG] Analyzing role for email: {request.email}, role: {request.role}")
        
        # Get user skills from database or memory
        user_skills = await get_user_skills(request.email)
        print(f"[RAG] User skills: {user_skills}")
        
        if not user_skills:
            raise HTTPException(
                status_code=404,
                detail="No resume found for this email. Please upload your resume first."
            )
        
        # Get RAG service
        try:
            rag_service = get_rag_service()
            print(f"[RAG] RAG service initialized")
        except Exception as e:
            print(f"[ERROR] Failed to initialize RAG service: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"RAG initialization failed: {str(e)}")
        
        # Perform enhanced RAG-based analysis
        print(f"[RAG] Performing enhanced dynamic analysis...")
        try:
            if request.job_description:
                # Use custom job description (FULLY DYNAMIC)
                print(f"[RAG] Using custom job description")
                analysis_result = rag_service.analyze_with_job_description(
                    user_skills, 
                    request.role, 
                    request.job_description
                )
            else:
                # Use fully dynamic analysis (NO VECTOR DB DEPENDENCY)
                print(f"[RAG] Using dynamic AI analysis (no vector DB)")
                analysis_result = rag_service.analyze_role_dynamic(user_skills, request.role)
            
            print(f"[RAG] Analysis complete")
            
            # Validate result
            if not analysis_result or not analysis_result.get("required_skills"):
                raise ValueError("Analysis returned invalid result")
                
        except Exception as e:
            print(f"[ERROR] RAG analysis failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
        # Generate enhanced roadmap
        print(f"[RAG] Generating enhanced roadmap...")
        try:
            missing_skills = analysis_result.get("missing_skills", [])
            roadmap = rag_service.generate_enhanced_roadmap(
                user_skills, 
                missing_skills, 
                request.role,
                request.job_description
            )
            print(f"[RAG] Roadmap generated")
            
            if not roadmap or not any(roadmap.get(level) for level in ["beginner", "intermediate", "advanced"]):
                raise ValueError("Roadmap generation failed")
                
        except Exception as e:
            print(f"[ERROR] Roadmap generation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")
        
        # Prepare response
        response_data = {
            "email": request.email,
            "target_role": request.role,
            "skill_gap": {
                "user_skills": user_skills,
                "required_skills": analysis_result.get("required_skills", []),
                "matching_skills": analysis_result.get("matching_skills", []),
                "missing_skills": missing_skills,
                "completion_percentage": analysis_result.get("completion_percentage", 0),
                "role_level": analysis_result.get("role_level", "mid")
            },
            "roadmap": roadmap,
            "ai_insights": {
                "strengths": analysis_result.get("strengths", []),
                "focus_areas": analysis_result.get("focus_areas", []),
                "estimated_time": analysis_result.get("estimated_time", "3-6 months"),
                "recommendations": analysis_result.get("recommendations", [])
            },
            "rag_powered": True,
            "custom_jd": bool(request.job_description)
        }
        
        # Save to database for persistence
        try:
            from services.auth_service import save_skill_gap_analysis, save_roadmap_data
            from database.db import get_db
            db = next(get_db())
            save_skill_gap_analysis(db, request.email, response_data)
            save_roadmap_data(db, request.email, response_data)
            print("[RAG] Data saved to database")
        except Exception as e:
            print(f"[WARNING] Failed to save to database: {e}")
        
        return response_data
    
    except HTTPException as he:
        print(f"[ERROR] HTTPException: {he.detail}")
        raise
    except Exception as e:
        print(f"[ERROR] Exception in analyze_role: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/analyze-role-with-file")
async def analyze_role_with_file(
    email: str = Form(...),
    role: str = Form(...),
    job_description_file: UploadFile = File(...)
):
    """
    Analyze role with uploaded job description file (PDF, DOCX, TXT)
    """
    try:
        # Extract text from uploaded file
        file_content = await job_description_file.read()
        file_obj = io.BytesIO(file_content)
        
        job_description_text = extract_text_from_file(
            file_obj, 
            job_description_file.filename
        )
        
        if not job_description_text or len(job_description_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract meaningful text from the file"
            )
        
        # Use the regular analyze endpoint with extracted text
        request = AnalyzeRoleRequest(
            email=email,
            role=role,
            job_description=job_description_text
        )
        
        return await analyze_role(request)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] File upload failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
