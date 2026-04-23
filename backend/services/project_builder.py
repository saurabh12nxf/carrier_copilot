"""
AI Project Builder Service - Generates Detailed Project Plans
Creates comprehensive project specifications with features, tech stack, and step-by-step guides
"""
from typing import Dict, List
from utils.multi_llm import get_multi_llm
import json

class ProjectBuilderService:
    """Generate detailed, actionable project specifications"""
    
    def __init__(self):
        self.llm = get_multi_llm()
    
    def generate_project_details(
        self, 
        project_title: str, 
        target_role: str,
        skills_to_practice: List[str],
        difficulty: str = "intermediate"
    ) -> Dict:
        """
        Generate comprehensive project details with AI
        
        Args:
            project_title: Project name/idea
            target_role: Target career role
            skills_to_practice: Skills this project should cover
            difficulty: beginner/intermediate/advanced
        
        Returns:
            Detailed project specification
        """
        print(f"[PROJECT] Generating details for: {project_title}")
        
        prompt = f"""You are an expert software architect creating a DETAILED project specification.

PROJECT: {project_title}
TARGET ROLE: {target_role}
SKILLS TO PRACTICE: {', '.join(skills_to_practice[:10])}
DIFFICULTY: {difficulty}

Create a COMPREHENSIVE project specification in STRICT JSON format:

{{
  "title": "{project_title}",
  "tagline": "One-line catchy description",
  "description": "2-3 sentence detailed description of what this project does and why it's valuable",
  "difficulty": "{difficulty}",
  "estimated_hours": 20,
  "features": [
    {{
      "name": "User Authentication",
      "description": "JWT-based auth with login/signup",
      "priority": "must-have",
      "estimated_hours": 4
    }},
    {{
      "name": "Dashboard",
      "description": "Interactive data visualization",
      "priority": "must-have",
      "estimated_hours": 6
    }},
    {{
      "name": "Real-time Updates",
      "description": "WebSocket integration",
      "priority": "nice-to-have",
      "estimated_hours": 5
    }}
  ],
  "tech_stack": {{
    "frontend": ["React", "Tailwind CSS", "Axios"],
    "backend": ["Node.js", "Express", "MongoDB"],
    "tools": ["Git", "Postman", "VS Code"],
    "deployment": ["Vercel", "Railway"]
  }},
  "learning_outcomes": [
    "Master React hooks and state management",
    "Build RESTful APIs with Express",
    "Implement JWT authentication",
    "Deploy full-stack applications"
  ],
  "github_starter_repos": [
    {{
      "name": "react-express-starter",
      "url": "https://github.com/search?q=react+express+starter+template",
      "description": "Boilerplate with React + Express setup"
    }},
    {{
      "name": "mern-stack-template",
      "url": "https://github.com/search?q=mern+stack+template",
      "description": "Complete MERN stack starter"
    }}
  ],
  "step_by_step_guide": [
    {{
      "step": 1,
      "title": "Project Setup",
      "tasks": [
        "Initialize Git repository",
        "Set up React app with Vite",
        "Create Express server",
        "Configure environment variables"
      ],
      "estimated_time": "2 hours",
      "resources": ["React docs", "Express guide"]
    }},
    {{
      "step": 2,
      "title": "Build Authentication",
      "tasks": [
        "Create user model",
        "Implement JWT token generation",
        "Build login/signup endpoints",
        "Add protected routes"
      ],
      "estimated_time": "4 hours",
      "resources": ["JWT documentation", "bcrypt guide"]
    }},
    {{
      "step": 3,
      "title": "Frontend Development",
      "tasks": [
        "Design UI components",
        "Implement routing",
        "Connect to backend API",
        "Add form validation"
      ],
      "estimated_time": "6 hours",
      "resources": ["React Router docs", "Tailwind CSS"]
    }},
    {{
      "step": 4,
      "title": "Testing & Deployment",
      "tasks": [
        "Test all features",
        "Fix bugs",
        "Deploy frontend to Vercel",
        "Deploy backend to Railway"
      ],
      "estimated_time": "3 hours",
      "resources": ["Vercel docs", "Railway guide"]
    }}
  ],
  "portfolio_tips": [
    "Add a live demo link",
    "Write comprehensive README with screenshots",
    "Include architecture diagram",
    "Document API endpoints",
    "Add unit tests"
  ],
  "common_challenges": [
    {{
      "challenge": "CORS errors",
      "solution": "Configure CORS middleware in Express"
    }},
    {{
      "challenge": "State management complexity",
      "solution": "Use Context API or Redux for global state"
    }}
  ]
}}

CRITICAL RULES:
1. Make features SPECIFIC and ACTIONABLE
2. Tech stack must match {target_role} requirements
3. Include 4-6 must-have features and 2-3 nice-to-have
4. Step-by-step guide should have 4-6 clear phases
5. Each step should have specific tasks (not vague)
6. Estimated hours should be realistic
7. GitHub repos should be searchable/real
8. Portfolio tips should be professional

Return ONLY valid JSON, no markdown."""

        # Try AI generation
        llm_response = self.llm.generate(prompt, temperature=0.7, max_tokens=2500)
        
        if llm_response:
            try:
                project_data = self._parse_json_response(llm_response)
                if project_data and "features" in project_data:
                    print(f"[PROJECT] ✓ Generated detailed project with {len(project_data['features'])} features")
                    return project_data
            except Exception as e:
                print(f"[PROJECT] Failed to parse AI response: {e}")
        
        # Fallback to structured project
        print("[PROJECT] Using fallback project structure")
        return self._generate_fallback_project(
            project_title, target_role, skills_to_practice, difficulty
        )
    
    def _parse_json_response(self, response: str) -> Dict:
        """Parse JSON from LLM response"""
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        
        return json.loads(response.strip())
    
    def _generate_fallback_project(
        self, 
        title: str, 
        role: str, 
        skills: List[str],
        difficulty: str
    ) -> Dict:
        """Generate structured fallback project"""
        
        # Determine tech stack based on role
        tech_stacks = {
            "frontend": {
                "frontend": ["React", "TypeScript", "Tailwind CSS"],
                "backend": ["Node.js", "Express"],
                "tools": ["Git", "VS Code", "Chrome DevTools"],
                "deployment": ["Vercel", "Netlify"]
            },
            "backend": {
                "frontend": ["React (basic)"],
                "backend": ["Node.js", "Express", "PostgreSQL"],
                "tools": ["Postman", "Docker", "Git"],
                "deployment": ["Railway", "Heroku"]
            },
            "fullstack": {
                "frontend": ["React", "Tailwind CSS"],
                "backend": ["Node.js", "Express", "MongoDB"],
                "tools": ["Git", "Postman", "Docker"],
                "deployment": ["Vercel", "Railway"]
            },
            "data": {
                "frontend": ["Streamlit", "Plotly"],
                "backend": ["Python", "FastAPI", "Pandas"],
                "tools": ["Jupyter", "Git"],
                "deployment": ["Streamlit Cloud", "Railway"]
            },
            "ai": {
                "frontend": ["React", "Tailwind CSS"],
                "backend": ["Python", "FastAPI", "LangChain"],
                "tools": ["Jupyter", "Git", "Postman"],
                "deployment": ["Vercel", "Railway"]
            }
        }
        
        # Detect role type
        role_lower = role.lower()
        if "frontend" in role_lower or "react" in role_lower:
            stack = tech_stacks["frontend"]
        elif "backend" in role_lower or "api" in role_lower:
            stack = tech_stacks["backend"]
        elif "data" in role_lower or "analyst" in role_lower:
            stack = tech_stacks["data"]
        elif "ai" in role_lower or "ml" in role_lower or "machine learning" in role_lower:
            stack = tech_stacks["ai"]
        else:
            stack = tech_stacks["fullstack"]
        
        return {
            "title": title,
            "tagline": f"A comprehensive {role} project",
            "description": f"Build a production-ready {title} to demonstrate your {role} skills. This project covers {', '.join(skills[:3])} and more.",
            "difficulty": difficulty,
            "estimated_hours": 25 if difficulty == "advanced" else 20 if difficulty == "intermediate" else 15,
            "features": [
                {
                    "name": "Core Functionality",
                    "description": f"Implement main features using {skills[0] if skills else 'modern tech'}",
                    "priority": "must-have",
                    "estimated_hours": 8
                },
                {
                    "name": "User Interface",
                    "description": "Responsive, modern UI with great UX",
                    "priority": "must-have",
                    "estimated_hours": 6
                },
                {
                    "name": "Data Management",
                    "description": "Efficient data handling and storage",
                    "priority": "must-have",
                    "estimated_hours": 4
                },
                {
                    "name": "Authentication",
                    "description": "Secure user authentication system",
                    "priority": "nice-to-have",
                    "estimated_hours": 3
                }
            ],
            "tech_stack": stack,
            "learning_outcomes": [
                f"Master {skills[0] if skills else 'key technologies'}",
                "Build production-ready applications",
                "Implement best practices and design patterns",
                "Deploy and maintain live projects"
            ],
            "github_starter_repos": [
                {
                    "name": f"{role.lower().replace(' ', '-')}-starter",
                    "url": f"https://github.com/search?q={role.replace(' ', '+')}+starter+template",
                    "description": f"Starter template for {role} projects"
                }
            ],
            "step_by_step_guide": [
                {
                    "step": 1,
                    "title": "Project Setup & Planning",
                    "tasks": [
                        "Create project repository",
                        "Set up development environment",
                        "Plan architecture and features",
                        "Initialize tech stack"
                    ],
                    "estimated_time": "2 hours",
                    "resources": ["GitHub", "Tech documentation"]
                },
                {
                    "step": 2,
                    "title": "Core Development",
                    "tasks": [
                        "Build main features",
                        "Implement business logic",
                        "Create data models",
                        "Add error handling"
                    ],
                    "estimated_time": "10 hours",
                    "resources": ["Official docs", "Stack Overflow"]
                },
                {
                    "step": 3,
                    "title": "UI/UX Implementation",
                    "tasks": [
                        "Design user interface",
                        "Implement responsive layouts",
                        "Add animations and interactions",
                        "Test on multiple devices"
                    ],
                    "estimated_time": "6 hours",
                    "resources": ["Design systems", "UI libraries"]
                },
                {
                    "step": 4,
                    "title": "Testing & Deployment",
                    "tasks": [
                        "Write tests",
                        "Fix bugs and optimize",
                        "Deploy to production",
                        "Set up monitoring"
                    ],
                    "estimated_time": "4 hours",
                    "resources": ["Testing frameworks", "Deployment platforms"]
                }
            ],
            "portfolio_tips": [
                "Add live demo link in README",
                "Include screenshots and GIFs",
                "Write clear documentation",
                "Explain your design decisions",
                "Add tests and CI/CD"
            ],
            "common_challenges": [
                {
                    "challenge": "Complex state management",
                    "solution": "Use proven patterns like Redux or Context API"
                },
                {
                    "challenge": "Performance issues",
                    "solution": "Implement caching, lazy loading, and optimization"
                }
            ]
        }


# Singleton
_project_builder = None

def get_project_builder():
    """Get or create project builder service"""
    global _project_builder
    if _project_builder is None:
        _project_builder = ProjectBuilderService()
    return _project_builder
