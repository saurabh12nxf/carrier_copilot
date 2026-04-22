"""
JSON parser utilities for safe parsing and validation
"""
import json
import re
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

def safe_parse_json(text: str) -> Optional[Dict]:
    """
    Safely parse JSON from text with multiple fallback strategies
    
    Args:
        text: Text that may contain JSON
    
    Returns:
        Parsed dict or None
    """
    if not text or not text.strip():
        return None
    
    # Strategy 1: Direct parsing
    try:
        return json.loads(text.strip())
    except:
        pass
    
    # Strategy 2: Extract from markdown code blocks
    patterns = [
        r'```json\s*(\{.*?\})\s*```',
        r'```\s*(\{.*?\})\s*```',
        r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except:
                continue
    
    # Strategy 3: Find largest JSON-like structure
    try:
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            json_str = text[start:end+1]
            return json.loads(json_str)
    except:
        pass
    
    logger.warning("All JSON parsing strategies failed")
    return None

def validate_skill_gap_response(data: Dict) -> bool:
    """Validate skill gap analysis response structure"""
    required_keys = ["required_skills", "missing_skills", "matching_skills"]
    return all(key in data for key in required_keys)

def validate_roadmap_response(data: Dict) -> bool:
    """Validate roadmap response structure"""
    required_keys = ["beginner", "intermediate", "advanced"]
    if not all(key in data for key in required_keys):
        return False
    
    # Check each level has proper structure
    for level in required_keys:
        if not isinstance(data[level], list):
            return False
        for item in data[level]:
            if not all(k in item for k in ["title", "duration", "description"]):
                return False
    
    return True

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skill keywords from text
    Fallback method when LLM is unavailable
    """
    common_skills = [
        # Programming Languages
        "python", "javascript", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift",
        "kotlin", "typescript", "scala", "r", "matlab",
        
        # Web Technologies
        "html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask",
        "fastapi", "spring", "asp.net", "jquery", "bootstrap", "tailwind",
        
        # Databases
        "sql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra",
        "dynamodb", "oracle", "sqlite",
        
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "gitlab", "github actions",
        "terraform", "ansible", "ci/cd", "linux", "bash",
        
        # Data Science & ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "pandas", "numpy", "data analysis", "statistics", "nlp", "computer vision",
        
        # Tools & Others
        "git", "rest api", "graphql", "microservices", "agile", "scrum", "jira",
        "figma", "photoshop", "testing", "unit testing", "integration testing"
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))  # Remove duplicates

def format_roadmap_for_display(roadmap: Dict) -> Dict:
    """Format roadmap data for frontend display"""
    formatted = {
        "beginner": [],
        "intermediate": [],
        "advanced": []
    }
    
    for level in ["beginner", "intermediate", "advanced"]:
        if level in roadmap and isinstance(roadmap[level], list):
            formatted[level] = roadmap[level]
    
    return formatted

def merge_skill_lists(list1: List[str], list2: List[str]) -> List[str]:
    """Merge and deduplicate skill lists"""
    combined = list(set([s.lower().strip() for s in list1 + list2]))
    return sorted(combined)

# Alias for compatibility
parse_json_response = safe_parse_json


def extract_text_from_file(file_obj, filename: str) -> str:
    """
    Extract text from uploaded file (PDF, DOCX, TXT)
    
    Args:
        file_obj: File object (BytesIO or similar)
        filename: Name of the file
    
    Returns:
        Extracted text content
    """
    import io
    from PyPDF2 import PdfReader
    from docx import Document
    
    file_extension = filename.lower().split('.')[-1]
    
    try:
        if file_extension == 'pdf':
            # Extract from PDF
            pdf_reader = PdfReader(file_obj)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        
        elif file_extension == 'docx':
            # Extract from DOCX
            doc = Document(file_obj)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        
        elif file_extension == 'txt':
            # Extract from TXT
            if isinstance(file_obj, io.BytesIO):
                text = file_obj.read().decode('utf-8', errors='ignore')
            else:
                text = file_obj.read()
                if isinstance(text, bytes):
                    text = text.decode('utf-8', errors='ignore')
            return text.strip()
        
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    
    except Exception as e:
        logger.error(f"Error extracting text from {filename}: {str(e)}")
        raise ValueError(f"Failed to extract text from file: {str(e)}")
