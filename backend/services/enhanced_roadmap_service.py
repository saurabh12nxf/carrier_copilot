"""
Enhanced Roadmap Service - AI-Powered Week-by-Week Learning Plans
Generates personalized, adaptive roadmaps with real resources
"""
from typing import Dict, List
from utils.multi_llm import get_multi_llm
from services.resource_engine import get_resource_engine
import json

class EnhancedRoadmapService:
    """Generate personalized week-by-week roadmaps"""
    
    def __init__(self):
        self.llm = get_multi_llm()
        self.resource_engine = get_resource_engine()
    
    def generate_adaptive_roadmap(
        self, 
        target_role: str, 
        current_skills: List[str], 
        missing_skills: List[str],
        completion_percentage: int,
        estimated_months: int = 6
    ) -> Dict:
        """
        Generate adaptive week-by-week roadmap based on user's current level
        """
        print(f"[ROADMAP] Generating adaptive roadmap for {target_role}")
        print(f"[ROADMAP] Current skills: {len(current_skills)}, Missing: {len(missing_skills)}")
        print(f"[ROADMAP] Completion: {completion_percentage}%, Timeline: {estimated_months} months")
        
        # Calculate weeks available
        total_weeks = estimated_months * 4
        
        # Create AI prompt for week-by-week plan
        prompt = f"""You are an expert career coach creating a DETAILED week-by-week learning roadmap.

TARGET ROLE: {target_role}

CURRENT SKILLS (User already knows):
{', '.join(current_skills[:20]) if current_skills else 'Beginner - No technical skills'}

SKILLS TO LEARN (Priority order):
{', '.join(missing_skills[:15]) if missing_skills else 'All fundamentals'}

CURRENT READINESS: {completion_percentage}%
TIMELINE: {estimated_months} months ({total_weeks} weeks)

Create a DETAILED week-by-week roadmap in STRICT JSON format:

{{
  "timeline": "{estimated_months} months",
  "total_weeks": {total_weeks},
  "weekly_plan": [
    {{
      "week": 1,
      "phase": "Foundation",
      "focus": "HTML & CSS Basics",
      "topics": ["HTML5 semantic elements", "CSS selectors", "Box model"],
      "daily_tasks": [
        "Day 1: Learn HTML structure and tags",
        "Day 2: Practice CSS styling",
        "Day 3: Build a simple webpage",
        "Day 4: Learn Flexbox",
        "Day 5: Project - Personal portfolio page"
      ],
      "resources_needed": ["HTML documentation", "CSS tutorial", "Code editor"],
      "deliverable": "Simple personal webpage",
      "hours_per_day": 2
    }}
  ],
  "milestones": [
    {{
      "week": 4,
      "title": "Foundation Complete",
      "achievement": "Built 3 static websites"
    }}
  ],
  "projects": [
    {{
      "week": 4,
      "title": "Portfolio Website",
      "description": "Responsive personal portfolio with HTML/CSS",
      "skills_used": ["HTML5", "CSS3", "Responsive Design"]
    }}
  ]
}}

CRITICAL RULES:
1. Start from user's CURRENT level (they already know: {', '.join(current_skills[:5]) if current_skills else 'nothing'})
2. Focus on MISSING skills: {', '.join(missing_skills[:5]) if missing_skills else 'all basics'}
3. Each week should have:
   - Clear focus topic
   - 5 specific daily tasks
   - Realistic hours (2-3 hours/day)
   - Concrete deliverable
4. Include projects every 3-4 weeks
5. Add milestones every month
6. Make it ACTIONABLE and SPECIFIC
7. Adapt difficulty based on {completion_percentage}% readiness

Return ONLY valid JSON, no markdown."""

        # Try Multi-LLM
        llm_response = self.llm.generate(prompt, temperature=0.7, max_tokens=3000)
        
        if llm_response:
            try:
                # Parse JSON response
                roadmap_data = self._parse_json_response(llm_response)
                if roadmap_data and "weekly_plan" in roadmap_data:
                    # Add real resources
                    roadmap_data = self._add_real_resources(roadmap_data, missing_skills)
                    print(f"[ROADMAP] ✓ Generated {len(roadmap_data['weekly_plan'])} weeks with AI")
                    return roadmap_data
            except Exception as e:
                print(f"[ROADMAP] Failed to parse AI response: {e}")
        
        # Fallback to structured roadmap
        print("[ROADMAP] Using fallback structured roadmap")
        return self._generate_fallback_roadmap(
            target_role, current_skills, missing_skills, completion_percentage, total_weeks
        )
    
    def _parse_json_response(self, response: str) -> Dict:
        """Parse JSON from LLM response"""
        # Remove markdown code blocks if present
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        
        return json.loads(response.strip())
    
    def _add_real_resources(self, roadmap_data: Dict, missing_skills: List[str]) -> Dict:
        """Add real, verified resources to the roadmap"""
        # Get resources for missing skills
        for week in roadmap_data.get("weekly_plan", []):
            focus = week.get("focus", "")
            # Get relevant resources
            resources = self.resource_engine.get_resources_for_topic(focus, missing_skills)
            week["verified_resources"] = resources
        
        return roadmap_data
    
    def _generate_fallback_roadmap(
        self, 
        target_role: str, 
        current_skills: List[str],
        missing_skills: List[str], 
        completion_percentage: int,
        total_weeks: int
    ) -> Dict:
        """Generate structured fallback roadmap when AI fails"""
        
        # Determine starting level
        if completion_percentage < 30:
            start_phase = "Foundation"
            weeks_foundation = int(total_weeks * 0.4)
            weeks_intermediate = int(total_weeks * 0.4)
            weeks_advanced = total_weeks - weeks_foundation - weeks_intermediate
        elif completion_percentage < 60:
            start_phase = "Intermediate"
            weeks_foundation = int(total_weeks * 0.2)
            weeks_intermediate = int(total_weeks * 0.5)
            weeks_advanced = total_weeks - weeks_foundation - weeks_intermediate
        else:
            start_phase = "Advanced"
            weeks_foundation = 0
            weeks_intermediate = int(total_weeks * 0.3)
            weeks_advanced = total_weeks - weeks_intermediate
        
        weekly_plan = []
        week_num = 1
        
        # Foundation phase
        if weeks_foundation > 0:
            foundation_skills = missing_skills[:5] if missing_skills else ["Basics", "Fundamentals"]
            for i, skill in enumerate(foundation_skills):
                if week_num > weeks_foundation:
                    break
                weekly_plan.append({
                    "week": week_num,
                    "phase": "Foundation",
                    "focus": skill,
                    "topics": [f"Learn {skill} basics", f"Practice {skill}", f"Build mini-project"],
                    "daily_tasks": [
                        f"Day 1-2: Study {skill} fundamentals",
                        f"Day 3-4: Practice with exercises",
                        f"Day 5: Build a small project"
                    ],
                    "deliverable": f"Mini-project using {skill}",
                    "hours_per_day": 2,
                    "verified_resources": self.resource_engine.get_resources_for_topic(skill, missing_skills)
                })
                week_num += 1
        
        # Intermediate phase
        if weeks_intermediate > 0:
            intermediate_skills = missing_skills[5:10] if len(missing_skills) > 5 else missing_skills
            for i, skill in enumerate(intermediate_skills):
                if week_num > weeks_foundation + weeks_intermediate:
                    break
                weekly_plan.append({
                    "week": week_num,
                    "phase": "Intermediate",
                    "focus": skill,
                    "topics": [f"Advanced {skill}", f"Real-world applications", f"Best practices"],
                    "daily_tasks": [
                        f"Day 1-2: Deep dive into {skill}",
                        f"Day 3-4: Build practical application",
                        f"Day 5: Code review and optimization"
                    ],
                    "deliverable": f"Production-ready {skill} project",
                    "hours_per_day": 3,
                    "verified_resources": self.resource_engine.get_resources_for_topic(skill, missing_skills)
                })
                week_num += 1
        
        # Advanced phase
        if weeks_advanced > 0:
            advanced_skills = missing_skills[10:] if len(missing_skills) > 10 else ["System Design", "Best Practices"]
            for i, skill in enumerate(advanced_skills):
                if week_num > total_weeks:
                    break
                weekly_plan.append({
                    "week": week_num,
                    "phase": "Advanced",
                    "focus": skill,
                    "topics": [f"Master {skill}", f"Industry standards", f"Portfolio project"],
                    "daily_tasks": [
                        f"Day 1-3: Advanced {skill} concepts",
                        f"Day 4-5: Build portfolio project"
                    ],
                    "deliverable": f"Portfolio-worthy {skill} project",
                    "hours_per_day": 3,
                    "verified_resources": self.resource_engine.get_resources_for_topic(skill, missing_skills)
                })
                week_num += 1
        
        # Add milestones
        milestones = []
        if weeks_foundation > 0:
            milestones.append({
                "week": weeks_foundation,
                "title": "Foundation Complete",
                "achievement": f"Mastered {len(foundation_skills)} fundamental skills"
            })
        if weeks_intermediate > 0:
            milestones.append({
                "week": weeks_foundation + weeks_intermediate,
                "title": "Intermediate Level Achieved",
                "achievement": f"Built {weeks_intermediate // 2} real-world projects"
            })
        milestones.append({
            "week": total_weeks,
            "title": f"{target_role} Ready",
            "achievement": "Portfolio complete, ready for job applications"
        })
        
        # Add projects
        projects = []
        project_weeks = [weeks_foundation, weeks_foundation + weeks_intermediate // 2, total_weeks - 2]
        for i, week in enumerate(project_weeks):
            if week > 0 and week <= total_weeks:
                projects.append({
                    "week": week,
                    "title": f"{target_role} Project {i+1}",
                    "description": f"Build a complete {target_role} application",
                    "skills_used": missing_skills[:5] if missing_skills else ["Multiple skills"]
                })
        
        return {
            "timeline": f"{total_weeks // 4} months",
            "total_weeks": total_weeks,
            "starting_phase": start_phase,
            "weekly_plan": weekly_plan,
            "milestones": milestones,
            "projects": projects,
            "completion_percentage": completion_percentage,
            "adaptive": True
        }


# Singleton
_roadmap_service = None

def get_enhanced_roadmap_service():
    """Get or create enhanced roadmap service"""
    global _roadmap_service
    if _roadmap_service is None:
        _roadmap_service = EnhancedRoadmapService()
    return _roadmap_service
