"""
Fallback Analyzer - Works WITHOUT any API calls
Uses rule-based logic for skill gap analysis when LLM is unavailable
"""
from typing import Dict, List
import re

class FallbackAnalyzer:
    """Rule-based analyzer that works without LLM"""
    
    # Comprehensive skill database for different roles (2024-2026 Industry Standards)
    ROLE_SKILLS = {
        "frontend": {
            "required": ["html", "css", "javascript", "react", "typescript", "responsive design", "git", "webpack", "rest api", "ui/ux"],
            "advanced": ["next.js", "redux", "graphql", "testing", "performance optimization", "accessibility", "seo"],
            "tools": ["vscode", "chrome devtools", "figma", "npm", "yarn"]
        },
        "backend": {
            "required": ["python", "node.js", "sql", "rest api", "authentication", "git", "database design", "api design"],
            "advanced": ["microservices", "docker", "kubernetes", "redis", "message queues", "graphql", "testing"],
            "tools": ["postman", "docker", "git", "database tools"]
        },
        "fullstack": {
            "required": ["html", "css", "javascript", "react", "node.js", "sql", "rest api", "git", "authentication"],
            "advanced": ["typescript", "docker", "ci/cd", "testing", "cloud platforms", "microservices"],
            "tools": ["vscode", "git", "docker", "postman"]
        },
        "data science": {
            "required": ["python", "pandas", "numpy", "sql", "statistics", "machine learning", "data visualization", "jupyter"],
            "advanced": ["deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "big data", "spark"],
            "tools": ["jupyter", "git", "tableau", "power bi"]
        },
        "machine learning": {
            "required": ["python", "machine learning", "statistics", "pandas", "numpy", "scikit-learn", "data preprocessing"],
            "advanced": ["deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "model deployment", "mlops"],
            "tools": ["jupyter", "git", "docker", "cloud platforms"]
        },
        "ai engineer": {
            "required": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "mathematics", "statistics", "neural networks", "transformers", "llm", "prompt engineering"],
            "advanced": ["langchain", "vector databases", "rag", "fine-tuning", "model optimization", "mlops", "hugging face", "openai api", "stable diffusion", "reinforcement learning"],
            "tools": ["jupyter", "git", "docker", "cuda", "wandb", "mlflow", "aws sagemaker"]
        },
        "ai ml engineer": {
            "required": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "mathematics", "statistics", "neural networks", "transformers", "llm"],
            "advanced": ["langchain", "vector databases", "rag", "fine-tuning", "model optimization", "mlops", "hugging face", "openai api"],
            "tools": ["jupyter", "git", "docker", "cuda", "wandb", "mlflow"]
        },
        "devops": {
            "required": ["linux", "docker", "kubernetes", "ci/cd", "git", "scripting", "cloud platforms", "monitoring"],
            "advanced": ["terraform", "ansible", "jenkins", "prometheus", "grafana", "security", "networking"],
            "tools": ["docker", "kubernetes", "jenkins", "terraform", "aws/azure/gcp"]
        },
        "mobile": {
            "required": ["react native", "javascript", "mobile ui", "rest api", "git", "app deployment"],
            "advanced": ["native development", "performance optimization", "offline storage", "push notifications"],
            "tools": ["xcode", "android studio", "react native", "expo"]
        },
        "data analyst": {
            "required": ["sql", "excel", "python", "data visualization", "statistics", "pandas", "tableau", "power bi"],
            "advanced": ["machine learning", "r", "advanced analytics", "business intelligence", "data modeling"],
            "tools": ["tableau", "power bi", "excel", "sql workbench", "jupyter"]
        },
        "cloud engineer": {
            "required": ["aws", "azure", "gcp", "linux", "networking", "docker", "kubernetes", "terraform", "ci/cd"],
            "advanced": ["serverless", "cloud security", "cost optimization", "multi-cloud", "infrastructure as code"],
            "tools": ["terraform", "ansible", "cloudformation", "aws cli", "azure cli"]
        },
        "blockchain developer": {
            "required": ["solidity", "ethereum", "smart contracts", "web3", "javascript", "cryptography", "git"],
            "advanced": ["defi", "nft", "layer 2", "consensus algorithms", "security auditing", "rust"],
            "tools": ["hardhat", "truffle", "metamask", "remix", "ganache"]
        },
        "default": {
            "required": ["programming", "problem solving", "git", "algorithms", "data structures", "debugging"],
            "advanced": ["system design", "testing", "documentation", "code review", "best practices"],
            "tools": ["git", "ide", "debugging tools"]
        }
    }
    
    def __init__(self):
        """Initialize fallback analyzer"""
        pass
    
    def analyze_role(self, user_skills: List[str], target_role: str) -> Dict:
        """
        Analyze skill gap using rule-based logic
        
        Args:
            user_skills: List of user's current skills
            target_role: Target role name
        
        Returns:
            Analysis dict with required/matching/missing skills
        """
        # Normalize inputs
        user_skills_normalized = [self._normalize_skill(s) for s in user_skills]
        role_normalized = self._normalize_skill(target_role)
        
        # Get role requirements
        role_data = self._get_role_requirements(role_normalized)
        required_skills = role_data["required"] + role_data["advanced"][:3]  # Include some advanced
        
        # Match skills
        matching_skills = []
        for req_skill in required_skills:
            if self._skill_matches(req_skill, user_skills_normalized):
                matching_skills.append(req_skill)
        
        # Calculate missing skills
        missing_skills = [s for s in required_skills if s not in matching_skills]
        
        # Calculate completion percentage
        completion = int((len(matching_skills) / len(required_skills)) * 100) if required_skills else 0
        
        # Determine role level
        role_level = self._determine_level(completion, len(user_skills))
        
        # Generate strengths
        strengths = self._generate_strengths(matching_skills, user_skills_normalized)
        
        # Generate focus areas
        focus_areas = self._generate_focus_areas(missing_skills, role_data)
        
        # Estimate time
        estimated_time = self._estimate_time(len(missing_skills), completion)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(missing_skills, completion, role_normalized)
        
        return {
            "required_skills": required_skills,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "completion_percentage": completion,
            "role_level": role_level,
            "strengths": strengths,
            "focus_areas": focus_areas,
            "estimated_time": estimated_time,
            "recommendations": recommendations
        }
    
    def analyze_with_job_description(self, user_skills: List[str], target_role: str, job_description: str) -> Dict:
        """
        Analyze using job description
        
        Args:
            user_skills: User's skills
            target_role: Target role
            job_description: Job description text
        
        Returns:
            Analysis dict
        """
        # Extract skills from JD
        jd_skills = self._extract_skills_from_jd(job_description)
        
        # Normalize
        user_skills_normalized = [self._normalize_skill(s) for s in user_skills]
        
        # Match skills
        matching_skills = []
        for jd_skill in jd_skills:
            if self._skill_matches(jd_skill, user_skills_normalized):
                matching_skills.append(jd_skill)
        
        # Missing skills
        missing_skills = [s for s in jd_skills if s not in matching_skills]
        
        # Calculate completion
        completion = int((len(matching_skills) / len(jd_skills)) * 100) if jd_skills else 0
        
        # Role level
        role_level = self._determine_level(completion, len(user_skills))
        
        # Strengths
        strengths = self._generate_strengths(matching_skills, user_skills_normalized)
        
        # Focus areas
        focus_areas = missing_skills[:3] if len(missing_skills) >= 3 else missing_skills
        
        # Time estimate
        estimated_time = self._estimate_time(len(missing_skills), completion)
        
        # Recommendations
        recommendations = self._generate_recommendations(missing_skills, completion, target_role)
        
        return {
            "required_skills": jd_skills,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "completion_percentage": completion,
            "role_level": role_level,
            "strengths": strengths,
            "focus_areas": focus_areas,
            "estimated_time": estimated_time,
            "recommendations": recommendations
        }
    
    def generate_roadmap(self, user_skills: List[str], missing_skills: List[str], target_role: str) -> Dict:
        """
        Generate learning roadmap
        
        Args:
            user_skills: Current skills
            missing_skills: Skills to learn
            target_role: Target role
        
        Returns:
            Roadmap dict with beginner/intermediate/advanced levels
        """
        role_normalized = self._normalize_skill(target_role)
        role_data = self._get_role_requirements(role_normalized)
        
        # Categorize missing skills
        beginner_skills = []
        intermediate_skills = []
        advanced_skills = []
        
        for skill in missing_skills:
            if skill in role_data["required"][:4]:  # First 4 are fundamental
                beginner_skills.append(skill)
            elif skill in role_data["required"]:
                intermediate_skills.append(skill)
            else:
                advanced_skills.append(skill)
        
        # Build roadmap
        roadmap = {
            "beginner": self._create_learning_items(beginner_skills, "beginner", role_normalized),
            "intermediate": self._create_learning_items(intermediate_skills, "intermediate", role_normalized),
            "advanced": self._create_learning_items(advanced_skills, "advanced", role_normalized)
        }
        
        return roadmap
    
    def _normalize_skill(self, skill: str) -> str:
        """Normalize skill name"""
        return skill.lower().strip().replace(".", "").replace("-", " ")
    
    def _skill_matches(self, required_skill: str, user_skills: List[str]) -> bool:
        """Check if required skill matches any user skill"""
        req_normalized = self._normalize_skill(required_skill)
        
        # Direct match
        if req_normalized in user_skills:
            return True
        
        # Synonym matching
        synonyms = {
            "javascript": ["js", "ecmascript", "es6"],
            "typescript": ["ts"],
            "python": ["py"],
            "react": ["reactjs", "react js"],
            "node": ["nodejs", "node js"],
            "sql": ["mysql", "postgresql", "database"],
            "rest api": ["api", "restful", "rest"],
            "machine learning": ["ml", "ai"],
            "deep learning": ["dl", "neural networks"],
            "docker": ["containerization", "containers"],
            "kubernetes": ["k8s"],
            "ci/cd": ["cicd", "continuous integration", "continuous deployment"]
        }
        
        # Check synonyms
        for user_skill in user_skills:
            if user_skill in synonyms.get(req_normalized, []):
                return True
            if req_normalized in synonyms.get(user_skill, []):
                return True
        
        # Partial match
        for user_skill in user_skills:
            if req_normalized in user_skill or user_skill in req_normalized:
                return True
        
        return False
    
    def _get_role_requirements(self, role: str) -> Dict:
        """Get requirements for role"""
        # Check for exact match
        if role in self.ROLE_SKILLS:
            return self.ROLE_SKILLS[role]
        
        # Check for partial match
        for key in self.ROLE_SKILLS:
            if key in role or role in key:
                return self.ROLE_SKILLS[key]
        
        # Default
        return self.ROLE_SKILLS["default"]
    
    def _determine_level(self, completion: int, skill_count: int) -> str:
        """Determine experience level"""
        if completion >= 80 and skill_count >= 10:
            return "senior"
        elif completion >= 60 or skill_count >= 6:
            return "mid"
        else:
            return "entry"
    
    def _generate_strengths(self, matching_skills: List[str], all_skills: List[str]) -> List[str]:
        """Generate top 3 strengths"""
        strengths = []
        
        if len(matching_skills) >= 5:
            strengths.append(f"Strong foundation with {len(matching_skills)} relevant skills")
        elif len(matching_skills) >= 3:
            strengths.append(f"Good base with {len(matching_skills)} key skills")
        else:
            strengths.append("Motivated to learn and grow")
        
        # Check for specific skill categories
        if any("react" in s or "vue" in s or "angular" in s for s in all_skills):
            strengths.append("Modern frontend framework experience")
        elif any("python" in s or "java" in s or "node" in s for s in all_skills):
            strengths.append("Solid programming fundamentals")
        
        if any("git" in s for s in all_skills):
            strengths.append("Version control proficiency")
        elif any("api" in s or "rest" in s for s in all_skills):
            strengths.append("API development experience")
        else:
            strengths.append("Quick learner with growth mindset")
        
        return strengths[:3]
    
    def _generate_focus_areas(self, missing_skills: List[str], role_data: Dict) -> List[str]:
        """Generate top 3 focus areas"""
        if not missing_skills:
            return ["Advanced concepts", "System design", "Best practices"]
        
        # Prioritize fundamental skills
        focus = []
        for skill in missing_skills[:3]:
            focus.append(skill.title())
        
        return focus
    
    def _estimate_time(self, missing_count: int, completion: int) -> str:
        """Estimate learning time"""
        if completion >= 80:
            return "1-2 months"
        elif completion >= 60:
            return "2-4 months"
        elif completion >= 40:
            return "4-6 months"
        elif completion >= 20:
            return "6-9 months"
        else:
            return "9-12 months"
    
    def _generate_recommendations(self, missing_skills: List[str], completion: int, role: str) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if completion < 50:
            recommendations.append(f"Focus on fundamentals: Start with {missing_skills[0] if missing_skills else 'core concepts'}")
        else:
            recommendations.append("Build projects to apply your existing skills")
        
        if missing_skills:
            recommendations.append(f"Learn {missing_skills[0]} through online courses and practice")
        else:
            recommendations.append("Contribute to open source projects")
        
        recommendations.append(f"Network with {role} professionals and join communities")
        
        return recommendations
    
    def _extract_skills_from_jd(self, jd_text: str) -> List[str]:
        """Extract skills from job description"""
        jd_lower = jd_text.lower()
        
        # Common tech skills to look for
        all_skills = set()
        for role_data in self.ROLE_SKILLS.values():
            all_skills.update(role_data["required"])
            all_skills.update(role_data["advanced"])
            all_skills.update(role_data["tools"])
        
        # Find skills mentioned in JD
        found_skills = []
        for skill in all_skills:
            if skill in jd_lower:
                found_skills.append(skill)
        
        # If too few, add common ones
        if len(found_skills) < 5:
            found_skills.extend(["problem solving", "communication", "teamwork", "git", "debugging"])
        
        return list(set(found_skills))[:15]  # Max 15 skills
    
    def _create_learning_items(self, skills: List[str], level: str, role: str) -> List[Dict]:
        """Create learning items for roadmap"""
        if not skills:
            return []
        
        items = []
        duration_map = {"beginner": "2-3 weeks", "intermediate": "3-4 weeks", "advanced": "4-6 weeks"}
        
        for skill in skills[:4]:  # Max 4 items per level
            items.append({
                "title": skill.title(),
                "duration": duration_map.get(level, "3-4 weeks"),
                "description": f"Master {skill} for {role} development",
                "why": f"Essential skill for {role} professionals",
                "resources": [
                    f"{skill.title()} official documentation",
                    f"Online courses on {skill}"
                ],
                "projects": [
                    f"Build a project using {skill}",
                    f"Contribute to {skill} open source"
                ]
            })
        
        return items


# Singleton
_fallback_analyzer = None

def get_fallback_analyzer() -> FallbackAnalyzer:
    """Get or create fallback analyzer"""
    global _fallback_analyzer
    if _fallback_analyzer is None:
        _fallback_analyzer = FallbackAnalyzer()
    return _fallback_analyzer
