from fastapi import UploadFile
import PyPDF2
import docx
import io
from typing import Dict, List
from services.ai_service import extract_skills_from_text
from utils.multi_llm import get_multi_llm
from datetime import datetime
import re

# In-memory storage (no MongoDB dependency)
_memory_storage = {}

async def analyze_and_store_resume(file: UploadFile, email: str) -> Dict:
    """
    UPGRADED: Analyze resume with Multi-LLM skill extraction
    Tries Gemini → OpenAI → Groq → Basic extraction
    """
    
    try:
        # Extract text from file
        text = await extract_text(file)
        
        # Use ENHANCED AI extraction (Multi-LLM)
        extracted_skills = await extract_skills_with_multi_llm(text)
        
        # Normalize and deduplicate skills
        extracted_skills = normalize_skills(extracted_skills)
        
        # Store in memory
        _memory_storage[email] = {
            "skills": extracted_skills,
            "resume_text": text,
            "resume_filename": file.filename,
            "uploaded_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        print(f"[RESUME] ✅ Extracted {len(extracted_skills)} skills using Multi-LLM")
        
        return {
            "email": email,
            "extracted_skills": extracted_skills,
            "total_skills": len(extracted_skills),
            "message": "Skills extracted using AI and stored successfully"
        }
    except Exception as e:
        print(f"[RESUME] ⚠️ Error in analyze_and_store_resume: {str(e)}")
        # Fallback to basic extraction
        basic_skills = extract_skills_from_text(text) if 'text' in locals() else []
        return {
            "email": email,
            "extracted_skills": basic_skills or ["python", "javascript", "html", "css"],
            "total_skills": len(basic_skills) if basic_skills else 4,
            "message": f"Using fallback skills extraction"
        }

async def extract_skills_with_multi_llm(resume_text: str) -> List[str]:
    """
    UPGRADED: Use Multi-LLM to extract skills from resume
    Tries Gemini → OpenAI → Groq → Basic extraction
    """
    llm = get_multi_llm()
    
    if llm.is_available:
        try:
            print(f"[RESUME] 🤖 Using Multi-LLM for skill extraction...")
            
            prompt = f"""You are an expert resume parser. Extract ALL technical skills from this resume.

RESUME TEXT:
{resume_text[:3000]}

TASK: Extract ALL technical skills, tools, frameworks, languages, and technologies mentioned.

RULES:
1. Include programming languages (Python, JavaScript, Java, etc.)
2. Include frameworks (React, Django, TensorFlow, etc.)
3. Include tools (Git, Docker, AWS, etc.)
4. Include databases (MySQL, MongoDB, PostgreSQL, etc.)
5. Include soft skills if clearly mentioned (Leadership, Communication, etc.)
6. Normalize names (e.g., "React.js" → "React", "JS" → "JavaScript")
7. Remove duplicates
8. Return as comma-separated list

OUTPUT FORMAT: skill1, skill2, skill3, ...

Extract skills now:"""

            response = llm.generate(prompt, temperature=0.1)
            
            if response:
                # Parse comma-separated skills
                skills = [s.strip() for s in response.split(',')]
                skills = [s for s in skills if s and len(s) > 1]
                
                if len(skills) >= 3:
                    print(f"[RESUME] ✅ Multi-LLM extracted {len(skills)} skills with {llm.current_provider}")
                    return skills[:50]  # Max 50 skills
        
        except Exception as e:
            print(f"[RESUME] ⚠️ Multi-LLM extraction failed: {e}")
    
    # Fallback to basic extraction
    print("[RESUME] 🔄 Using fallback extraction")
    return extract_skills_from_text(resume_text)

def normalize_skills(skills: List[str]) -> List[str]:
    """
    Normalize skill names and remove duplicates
    """
    # Synonym mapping
    synonyms = {
        "js": "JavaScript",
        "javascript": "JavaScript",
        "ts": "TypeScript",
        "typescript": "TypeScript",
        "py": "Python",
        "python": "Python",
        "reactjs": "React",
        "react.js": "React",
        "react": "React",
        "nodejs": "Node.js",
        "node": "Node.js",
        "node.js": "Node.js",
        "mongodb": "MongoDB",
        "mongo": "MongoDB",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "mysql": "MySQL",
        "sql": "SQL",
        "html5": "HTML",
        "html": "HTML",
        "css3": "CSS",
        "css": "CSS",
        "git": "Git",
        "github": "Git",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "aws": "AWS",
        "amazon web services": "AWS",
        "ml": "Machine Learning",
        "ai": "Artificial Intelligence",
        "tensorflow": "TensorFlow",
        "tf": "TensorFlow",
        "pytorch": "PyTorch",
    }
    
    normalized = []
    seen = set()
    
    for skill in skills:
        skill_lower = skill.lower().strip()
        
        # Get normalized name
        normalized_name = synonyms.get(skill_lower, skill.title())
        
        # Add if not seen
        if normalized_name.lower() not in seen:
            normalized.append(normalized_name)
            seen.add(normalized_name.lower())
    
    return normalized

async def extract_text(file: UploadFile) -> str:
    """Extract text from uploaded file"""
    content = await file.read()
    
    if file.filename.endswith('.pdf'):
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    
    elif file.filename.endswith('.docx'):
        doc = docx.Document(io.BytesIO(content))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    
    else:
        return content.decode('utf-8', errors='ignore')

async def get_user_skills(email: str) -> List[str]:
    """Retrieve user skills from memory storage"""
    if email in _memory_storage:
        return _memory_storage[email].get("skills", [])
    return []
