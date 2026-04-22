from typing import List, Dict

# Predefined skill sets for different roles
ROLE_SKILLS = {
    "frontend developer": ["html", "css", "javascript", "react", "typescript", "tailwind", "webpack", "git"],
    "backend developer": ["python", "fastapi", "django", "sql", "mongodb", "rest api", "docker", "git"],
    "full stack developer": ["html", "css", "javascript", "react", "python", "fastapi", "sql", "mongodb", "docker", "git"],
    "data scientist": ["python", "pandas", "numpy", "scikit-learn", "tensorflow", "sql", "statistics", "machine learning"],
    "devops engineer": ["linux", "docker", "kubernetes", "ci/cd", "aws", "terraform", "ansible", "git"],
    "mobile developer": ["react native", "flutter", "swift", "kotlin", "rest api", "firebase", "git"],
}

def analyze_skill_gap(current_skills: List[str], target_role: str) -> Dict:
    # Normalize inputs
    current_skills_lower = [skill.strip().lower() for skill in current_skills]
    target_role_lower = target_role.strip().lower()
    
    # Get required skills for the role
    required_skills = ROLE_SKILLS.get(target_role_lower, [])
    
    if not required_skills:
        # Generic response for unknown roles
        return {
            "target_role": target_role,
            "current_skills": current_skills,
            "missing_skills": [],
            "recommended_skills": ["Communication", "Problem Solving", "Teamwork"],
            "message": f"Role '{target_role}' not found in our database. Please try: {', '.join(ROLE_SKILLS.keys())}"
        }
    
    # Find missing skills
    missing_skills = [skill for skill in required_skills if skill not in current_skills_lower]
    
    # Find matching skills
    matching_skills = [skill for skill in required_skills if skill in current_skills_lower]
    
    # Recommended skills (prioritize missing core skills)
    recommended_skills = missing_skills[:5] if missing_skills else ["Advanced topics in your field"]
    
    return {
        "target_role": target_role,
        "current_skills": current_skills,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "recommended_skills": recommended_skills,
        "completion_percentage": round((len(matching_skills) / len(required_skills)) * 100) if required_skills else 0
    }
