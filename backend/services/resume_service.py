from fastapi import UploadFile
import PyPDF2
import docx
import io
from typing import Dict, List
import re

async def analyze_resume(file: UploadFile) -> Dict:
    # Extract text from file
    text = await extract_text(file)
    
    # Analyze the text
    skills = extract_skills(text)
    keywords = extract_keywords(text)
    suggestions = generate_suggestions(text, skills)
    
    return {
        "filename": file.filename,
        "extracted_skills": skills,
        "missing_keywords": keywords,
        "suggestions": suggestions,
        "ats_score": calculate_ats_score(text, skills)
    }

async def extract_text(file: UploadFile) -> str:
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

def extract_skills(text: str) -> List[str]:
    # Common technical skills to look for
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

def extract_keywords(text: str) -> List[str]:
    # Important keywords often missing from resumes
    important_keywords = [
        "leadership", "team collaboration", "problem solving",
        "project management", "communication", "analytical",
        "innovative", "results-driven", "cross-functional"
    ]
    
    text_lower = text.lower()
    missing = [kw for kw in important_keywords if kw not in text_lower]
    
    return missing[:5]  # Return top 5 missing

def generate_suggestions(text: str, skills: List[str]) -> List[str]:
    suggestions = []
    
    if len(skills) < 5:
        suggestions.append("Add more technical skills relevant to your target role")
    
    if "project" not in text.lower():
        suggestions.append("Include specific projects with measurable outcomes")
    
    if not re.search(r'\d+%|\d+ years?', text):
        suggestions.append("Quantify your achievements with numbers and percentages")
    
    if len(text) < 500:
        suggestions.append("Expand your resume with more detailed descriptions")
    
    if "achievement" not in text.lower() and "accomplished" not in text.lower():
        suggestions.append("Highlight key achievements and accomplishments")
    
    return suggestions[:5]

def calculate_ats_score(text: str, skills: List[str]) -> int:
    score = 0
    
    # Skills count (max 40 points)
    score += min(len(skills) * 5, 40)
    
    # Has contact info (10 points)
    if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
        score += 10
    
    # Has quantifiable achievements (20 points)
    if re.search(r'\d+%|\d+ years?|\$\d+', text):
        score += 20
    
    # Proper length (10 points)
    if 500 <= len(text) <= 3000:
        score += 10
    
    # Has action verbs (20 points)
    action_verbs = ["developed", "managed", "led", "created", "implemented", "designed"]
    if any(verb in text.lower() for verb in action_verbs):
        score += 20
    
    return min(score, 100)
