"""
Skill Intelligence Service - Advanced skill analysis
Provides salary data, demand levels, difficulty ratings, time estimates
"""
from typing import Dict, List
import re

class SkillIntelligence:
    """Provides intelligence about skills and roles"""
    
    # Salary ranges (in INR LPA - Lakhs Per Annum) - 2024-2026 Market Data
    SALARY_DATA = {
        # Frontend
        "frontend developer": {"entry": "3-6", "mid": "6-12", "senior": "12-25"},
        "react developer": {"entry": "4-7", "mid": "7-15", "senior": "15-30"},
        "frontend engineer": {"entry": "5-8", "mid": "8-16", "senior": "16-35"},
        
        # Backend
        "backend developer": {"entry": "4-7", "mid": "7-14", "senior": "14-28"},
        "node.js developer": {"entry": "4-8", "mid": "8-15", "senior": "15-30"},
        "python developer": {"entry": "3-6", "mid": "6-12", "senior": "12-25"},
        
        # Full Stack
        "full stack developer": {"entry": "5-9", "mid": "9-18", "senior": "18-35"},
        "mern stack developer": {"entry": "4-8", "mid": "8-16", "senior": "16-32"},
        
        # Data & ML & AI
        "data scientist": {"entry": "6-10", "mid": "10-20", "senior": "20-40"},
        "machine learning engineer": {"entry": "7-12", "mid": "12-25", "senior": "25-50"},
        "ai engineer": {"entry": "8-15", "mid": "15-30", "senior": "30-60"},
        "ai ml engineer": {"entry": "8-15", "mid": "15-30", "senior": "30-60"},
        "mlops engineer": {"entry": "7-12", "mid": "12-24", "senior": "24-45"},
        "data analyst": {"entry": "3-6", "mid": "6-12", "senior": "12-22"},
        "data engineer": {"entry": "5-10", "mid": "10-20", "senior": "20-38"},
        
        # DevOps
        "devops engineer": {"entry": "5-9", "mid": "9-18", "senior": "18-35"},
        "cloud engineer": {"entry": "6-10", "mid": "10-20", "senior": "20-40"},
        "sre": {"entry": "7-12", "mid": "12-24", "senior": "24-45"},
        
        # Mobile
        "mobile developer": {"entry": "4-7", "mid": "7-14", "senior": "14-28"},
        "android developer": {"entry": "3-6", "mid": "6-12", "senior": "12-24"},
        "ios developer": {"entry": "4-8", "mid": "8-16", "senior": "16-32"},
        
        # Other
        "software engineer": {"entry": "4-8", "mid": "8-16", "senior": "16-35"},
        "qa engineer": {"entry": "3-5", "mid": "5-10", "senior": "10-20"},
        "blockchain developer": {"entry": "6-12", "mid": "12-25", "senior": "25-50"},
    }
    
    # Demand levels (job market demand) - 2024-2026
    DEMAND_LEVELS = {
        # Programming Languages
        "react": "Very High",
        "javascript": "Very High",
        "python": "Very High",
        "node.js": "High",
        "java": "High",
        "typescript": "High",
        
        # AI/ML
        "machine learning": "Very High",
        "deep learning": "Very High",
        "ai": "Very High",
        "llm": "Very High",
        "nlp": "Very High",
        "computer vision": "High",
        "tensorflow": "High",
        "pytorch": "Very High",
        "langchain": "Very High",
        "hugging face": "High",
        "transformers": "High",
        "rag": "Very High",
        "prompt engineering": "Very High",
        "vector databases": "High",
        
        # Data
        "data science": "High",
        "sql": "High",
        "pandas": "High",
        "numpy": "High",
        
        # Cloud & DevOps
        "aws": "Very High",
        "docker": "High",
        "kubernetes": "High",
        "terraform": "High",
        "ci/cd": "High",
        
        # Databases
        "mongodb": "High",
        "postgresql": "High",
        "redis": "Medium",
        
        # Other
        "angular": "Medium",
        "vue": "Medium",
        "django": "Medium",
        "flask": "Medium",
        "graphql": "Medium",
        "jenkins": "Medium",
        "git": "Very High",
    }
    
    # Difficulty ratings
    DIFFICULTY_LEVELS = {
        # Easy
        "html": "Easy",
        "css": "Easy",
        "python": "Easy",
        "sql": "Easy",
        "mongodb": "Easy",
        "git": "Easy",
        
        # Medium
        "javascript": "Medium",
        "react": "Medium",
        "node.js": "Medium",
        "typescript": "Medium",
        "docker": "Medium",
        "aws": "Medium",
        "data structures": "Medium",
        "pandas": "Medium",
        "numpy": "Medium",
        
        # Hard
        "kubernetes": "Hard",
        "machine learning": "Hard",
        "system design": "Hard",
        "algorithms": "Hard",
        "deep learning": "Hard",
        "tensorflow": "Hard",
        "pytorch": "Hard",
        "nlp": "Hard",
        "computer vision": "Hard",
        
        # Very Hard
        "llm": "Very Hard",
        "transformers": "Very Hard",
        "rag": "Hard",
        "langchain": "Medium",
        "prompt engineering": "Medium",
        "reinforcement learning": "Very Hard",
        "mlops": "Hard",
    }
    
    # Learning time estimates (in weeks for beginner to proficient) - 2024-2026
    LEARNING_TIME = {
        # Easy (2-4 weeks)
        "html": "2-3 weeks",
        "css": "3-4 weeks",
        "git": "2-3 weeks",
        "sql": "4-6 weeks",
        
        # Medium (6-12 weeks)
        "javascript": "8-12 weeks",
        "python": "6-8 weeks",
        "react": "6-8 weeks",
        "node.js": "6-8 weeks",
        "typescript": "4-6 weeks",
        "mongodb": "3-4 weeks",
        "docker": "4-6 weeks",
        "pandas": "4-6 weeks",
        "numpy": "3-4 weeks",
        "langchain": "6-8 weeks",
        "prompt engineering": "4-6 weeks",
        
        # Hard (12-24 weeks)
        "kubernetes": "8-12 weeks",
        "machine learning": "16-24 weeks",
        "deep learning": "20-30 weeks",
        "tensorflow": "12-16 weeks",
        "pytorch": "12-16 weeks",
        "nlp": "16-20 weeks",
        "computer vision": "16-20 weeks",
        "aws": "8-12 weeks",
        "rag": "8-12 weeks",
        
        # Very Hard (24+ weeks)
        "llm": "20-30 weeks",
        "transformers": "20-30 weeks",
        "reinforcement learning": "24-36 weeks",
        "mlops": "16-24 weeks",
    }
    
    def __init__(self):
        """Initialize skill intelligence"""
        pass
    
    def get_role_intelligence(self, role: str, experience_level: str = "entry") -> Dict:
        """
        Get comprehensive intelligence about a role
        
        Args:
            role: Role name (e.g., "Frontend Developer")
            experience_level: entry/mid/senior
        
        Returns:
            Dict with salary, demand, difficulty, time
        """
        role_normalized = role.lower().strip()
        
        # Get salary data
        salary_data = self.SALARY_DATA.get(role_normalized, {"entry": "3-6", "mid": "6-15", "senior": "15-30"})
        salary_range = salary_data.get(experience_level, salary_data["entry"])
        
        # Determine overall demand
        demand = self._calculate_role_demand(role_normalized)
        
        # Determine difficulty
        difficulty = self._calculate_role_difficulty(role_normalized)
        
        # Estimate time to learn
        time_estimate = self._estimate_learning_time(role_normalized, experience_level)
        
        # Get growth potential
        growth = self._get_growth_potential(role_normalized)
        
        return {
            "role": role,
            "experience_level": experience_level,
            "salary_range_lpa": salary_range,
            "market_demand": demand,
            "difficulty": difficulty,
            "time_to_learn": time_estimate,
            "growth_potential": growth,
            "job_openings": self._estimate_job_openings(role_normalized),
            "remote_friendly": self._is_remote_friendly(role_normalized),
            "top_companies": self._get_top_companies(role_normalized)
        }
    
    def get_skill_intelligence(self, skill: str) -> Dict:
        """
        Get intelligence about a specific skill
        
        Args:
            skill: Skill name
        
        Returns:
            Dict with demand, difficulty, time, salary impact
        """
        skill_normalized = skill.lower().strip()
        
        return {
            "skill": skill,
            "demand": self.DEMAND_LEVELS.get(skill_normalized, "Medium"),
            "difficulty": self.DIFFICULTY_LEVELS.get(skill_normalized, "Medium"),
            "learning_time": self.LEARNING_TIME.get(skill_normalized, "4-8 weeks"),
            "salary_impact": self._get_salary_impact(skill_normalized),
            "prerequisites": self._get_prerequisites(skill_normalized),
            "related_skills": self._get_related_skills(skill_normalized),
            "use_cases": self._get_use_cases(skill_normalized)
        }
    
    def prioritize_skills(self, skills: List[str], user_goal: str = "job_ready") -> List[Dict]:
        """
        Prioritize skills based on user goal
        
        Args:
            skills: List of skills to prioritize
            user_goal: job_ready/high_salary/quick_learn/trending
        
        Returns:
            Sorted list of skills with priority scores
        """
        skill_scores = []
        
        for skill in skills:
            skill_normalized = skill.lower().strip()
            
            # Calculate priority score
            score = 0
            
            if user_goal == "job_ready":
                # Prioritize high demand + medium difficulty
                demand = self.DEMAND_LEVELS.get(skill_normalized, "Medium")
                if demand == "Very High":
                    score += 10
                elif demand == "High":
                    score += 7
                else:
                    score += 4
            
            elif user_goal == "high_salary":
                # Prioritize skills with high salary impact
                salary_impact = self._get_salary_impact(skill_normalized)
                if salary_impact == "High":
                    score += 10
                elif salary_impact == "Medium":
                    score += 6
                else:
                    score += 3
            
            elif user_goal == "quick_learn":
                # Prioritize easy skills
                difficulty = self.DIFFICULTY_LEVELS.get(skill_normalized, "Medium")
                if difficulty == "Easy":
                    score += 10
                elif difficulty == "Medium":
                    score += 6
                else:
                    score += 3
            
            skill_scores.append({
                "skill": skill,
                "priority_score": score,
                "intelligence": self.get_skill_intelligence(skill)
            })
        
        # Sort by priority score
        skill_scores.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return skill_scores
    
    def _calculate_role_demand(self, role: str) -> str:
        """Calculate overall demand for role"""
        high_demand_keywords = ["developer", "engineer", "data", "ml", "ai", "cloud", "devops"]
        
        if any(keyword in role for keyword in high_demand_keywords):
            return "High"
        return "Medium"
    
    def _calculate_role_difficulty(self, role: str) -> str:
        """Calculate difficulty of role"""
        hard_roles = ["machine learning", "ai", "data scientist", "devops", "sre", "blockchain"]
        medium_roles = ["full stack", "backend", "cloud"]
        
        if any(hard in role for hard in hard_roles):
            return "Hard"
        elif any(med in role for med in medium_roles):
            return "Medium"
        return "Easy to Medium"
    
    def _estimate_learning_time(self, role: str, level: str) -> str:
        """Estimate time to reach role"""
        if level == "entry":
            if "frontend" in role:
                return "4-6 months"
            elif "backend" in role or "full stack" in role:
                return "6-9 months"
            elif "data" in role or "ml" in role or "ai" in role:
                return "9-12 months"
            elif "devops" in role:
                return "6-9 months"
        elif level == "mid":
            return "1-2 years"
        else:
            return "3-5 years"
        
        return "6-12 months"
    
    def _get_growth_potential(self, role: str) -> str:
        """Get career growth potential"""
        high_growth = ["ai", "ml", "data scientist", "cloud", "devops", "blockchain"]
        
        if any(keyword in role for keyword in high_growth):
            return "Very High"
        return "High"
    
    def _estimate_job_openings(self, role: str) -> str:
        """Estimate number of job openings"""
        if "developer" in role or "engineer" in role:
            return "10,000+ openings"
        return "5,000+ openings"
    
    def _is_remote_friendly(self, role: str) -> bool:
        """Check if role is remote-friendly"""
        remote_roles = ["developer", "engineer", "data", "designer", "writer"]
        return any(keyword in role for keyword in remote_roles)
    
    def _get_top_companies(self, role: str) -> List[str]:
        """Get top companies hiring for role"""
        if "frontend" in role or "react" in role:
            return ["Google", "Meta", "Netflix", "Airbnb", "Amazon"]
        elif "backend" in role or "full stack" in role:
            return ["Amazon", "Microsoft", "Google", "Uber", "Stripe"]
        elif "ai" in role or "ml" in role or "machine learning" in role or "data scientist" in role:
            return ["OpenAI", "Google DeepMind", "Meta AI", "Microsoft Research", "Amazon AI", "Anthropic"]
        elif "devops" in role or "cloud" in role:
            return ["AWS", "Google Cloud", "Microsoft Azure", "HashiCorp", "Docker"]
        else:
            return ["Google", "Amazon", "Microsoft", "Meta", "Apple"]
    
    def _get_salary_impact(self, skill: str) -> str:
        """Get salary impact of skill"""
        high_impact = ["machine learning", "ai", "aws", "kubernetes", "system design", "blockchain"]
        medium_impact = ["react", "node.js", "python", "docker", "typescript"]
        
        if skill in high_impact:
            return "High"
        elif skill in medium_impact:
            return "Medium"
        return "Low to Medium"
    
    def _get_prerequisites(self, skill: str) -> List[str]:
        """Get prerequisites for skill"""
        prereqs = {
            "react": ["JavaScript", "HTML", "CSS"],
            "node.js": ["JavaScript"],
            "typescript": ["JavaScript"],
            "machine learning": ["Python", "Mathematics", "Statistics"],
            "docker": ["Linux basics", "Command line"],
            "kubernetes": ["Docker", "Linux", "Networking"],
        }
        
        return prereqs.get(skill, [])
    
    def _get_related_skills(self, skill: str) -> List[str]:
        """Get related skills"""
        related = {
            "react": ["Redux", "Next.js", "TypeScript", "Tailwind CSS"],
            "python": ["Django", "Flask", "FastAPI", "Pandas"],
            "javascript": ["TypeScript", "Node.js", "React", "Vue"],
            "docker": ["Kubernetes", "Docker Compose", "CI/CD"],
        }
        
        return related.get(skill, [])
    
    def _get_use_cases(self, skill: str) -> List[str]:
        """Get real-world use cases"""
        use_cases = {
            "react": ["Web applications", "SPAs", "Mobile apps (React Native)", "Dashboards"],
            "python": ["Web development", "Data analysis", "ML/AI", "Automation"],
            "docker": ["Application deployment", "Microservices", "CI/CD", "Development environments"],
            "machine learning": ["Recommendation systems", "Fraud detection", "Image recognition", "NLP"],
        }
        
        return use_cases.get(skill, ["Software development", "Problem solving"])


# Singleton
_skill_intelligence = None

def get_skill_intelligence() -> SkillIntelligence:
    """Get or create skill intelligence service"""
    global _skill_intelligence
    if _skill_intelligence is None:
        _skill_intelligence = SkillIntelligence()
    return _skill_intelligence
