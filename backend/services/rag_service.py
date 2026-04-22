"""
RAG Service - Orchestrates the entire RAG pipeline
UPGRADED: Now with Multi-LLM support (Gemini → OpenAI → Groq → Fallback)
"""
from typing import Dict, List
from rag.embedder import get_embedder
from rag.vector_store import VectorStore
from rag.retriever import Retriever
from utils.multi_llm import get_multi_llm
from utils.parser import parse_json_response
from services.fallback_analyzer import get_fallback_analyzer
from services.resource_engine import get_resource_engine
from services.skill_intelligence import get_skill_intelligence
import json

class RAGService:
    def __init__(self):
        self.embedder = get_embedder()
        self.vector_store = VectorStore()
        self.retriever = Retriever()
        self.llm = get_multi_llm()  # Multi-LLM with automatic fallback
        self.fallback = get_fallback_analyzer()
        self.resource_engine = get_resource_engine()
        self.skill_intel = get_skill_intelligence()
        
        status = self.llm.get_status()
        print(f"[RAG] ✨ Enhanced RAG service initialized")
        print(f"[RAG] 🤖 Available LLMs: {', '.join(status['available_providers'])}")
        
    def analyze_role_with_rag(self, user_skills: List[str], target_role: str) -> Dict:
        """Complete RAG pipeline with vector DB"""
        retrieved_docs = self.retriever.retrieve_relevant_roles(target_role, top_k=3)
        context = self._build_context_from_roles(retrieved_docs)
        prompt = self._create_analysis_prompt(user_skills, target_role, context)
        llm_response = self.llm.generate(prompt)
        parsed_result = parse_json_response(llm_response)
        return parsed_result
    
    def analyze_with_job_description(self, user_skills: List[str], target_role: str, job_description: str) -> Dict:
        """
        Enhanced analysis using custom job description
        FULLY DYNAMIC - works for ANY job description
        """
        print(f"[RAG] Analyzing with JD for role: {target_role}")
        
        # Try Gemini first
        if self.llm.gemini_available:
            try:
                prompt = f"""You are an expert AI career advisor. Analyze this job description and compare with candidate's skills.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S CURRENT SKILLS:
{', '.join(user_skills) if user_skills else 'No skills listed'}

TARGET ROLE: {target_role}

Provide comprehensive analysis in STRICT JSON format (no markdown):

{{
  "required_skills": ["skill1", "skill2", ...],
  "matching_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "completion_percentage": 75,
  "role_level": "entry/mid/senior",
  "strengths": ["strength1", "strength2", "strength3"],
  "focus_areas": ["area1", "area2", "area3"],
  "estimated_time": "X-Y months",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}}

GUIDELINES:
1. Extract ALL skills from job description
2. Match with candidate skills (handle synonyms: JS=JavaScript, React.js=React)
3. Calculate accurate completion percentage
4. Identify top 3 strengths
5. Suggest 3 focus areas
6. Provide realistic time estimate
7. Give 3 actionable recommendations

Return ONLY valid JSON."""

                llm_response = self.llm.generate(prompt)
                if llm_response:
                    parsed_result = parse_json_response(llm_response)
                    if parsed_result:
                        print("[RAG] ✓ Gemini analysis successful")
                        return parsed_result
            except Exception as e:
                print(f"[RAG] Gemini failed: {e}")
        
        # Fallback to rule-based analyzer
        print("[RAG] Using fallback analyzer (no API required)")
        return self.fallback.analyze_with_job_description(user_skills, target_role, job_description)
    
    def analyze_role_dynamic(self, user_skills: List[str], target_role: str) -> Dict:
        """
        UPGRADED: Fully dynamic role analysis with LATEST industry standards
        Uses Multi-LLM (Gemini → OpenAI → Groq) with automatic fallback
        """
        print(f"[RAG] 🚀 Performing ENHANCED dynamic analysis...")
        
        # Get role intelligence first
        role_intel = self.skill_intel.get_role_intelligence(target_role, "entry")
        print(f"[RAG] 💰 Salary: {role_intel['salary_range_lpa']} LPA | Demand: {role_intel['market_demand']}")
        
        # Try Multi-LLM (will automatically try Gemini → OpenAI → Groq)
        if self.llm.is_available:
            try:
                print(f"[RAG] 🤖 Using Multi-LLM (trying: {', '.join(self.llm.providers[:-1])})...")
                prompt = f"""You are an expert AI career advisor with REAL-TIME knowledge of tech industry (2024-2026).

CANDIDATE'S SKILLS:
{', '.join(user_skills) if user_skills else 'Beginner (No technical skills yet)'}

TARGET ROLE: {target_role}

MARKET CONTEXT:
- Salary Range: {role_intel['salary_range_lpa']} LPA
- Market Demand: {role_intel['market_demand']}
- Difficulty: {role_intel['difficulty']}
- Top Companies: {', '.join(role_intel['top_companies'][:3])}

TASK: Provide ACCURATE, INDUSTRY-STANDARD analysis in STRICT JSON format:

{{
  "required_skills": ["skill1", "skill2", ...],
  "matching_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "completion_percentage": 75,
  "role_level": "entry/mid/senior",
  "strengths": ["strength1", "strength2", "strength3"],
  "focus_areas": ["area1", "area2", "area3"],
  "estimated_time": "X-Y months",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}}

CRITICAL REQUIREMENTS:
1. List 12-15 ESSENTIAL skills for {target_role} in 2024-2026
2. Include LATEST technologies and frameworks
3. Match candidate skills intelligently (JS=JavaScript, React.js=React, etc.)
4. Calculate ACCURATE completion percentage
5. Identify top 3 REAL strengths (or growth potential if beginner)
6. Suggest 3 HIGH-PRIORITY focus areas
7. Provide REALISTIC time estimate based on current skills
8. Give 3 ACTIONABLE recommendations with specific steps

IMPORTANT:
- Use CURRENT industry standards (not outdated)
- Consider what companies are ACTUALLY hiring for
- Be honest but encouraging
- Prioritize in-demand skills

Return ONLY valid JSON, no markdown, no explanations."""

                llm_response = self.llm.generate(prompt, temperature=0.2)
                
                if llm_response:
                    parsed_result = parse_json_response(llm_response)
                    if parsed_result:
                        # Enhance with skill intelligence
                        parsed_result = self._enhance_with_intelligence(parsed_result, target_role)
                        print(f"[RAG] ✅ Analysis successful with {self.llm.current_provider}")
                        return parsed_result
            except Exception as e:
                print(f"[RAG] ⚠️ Multi-LLM failed: {e}")
        
        # Fallback to rule-based analyzer
        print("[RAG] 🔄 Using rule-based fallback analyzer")
        result = self.fallback.analyze_role(user_skills, target_role)
        return self._enhance_with_intelligence(result, target_role)
    
    def generate_roadmap_with_rag(self, user_skills: List[str], missing_skills: List[str], target_role: str) -> Dict:
        """Generate roadmap using RAG"""
        retrieved_docs = self.retriever.retrieve_relevant_roles(f"{target_role} learning path", top_k=3)
        context = self._build_context_from_roles(retrieved_docs)
        prompt = self._create_roadmap_prompt(user_skills, missing_skills, target_role, context)
        llm_response = self.llm.generate(prompt)
        roadmap = parse_json_response(llm_response)
        return roadmap
    
    def generate_enhanced_roadmap(self, user_skills: List[str], missing_skills: List[str], 
                                  target_role: str, job_description: str = None) -> Dict:
        """
        UPGRADED: Generate ACTIONABLE roadmap with REAL resources
        Uses Multi-LLM (Gemini → OpenAI → Groq) with automatic fallback
        """
        print(f"[RAG] 🎯 Generating ENHANCED roadmap with real resources...")
        
        # Prioritize skills based on demand and difficulty
        prioritized_skills = self.skill_intel.prioritize_skills(missing_skills, "job_ready")
        print(f"[RAG] 📊 Prioritized {len(prioritized_skills)} skills by demand & difficulty")
        
        # Try Multi-LLM with ENHANCED prompt
        if self.llm.is_available:
            try:
                print(f"[RAG] 🤖 Using Multi-LLM for roadmap generation...")
                context_info = ""
                if job_description:
                    context_info = f"\n\nJob Description Context:\n{job_description[:800]}..."
                
                # Get skill priorities for prompt
                priority_list = [f"{s['skill']} (Priority: {s['priority_score']}, Demand: {s['intelligence']['demand']})" 
                                for s in prioritized_skills[:10]]
                
                prompt = f"""You are an expert AI career mentor creating ACTIONABLE learning roadmaps.

TARGET ROLE: {target_role}
CURRENT SKILLS: {', '.join(user_skills) if user_skills else 'Beginner'}
SKILLS TO LEARN (Prioritized): {', '.join(priority_list)}
{context_info}

Create a DETAILED, ACTIONABLE roadmap in STRICT JSON format:

{{
  "beginner": [
    {{
      "title": "Skill/Topic Name",
      "duration": "X weeks",
      "description": "Specific learning goals and what to build",
      "why": "Why this is crucial for {target_role} role",
      "key_concepts": ["concept1", "concept2", "concept3"],
      "projects": ["Specific project 1", "Specific project 2"]
    }}
  ],
  "intermediate": [...],
  "advanced": [...]
}}

CRITICAL REQUIREMENTS:
1. SKIP skills user already has
2. Focus on HIGH-PRIORITY missing skills
3. Provide 2-4 items per level (beginner/intermediate/advanced)
4. Be SPECIFIC and ACTIONABLE (not vague)
5. Include REALISTIC time estimates
6. Suggest CONCRETE projects (not generic)
7. Explain WHY each skill matters
8. List KEY CONCEPTS to master
9. Ensure LOGICAL progression
10. Prioritize IN-DEMAND skills first

QUALITY STANDARDS:
- Each item should be a mini-course outline
- Projects should be portfolio-worthy
- Time estimates should be realistic for dedicated learning
- Descriptions should guide what to learn, not just name the skill

Return ONLY valid JSON."""

                llm_response = self.llm.generate(prompt, temperature=0.3)
                if llm_response:
                    roadmap = parse_json_response(llm_response)
                    if roadmap and all(level in roadmap for level in ["beginner", "intermediate", "advanced"]):
                        # ENHANCE with real resources
                        roadmap = self._add_resources_to_roadmap(roadmap)
                        print(f"[RAG] ✅ Roadmap generated with {self.llm.current_provider} + REAL resources")
                        return roadmap
            except Exception as e:
                print(f"[RAG] ⚠️ Multi-LLM roadmap failed: {e}")
        
        # Fallback to rule-based generator
        print("[RAG] 🔄 Using fallback roadmap generator")
        roadmap = self.fallback.generate_roadmap(user_skills, missing_skills, target_role)
        return self._add_resources_to_roadmap(roadmap)
    
    def _add_resources_to_roadmap(self, roadmap: Dict) -> Dict:
        """
        Add REAL resources to roadmap items
        YouTube, GitHub, Docs, Courses
        """
        print("[RAG] 📚 Adding real learning resources...")
        
        for level in ["beginner", "intermediate", "advanced"]:
            if level in roadmap:
                for item in roadmap[level]:
                    skill = item.get("title", "")
                    
                    # Get resources from resource engine
                    resources = self.resource_engine.get_resources(skill, level)
                    
                    # Add to roadmap item
                    item["resources"] = {
                        "documentation": resources["documentation"],
                        "youtube_courses": resources["youtube"][:2],  # Top 2
                        "practice_projects": resources["projects"][:2],  # Top 2
                        "courses": resources["courses"][:2],  # Top 2
                        "github_search": resources["github_search"],
                        "practice_platforms": resources["practice"]
                    }
                    
                    # Add skill intelligence
                    skill_intel = self.skill_intel.get_skill_intelligence(skill)
                    item["intelligence"] = {
                        "demand": skill_intel["demand"],
                        "difficulty": skill_intel["difficulty"],
                        "learning_time": skill_intel["learning_time"],
                        "salary_impact": skill_intel["salary_impact"]
                    }
        
        print("[RAG] ✅ Resources added to all roadmap items")
        return roadmap
    
    def _enhance_with_intelligence(self, analysis: Dict, target_role: str) -> Dict:
        """
        Enhance analysis with skill intelligence data
        """
        # Add role intelligence
        role_intel = self.skill_intel.get_role_intelligence(target_role, analysis.get("role_level", "entry"))
        
        analysis["role_intelligence"] = {
            "salary_range_lpa": role_intel["salary_range_lpa"],
            "market_demand": role_intel["market_demand"],
            "difficulty": role_intel["difficulty"],
            "time_to_learn": role_intel["time_to_learn"],
            "growth_potential": role_intel["growth_potential"],
            "job_openings": role_intel["job_openings"],
            "remote_friendly": role_intel["remote_friendly"],
            "top_companies": role_intel["top_companies"]
        }
        
        # Add intelligence for missing skills
        if "missing_skills" in analysis:
            prioritized = self.skill_intel.prioritize_skills(analysis["missing_skills"], "job_ready")
            analysis["skill_priorities"] = [
                {
                    "skill": s["skill"],
                    "priority_score": s["priority_score"],
                    "demand": s["intelligence"]["demand"],
                    "difficulty": s["intelligence"]["difficulty"],
                    "learning_time": s["intelligence"]["learning_time"]
                }
                for s in prioritized[:10]
            ]
        
        return analysis
    
    def _build_context_from_roles(self, retrieved_docs: List[Dict]) -> str:
        """Build context from retrieved documents"""
        context_parts = []
        for i, doc in enumerate(retrieved_docs, 1):
            context_parts.append(f"""Reference {i}: {doc.get('role_name', 'Unknown')}
Skills: {', '.join(doc.get('skills', []))}
Tools: {', '.join(doc.get('tools', []))}
Description: {doc.get('description', '')}
""")
        return "\n".join(context_parts)
    
    def _create_analysis_prompt(self, user_skills: List[str], target_role: str, context: str) -> str:
        """Create analysis prompt"""
        user_skills_str = ", ".join(user_skills) if user_skills else "none"
        
        prompt = f"""You are an AI career advisor. Analyze skill gap for {target_role}.

User's Skills: {user_skills_str}

Job Market Data:
{context}

Provide analysis in STRICT JSON format:

{{
  "required_skills": ["skill1", "skill2", ...],
  "matching_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "completion_percentage": 75,
  "role_level": "mid",
  "strengths": ["strength1", "strength2", "strength3"],
  "focus_areas": ["area1", "area2", "area3"],
  "estimated_time": "3-6 months"
}}

Return ONLY valid JSON."""
        
        return prompt
    
    def _create_roadmap_prompt(self, user_skills: List[str], missing_skills: List[str], target_role: str, context: str) -> str:
        """Create roadmap prompt"""
        user_skills_str = ", ".join(user_skills) if user_skills else "none"
        missing_skills_str = ", ".join(missing_skills) if missing_skills else "none"
        
        prompt = f"""Create learning roadmap for {target_role}.

Current Skills: {user_skills_str}
Skills to Learn: {missing_skills_str}

Context:
{context}

Provide roadmap in STRICT JSON format:

{{
  "beginner": [{{"title": "Topic", "duration": "2 weeks", "description": "What to learn", "why": "Why matters"}}],
  "intermediate": [{{"title": "Topic", "duration": "3 weeks", "description": "What to learn", "why": "Why matters"}}],
  "advanced": [{{"title": "Topic", "duration": "4 weeks", "description": "What to learn", "why": "Why matters"}}]
}}

Return ONLY valid JSON."""
        
        return prompt

# Singleton
_rag_service = None

def get_rag_service() -> RAGService:
    """Get or create RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
