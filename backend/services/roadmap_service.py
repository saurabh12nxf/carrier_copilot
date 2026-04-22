import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

# Mock roadmaps for different roles
MOCK_ROADMAPS = {
    "frontend developer": {
        "beginner": [
            {"title": "HTML & CSS Basics", "duration": "2 weeks", "description": "Learn HTML5 semantic elements and CSS fundamentals"},
            {"title": "JavaScript Fundamentals", "duration": "4 weeks", "description": "Master variables, functions, DOM manipulation"},
            {"title": "Responsive Design", "duration": "2 weeks", "description": "Learn Flexbox, Grid, and mobile-first design"}
        ],
        "intermediate": [
            {"title": "React.js", "duration": "6 weeks", "description": "Components, hooks, state management"},
            {"title": "TypeScript", "duration": "3 weeks", "description": "Type safety and advanced TypeScript patterns"},
            {"title": "Build Tools", "duration": "2 weeks", "description": "Webpack, Vite, and modern build pipelines"}
        ],
        "advanced": [
            {"title": "Advanced React Patterns", "duration": "4 weeks", "description": "Performance optimization, custom hooks, context"},
            {"title": "Testing", "duration": "3 weeks", "description": "Jest, React Testing Library, E2E testing"},
            {"title": "Next.js & SSR", "duration": "4 weeks", "description": "Server-side rendering and static generation"}
        ]
    },
    "backend developer": {
        "beginner": [
            {"title": "Python Basics", "duration": "3 weeks", "description": "Syntax, data structures, OOP concepts"},
            {"title": "SQL Fundamentals", "duration": "2 weeks", "description": "Queries, joins, database design"},
            {"title": "REST API Basics", "duration": "2 weeks", "description": "HTTP methods, status codes, API design"}
        ],
        "intermediate": [
            {"title": "FastAPI/Django", "duration": "5 weeks", "description": "Build production-ready APIs"},
            {"title": "Database Management", "duration": "4 weeks", "description": "PostgreSQL, MongoDB, ORMs"},
            {"title": "Authentication", "duration": "2 weeks", "description": "JWT, OAuth, security best practices"}
        ],
        "advanced": [
            {"title": "Microservices", "duration": "5 weeks", "description": "Service architecture, message queues"},
            {"title": "Docker & Kubernetes", "duration": "4 weeks", "description": "Containerization and orchestration"},
            {"title": "Performance Optimization", "duration": "3 weeks", "description": "Caching, load balancing, scaling"}
        ]
    },
    "data scientist": {
        "beginner": [
            {"title": "Python for Data Science", "duration": "4 weeks", "description": "NumPy, Pandas basics"},
            {"title": "Statistics Fundamentals", "duration": "3 weeks", "description": "Probability, distributions, hypothesis testing"},
            {"title": "Data Visualization", "duration": "2 weeks", "description": "Matplotlib, Seaborn, Plotly"}
        ],
        "intermediate": [
            {"title": "Machine Learning", "duration": "6 weeks", "description": "Scikit-learn, supervised/unsupervised learning"},
            {"title": "SQL & Databases", "duration": "3 weeks", "description": "Complex queries, data warehousing"},
            {"title": "Feature Engineering", "duration": "2 weeks", "description": "Data preprocessing and transformation"}
        ],
        "advanced": [
            {"title": "Deep Learning", "duration": "8 weeks", "description": "TensorFlow, PyTorch, neural networks"},
            {"title": "MLOps", "duration": "4 weeks", "description": "Model deployment, monitoring, CI/CD"},
            {"title": "Big Data", "duration": "5 weeks", "description": "Spark, distributed computing"}
        ]
    }
}

async def generate_roadmap(target_role: str) -> Dict:
    target_role_lower = target_role.strip().lower()
    
    # Check if we have a predefined roadmap
    if target_role_lower in MOCK_ROADMAPS:
        return {
            "target_role": target_role,
            "roadmap": MOCK_ROADMAPS[target_role_lower],
            "total_duration": "6-12 months",
            "source": "curated"
        }
    
    # Generic roadmap for unknown roles
    return {
        "target_role": target_role,
        "roadmap": {
            "beginner": [
                {"title": "Fundamentals", "duration": "4 weeks", "description": f"Learn the basics of {target_role}"},
                {"title": "Core Concepts", "duration": "4 weeks", "description": "Master essential concepts and tools"}
            ],
            "intermediate": [
                {"title": "Practical Projects", "duration": "8 weeks", "description": "Build real-world projects"},
                {"title": "Best Practices", "duration": "4 weeks", "description": "Learn industry standards"}
            ],
            "advanced": [
                {"title": "Specialization", "duration": "8 weeks", "description": "Deep dive into advanced topics"},
                {"title": "Portfolio Building", "duration": "4 weeks", "description": "Create impressive portfolio"}
            ]
        },
        "total_duration": "6-9 months",
        "source": "generic"
    }
