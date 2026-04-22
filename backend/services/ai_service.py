import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client only if API key is available
api_key = os.getenv("OPENAI_API_KEY")
try:
    client = OpenAI(api_key=api_key) if api_key else None
except Exception as e:
    print(f"Failed to initialize OpenAI client: {e}")
    client = None

def extract_skills_from_text(resume_text: str) -> list:
    """Extract skills from resume text using OpenAI"""
    if not client:
        print("OpenAI API key not found, using fallback")
        return extract_skills_fallback(resume_text)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a skilled resume analyzer. Extract all technical skills, tools, frameworks, and technologies from the resume. Return ONLY a JSON array of skills, nothing else."},
                {"role": "user", "content": f"Extract all skills from this resume:\n\n{resume_text}\n\nReturn format: [\"skill1\", \"skill2\", ...]"}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        skills_text = response.choices[0].message.content.strip()
        # Parse JSON response
        skills = json.loads(skills_text)
        return skills if isinstance(skills, list) else []
    except Exception as e:
        print(f"OpenAI Error: {e}")
        # Fallback to basic extraction
        return extract_skills_fallback(resume_text)

def extract_skills_fallback(text: str) -> list:
    """Fallback skill extraction without AI"""
    common_skills = [
        "python", "javascript", "java", "react", "angular", "vue", "node.js",
        "fastapi", "django", "flask", "sql", "mongodb", "postgresql",
        "docker", "kubernetes", "aws", "azure", "git", "ci/cd",
        "html", "css", "typescript", "rest api", "graphql",
        "machine learning", "data analysis", "agile", "scrum"
    ]
    
    text_lower = text.lower()
    found_skills = [skill for skill in common_skills if skill in text_lower]
    return found_skills

def get_role_requirements(role: str) -> dict:
    """Get required skills for a role using OpenAI"""
    if not client:
        print("OpenAI API key not found, using fallback")
        return get_role_requirements_fallback(role)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a career advisor. Provide required skills for job roles in JSON format."},
                {"role": "user", "content": f"What are the essential skills and tools required for a {role}? Return as JSON: {{\"skills\": [\"skill1\", \"skill2\"], \"tools\": [\"tool1\", \"tool2\"], \"level\": \"junior/mid/senior\"}}"}
            ],
            temperature=0.5,
            max_tokens=500
        )
        
        requirements_text = response.choices[0].message.content.strip()
        requirements = json.loads(requirements_text)
        return requirements
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return get_role_requirements_fallback(role)

def get_role_requirements_fallback(role: str) -> dict:
    """Fallback role requirements without AI"""
    role_lower = role.lower()
    
    role_map = {
        "frontend developer": {
            "skills": ["html", "css", "javascript", "react", "typescript", "responsive design"],
            "tools": ["git", "webpack", "vite", "figma"],
            "level": "mid"
        },
        "backend developer": {
            "skills": ["python", "fastapi", "sql", "rest api", "authentication", "database design"],
            "tools": ["git", "docker", "postgresql", "redis"],
            "level": "mid"
        },
        "data scientist": {
            "skills": ["python", "machine learning", "statistics", "data analysis", "pandas", "numpy"],
            "tools": ["jupyter", "tensorflow", "scikit-learn", "sql"],
            "level": "mid"
        }
    }
    
    for key, value in role_map.items():
        if key in role_lower:
            return value
    
    return {
        "skills": ["problem solving", "communication", "teamwork"],
        "tools": ["git"],
        "level": "entry"
    }

def generate_personalized_roadmap(user_skills: list, missing_skills: list, role: str) -> dict:
    """Generate personalized learning roadmap using OpenAI"""
    if not client:
        print("OpenAI API key not found, using fallback")
        return generate_roadmap_fallback(missing_skills, role)
    
    try:
        user_skills_str = ", ".join(user_skills) if user_skills else "none"
        missing_skills_str = ", ".join(missing_skills) if missing_skills else "none"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI career mentor. Create personalized learning roadmaps that skip known skills and focus on gaps."},
                {"role": "user", "content": f"""Create a learning roadmap for someone who wants to become a {role}.

Current skills: {user_skills_str}
Missing skills: {missing_skills_str}

IMPORTANT: 
- Skip topics they already know
- Focus ONLY on missing skills
- Provide 3 levels: beginner, intermediate, advanced
- Each level should have 2-4 topics
- Include duration estimates

Return as JSON:
{{
  "beginner": [
    {{"title": "Topic", "duration": "2 weeks", "description": "What to learn", "why": "Why it matters"}}
  ],
  "intermediate": [...],
  "advanced": [...]
}}"""}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        roadmap_text = response.choices[0].message.content.strip()
        # Extract JSON from response
        if "```json" in roadmap_text:
            roadmap_text = roadmap_text.split("```json")[1].split("```")[0].strip()
        elif "```" in roadmap_text:
            roadmap_text = roadmap_text.split("```")[1].split("```")[0].strip()
        
        roadmap = json.loads(roadmap_text)
        return roadmap
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return generate_roadmap_fallback(missing_skills, role)

def generate_roadmap_fallback(missing_skills: list, role: str) -> dict:
    """Fallback roadmap generation without AI"""
    return {
        "beginner": [
            {
                "title": f"Fundamentals of {missing_skills[0] if missing_skills else 'the role'}",
                "duration": "2 weeks",
                "description": "Learn the basics and core concepts",
                "why": "Foundation for advanced topics"
            }
        ],
        "intermediate": [
            {
                "title": "Practical Projects",
                "duration": "4 weeks",
                "description": "Build real-world projects",
                "why": "Hands-on experience"
            }
        ],
        "advanced": [
            {
                "title": "Advanced Concepts",
                "duration": "4 weeks",
                "description": "Master advanced techniques",
                "why": "Professional-level expertise"
            }
        ]
    }
