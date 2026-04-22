"""
Resource Engine - Provides real learning resources for skills
YouTube videos, GitHub repos, documentation, courses
"""
from typing import Dict, List
import re

class ResourceEngine:
    """Generates actionable learning resources for skills"""
    
    # Official documentation links
    OFFICIAL_DOCS = {
        # Frontend
        "html": "https://developer.mozilla.org/en-US/docs/Web/HTML",
        "css": "https://developer.mozilla.org/en-US/docs/Web/CSS",
        "javascript": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "typescript": "https://www.typescriptlang.org/docs/",
        "react": "https://react.dev",
        "vue": "https://vuejs.org/guide/",
        "angular": "https://angular.io/docs",
        "next.js": "https://nextjs.org/docs",
        "svelte": "https://svelte.dev/docs",
        
        # Backend
        "node.js": "https://nodejs.org/docs/",
        "express": "https://expressjs.com/",
        "fastapi": "https://fastapi.tiangolo.com/",
        "django": "https://docs.djangoproject.com/",
        "flask": "https://flask.palletsprojects.com/",
        "spring boot": "https://spring.io/projects/spring-boot",
        
        # Databases
        "mongodb": "https://www.mongodb.com/docs/",
        "postgresql": "https://www.postgresql.org/docs/",
        "mysql": "https://dev.mysql.com/doc/",
        "redis": "https://redis.io/docs/",
        
        # DevOps
        "docker": "https://docs.docker.com/",
        "kubernetes": "https://kubernetes.io/docs/",
        "aws": "https://docs.aws.amazon.com/",
        "azure": "https://learn.microsoft.com/en-us/azure/",
        "terraform": "https://developer.hashicorp.com/terraform/docs",
        
        # Data Science / ML / AI
        "python": "https://docs.python.org/3/",
        "pandas": "https://pandas.pydata.org/docs/",
        "numpy": "https://numpy.org/doc/",
        "tensorflow": "https://www.tensorflow.org/api_docs",
        "pytorch": "https://pytorch.org/docs/",
        "scikit-learn": "https://scikit-learn.org/stable/documentation.html",
        "keras": "https://keras.io/api/",
        "hugging face": "https://huggingface.co/docs",
        "transformers": "https://huggingface.co/docs/transformers",
        "langchain": "https://python.langchain.com/docs/",
        "openai": "https://platform.openai.com/docs/",
        "anthropic": "https://docs.anthropic.com/",
        "llm": "https://huggingface.co/docs/transformers/main/en/llm_tutorial",
        "nlp": "https://www.nltk.org/",
        "spacy": "https://spacy.io/api",
        "opencv": "https://docs.opencv.org/",
        "cuda": "https://docs.nvidia.com/cuda/",
        "mlflow": "https://mlflow.org/docs/latest/index.html",
        "wandb": "https://docs.wandb.ai/",
        "vector database": "https://www.pinecone.io/learn/vector-database/",
        "chromadb": "https://docs.trychroma.com/",
        "pinecone": "https://docs.pinecone.io/",
        "rag": "https://python.langchain.com/docs/use_cases/question_answering/",
        "prompt engineering": "https://www.promptingguide.ai/",
        
        # Tools
        "git": "https://git-scm.com/doc",
        "github": "https://docs.github.com/",
        "vscode": "https://code.visualstudio.com/docs",
        "jupyter": "https://jupyter.org/documentation",
    }
    
    # YouTube course recommendations (2024-2026 Latest)
    YOUTUBE_COURSES = {
        "javascript": [
            "JavaScript Full Course by freeCodeCamp",
            "JavaScript Tutorial for Beginners by Programming with Mosh",
            "Modern JavaScript by The Net Ninja"
        ],
        "react": [
            "React Course - Beginner's Tutorial by freeCodeCamp",
            "React JS Full Course by Traversy Media",
            "React Tutorial by Codevolution"
        ],
        "python": [
            "Python Full Course by freeCodeCamp",
            "Python Tutorial by Programming with Mosh",
            "Python for Beginners by Tech With Tim"
        ],
        "node.js": [
            "Node.js Full Course by freeCodeCamp",
            "Node.js Tutorial by The Net Ninja",
            "Node.js Crash Course by Traversy Media"
        ],
        "machine learning": [
            "Machine Learning Course by Andrew Ng (Stanford)",
            "Machine Learning Full Course by freeCodeCamp",
            "ML Tutorial by Krish Naik"
        ],
        "deep learning": [
            "Deep Learning Specialization by Andrew Ng",
            "Deep Learning Full Course by freeCodeCamp",
            "Neural Networks by 3Blue1Brown"
        ],
        "tensorflow": [
            "TensorFlow 2.0 Complete Course by freeCodeCamp",
            "TensorFlow Tutorial by Sentdex",
            "TensorFlow for Deep Learning by Krish Naik"
        ],
        "pytorch": [
            "PyTorch Full Course by freeCodeCamp",
            "PyTorch Tutorial by Python Engineer",
            "Deep Learning with PyTorch by Aladdin Persson"
        ],
        "nlp": [
            "NLP with Python by freeCodeCamp",
            "Natural Language Processing by Stanford",
            "Hugging Face NLP Course"
        ],
        "llm": [
            "Large Language Models Course by freeCodeCamp",
            "LLM Bootcamp by Full Stack Deep Learning",
            "Building LLM Applications by DeepLearning.AI"
        ],
        "langchain": [
            "LangChain Full Course by freeCodeCamp",
            "LangChain Tutorial by Sam Witteveen",
            "Building AI Apps with LangChain"
        ],
        "docker": [
            "Docker Tutorial for Beginners by TechWorld with Nana",
            "Docker Full Course by freeCodeCamp",
            "Docker Crash Course by Traversy Media"
        ],
        "sql": [
            "SQL Full Course by freeCodeCamp",
            "SQL Tutorial by Programming with Mosh",
            "MySQL Tutorial by The Net Ninja"
        ],
    }
    
    # GitHub project ideas (Real-world, Portfolio-worthy)
    GITHUB_PROJECTS = {
        "javascript": [
            "Build a Todo App with vanilla JS",
            "Create a Weather App using API",
            "Build a Calculator with advanced features"
        ],
        "react": [
            "Build a Netflix Clone",
            "Create a Social Media Dashboard",
            "Build an E-commerce Product Page"
        ],
        "python": [
            "Build a Web Scraper",
            "Create a CLI Task Manager",
            "Build a Password Generator"
        ],
        "node.js": [
            "Build a REST API with Express",
            "Create a Real-time Chat App",
            "Build a Blog Backend with Authentication"
        ],
        "machine learning": [
            "Build a Movie Recommendation System",
            "Create a Sentiment Analysis Tool",
            "Build an Image Classifier"
        ],
        "deep learning": [
            "Build an Image Classification Model",
            "Create a Face Recognition System",
            "Build a Text Generation Model"
        ],
        "tensorflow": [
            "Build a CNN for Image Recognition",
            "Create a Time Series Forecasting Model",
            "Build an Object Detection System"
        ],
        "pytorch": [
            "Build a Neural Network from Scratch",
            "Create a GAN for Image Generation",
            "Build a Transformer Model"
        ],
        "nlp": [
            "Build a Chatbot with NLP",
            "Create a Text Summarization Tool",
            "Build a Sentiment Analysis API"
        ],
        "llm": [
            "Build a ChatGPT Clone",
            "Create a Document Q&A System",
            "Build an AI Writing Assistant"
        ],
        "langchain": [
            "Build a RAG Application",
            "Create a Multi-Document Chatbot",
            "Build an AI Agent with Tools"
        ],
        "ai engineer": [
            "Build a ChatGPT Clone with RAG",
            "Create an AI Resume Analyzer",
            "Build a Multi-Modal AI Application",
            "Create a Fine-tuned LLM for Domain",
            "Build an AI Agent System"
        ],
        "docker": [
            "Containerize a Full-Stack App",
            "Create Multi-Container Setup with Docker Compose",
            "Build CI/CD Pipeline with Docker"
        ],
    }
    
    # Course platforms
    COURSE_PLATFORMS = {
        "udemy": "https://www.udemy.com/courses/search/?q=",
        "coursera": "https://www.coursera.org/search?query=",
        "edx": "https://www.edx.org/search?q=",
        "pluralsight": "https://www.pluralsight.com/search?q=",
        "freecodecamp": "https://www.freecodecamp.org/learn",
    }
    
    def __init__(self):
        """Initialize resource engine"""
        pass
    
    def get_resources(self, skill: str, level: str = "beginner") -> Dict:
        """
        Get comprehensive resources for a skill
        
        Args:
            skill: Skill name (e.g., "React", "Python")
            level: Difficulty level (beginner/intermediate/advanced)
        
        Returns:
            Dict with documentation, videos, projects, courses
        """
        skill_normalized = self._normalize_skill(skill)
        
        return {
            "skill": skill,
            "level": level,
            "documentation": self._get_documentation(skill_normalized),
            "youtube": self._get_youtube_courses(skill_normalized),
            "projects": self._get_projects(skill_normalized, level),
            "courses": self._get_courses(skill_normalized),
            "github_search": self._get_github_search(skill_normalized),
            "practice": self._get_practice_platforms(skill_normalized)
        }
    
    def _normalize_skill(self, skill: str) -> str:
        """Normalize skill name"""
        skill_lower = skill.lower().strip()
        
        # Synonym mapping
        synonyms = {
            "js": "javascript",
            "ts": "typescript",
            "reactjs": "react",
            "react.js": "react",
            "nodejs": "node.js",
            "node": "node.js",
            "py": "python",
            "ml": "machine learning",
            "ai": "machine learning",
            "k8s": "kubernetes",
            "tf": "tensorflow",
            "db": "database",
            "sql": "sql",
            "nosql": "mongodb",
        }
        
        return synonyms.get(skill_lower, skill_lower)
    
    def _get_documentation(self, skill: str) -> Dict:
        """Get official documentation"""
        doc_url = self.OFFICIAL_DOCS.get(skill)
        
        if doc_url:
            return {
                "title": f"Official {skill.title()} Documentation",
                "url": doc_url,
                "type": "official"
            }
        else:
            return {
                "title": f"{skill.title()} Documentation",
                "url": f"https://www.google.com/search?q={skill}+documentation",
                "type": "search"
            }
    
    def _get_youtube_courses(self, skill: str) -> List[Dict]:
        """Get YouTube course recommendations"""
        courses = self.YOUTUBE_COURSES.get(skill, [
            f"{skill.title()} Full Course for Beginners",
            f"{skill.title()} Tutorial - Complete Guide",
            f"Learn {skill.title()} in 2024"
        ])
        
        return [
            {
                "title": course,
                "search_url": f"https://www.youtube.com/results?search_query={course.replace(' ', '+')}",
                "platform": "YouTube"
            }
            for course in courses[:3]
        ]
    
    def _get_projects(self, skill: str, level: str) -> List[Dict]:
        """Get project ideas"""
        projects = self.GITHUB_PROJECTS.get(skill, [
            f"Build a {skill.title()} Project",
            f"Create a Real-World {skill.title()} Application",
            f"{skill.title()} Portfolio Project"
        ])
        
        # Adjust complexity based on level
        if level == "advanced":
            projects = [p.replace("Build", "Build Advanced").replace("Create", "Create Complex") for p in projects]
        
        return [
            {
                "title": project,
                "difficulty": level,
                "github_search": f"https://github.com/search?q={skill}+{level}+project"
            }
            for project in projects[:3]
        ]
    
    def _get_courses(self, skill: str) -> List[Dict]:
        """Get online course links"""
        return [
            {
                "platform": "Udemy",
                "url": f"{self.COURSE_PLATFORMS['udemy']}{skill.replace(' ', '+')}"
            },
            {
                "platform": "Coursera",
                "url": f"{self.COURSE_PLATFORMS['coursera']}{skill.replace(' ', '+')}"
            },
            {
                "platform": "freeCodeCamp",
                "url": self.COURSE_PLATFORMS['freecodecamp']
            }
        ]
    
    def _get_github_search(self, skill: str) -> str:
        """Get GitHub search URL"""
        return f"https://github.com/search?q={skill}+awesome+list"
    
    def _get_practice_platforms(self, skill: str) -> List[Dict]:
        """Get practice platforms"""
        platforms = []
        
        # Coding practice
        if skill in ["javascript", "python", "java", "c++", "sql"]:
            platforms.extend([
                {"name": "LeetCode", "url": "https://leetcode.com/"},
                {"name": "HackerRank", "url": "https://www.hackerrank.com/"},
                {"name": "CodeWars", "url": "https://www.codewars.com/"}
            ])
        
        # Frontend practice
        if skill in ["html", "css", "javascript", "react", "vue"]:
            platforms.extend([
                {"name": "Frontend Mentor", "url": "https://www.frontendmentor.io/"},
                {"name": "CSS Battle", "url": "https://cssbattle.dev/"}
            ])
        
        # ML practice
        if skill in ["machine learning", "python", "data science"]:
            platforms.extend([
                {"name": "Kaggle", "url": "https://www.kaggle.com/"},
                {"name": "Google Colab", "url": "https://colab.research.google.com/"}
            ])
        
        return platforms[:3]
    
    def generate_learning_path(self, skill: str, duration_weeks: int = 4) -> Dict:
        """
        Generate week-by-week learning path
        
        Args:
            skill: Skill to learn
            duration_weeks: Learning duration in weeks
        
        Returns:
            Structured learning path
        """
        skill_normalized = self._normalize_skill(skill)
        resources = self.get_resources(skill_normalized, "beginner")
        
        # Generate weekly breakdown
        weeks = []
        topics = self._get_weekly_topics(skill_normalized, duration_weeks)
        
        for week_num, topic in enumerate(topics, 1):
            weeks.append({
                "week": week_num,
                "topic": topic,
                "goals": self._get_weekly_goals(skill_normalized, week_num, duration_weeks),
                "resources": resources if week_num == 1 else None  # Full resources in week 1
            })
        
        return {
            "skill": skill,
            "duration_weeks": duration_weeks,
            "weekly_plan": weeks,
            "final_project": self._get_final_project(skill_normalized)
        }
    
    def _get_weekly_topics(self, skill: str, weeks: int) -> List[str]:
        """Get weekly topics for skill"""
        topic_map = {
            "javascript": ["Basics & Syntax", "DOM Manipulation", "Async JS & APIs", "ES6+ Features"],
            "react": ["Components & Props", "State & Hooks", "Routing & Forms", "Advanced Patterns"],
            "python": ["Syntax & Data Types", "Functions & Modules", "OOP Concepts", "File Handling & APIs"],
            "node.js": ["Node Basics & NPM", "Express & Routing", "Database Integration", "Authentication & APIs"],
        }
        
        topics = topic_map.get(skill, [
            f"{skill.title()} Fundamentals",
            f"Intermediate {skill.title()}",
            f"Advanced {skill.title()}",
            f"{skill.title()} Best Practices"
        ])
        
        return topics[:weeks]
    
    def _get_weekly_goals(self, skill: str, week: int, total_weeks: int) -> List[str]:
        """Get goals for specific week"""
        if week == 1:
            return [
                f"Understand {skill} basics",
                "Set up development environment",
                "Complete first tutorial"
            ]
        elif week == total_weeks:
            return [
                "Build final project",
                "Deploy to production",
                "Add to portfolio"
            ]
        else:
            return [
                f"Master week {week} concepts",
                "Build mini-project",
                "Practice coding challenges"
            ]
    
    def _get_final_project(self, skill: str) -> Dict:
        """Get final capstone project"""
        projects = self.GITHUB_PROJECTS.get(skill, [f"Build a {skill.title()} Application"])
        
        return {
            "title": projects[0] if projects else f"{skill.title()} Capstone Project",
            "description": f"Build a complete project using {skill} to showcase your skills",
            "requirements": [
                "Use best practices",
                "Add documentation",
                "Deploy online",
                "Share on GitHub"
            ]
        }


# Singleton
_resource_engine = None

def get_resource_engine() -> ResourceEngine:
    """Get or create resource engine"""
    global _resource_engine
    if _resource_engine is None:
        _resource_engine = ResourceEngine()
    return _resource_engine
