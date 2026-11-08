"""
AI Career Coach Service - Context-aware chatbot for career guidance
Uses user's skills, roadmap, and progress to provide personalized advice
"""
from typing import Dict, List, Optional
from utils.multi_llm import get_multi_llm
from services.auth_service import get_user
from sqlalchemy.orm import Session
import json
from datetime import datetime

class AICoachService:
    """AI Career Coach with context awareness"""
    
    def __init__(self):
        self.llm = get_multi_llm()
        self.conversation_history = {}  # Store per user
        
    def chat(self, db: Session, email: str, message: str) -> Dict:
        """
        Chat with AI Career Coach
        
        Args:
            db: Database session
            email: User email
            message: User's question
        
        Returns:
            AI response with context
        """
        # Get user context
        user = get_user(db, email)
        if not user:
            return {
                "response": "Please login first to use the AI Career Coach.",
                "context_used": False
            }
        
        # Build context from user data
        context = self._build_user_context(user)
        
        # Get conversation history
        history = self.conversation_history.get(email, [])
        
        # Create context-aware prompt
        prompt = self._create_coach_prompt(message, context, history)
        
        # Get AI response
        print(f"[AI COACH] Generating response for: {message[:50]}...")
        print(f"[AI COACH] Available providers: {self.llm.providers}")
        response = self.llm.generate(prompt, temperature=0.7, max_tokens=500)
        print(f"[AI COACH] Response length: {len(response) if response else 0}")
        print(f"[AI COACH] Provider used: {self.llm.current_provider}")
        
        if not response:
            print(f"[AI COACH] LLM returned empty, using fallback")
            response = self._get_fallback_response(message, context)
        
        # Update conversation history
        history.append({"user": message, "ai": response, "timestamp": datetime.utcnow().isoformat()})
        self.conversation_history[email] = history[-10:]  # Keep last 10 messages
        
        return {
            "response": response,
            "context_used": True,
            "llm_provider": self.llm.current_provider,
            "user_context": {
                "skills_count": len(context["skills"]),
                "target_role": context["target_role"],
                "completion": context["completion_percentage"]
            }
        }
    
    def _build_user_context(self, user) -> Dict:
        """Build context from user data"""
        context = {
            "name": user.name,
            "email": user.email,
            "skills": user.skills.split(",") if user.skills else [],
            "target_role": user.target_role or "Not set",
            "resume_completed": user.resume_completed,
            "skill_gap_completed": user.skill_gap_completed,
            "roadmap_completed": user.roadmap_completed,
            "completion_percentage": 0
        }
        
        # Parse analysis data if available
        if user.skill_gap_analysis:
            try:
                analysis = json.loads(user.skill_gap_analysis)
                context["completion_percentage"] = analysis.get("skill_gap", {}).get("completion_percentage", 0)
                context["missing_skills"] = analysis.get("skill_gap", {}).get("missing_skills", [])
                context["matching_skills"] = analysis.get("skill_gap", {}).get("matching_skills", [])
            except:
                pass
        
        return context
    
    def _create_coach_prompt(self, message: str, context: Dict, history: List) -> str:
        """Create context-aware prompt for AI coach"""
        
        # Build conversation history
        history_text = ""
        if history:
            recent = history[-3:]  # Last 3 exchanges
            for h in recent:
                history_text += f"User: {h['user']}\nCoach: {h['ai']}\n\n"
        
        prompt = f"""You are an expert AI Career Coach helping {context['name']} achieve their career goals.

USER PROFILE:
- Current Skills: {', '.join(context['skills'][:10]) if context['skills'] else 'No skills uploaded yet'}
- Target Role: {context['target_role']}
- Progress: {context['completion_percentage']}% ready for target role
- Resume Status: {'✅ Completed' if context['resume_completed'] else '❌ Not uploaded'}
- Skill Gap Analysis: {'✅ Done' if context['skill_gap_completed'] else '❌ Not done'}
- Roadmap: {'✅ Generated' if context['roadmap_completed'] else '❌ Not generated'}

RECENT CONVERSATION:
{history_text if history_text else 'This is the first message'}

USER'S QUESTION:
{message}

INSTRUCTIONS:
1. Be a supportive, encouraging mentor (not a generic AI)
2. Use their name occasionally
3. Reference their specific skills and progress
4. Give ACTIONABLE advice (not vague)
5. Be honest but motivating
6. If they're stuck, break down the problem
7. Suggest specific next steps
8. Keep response under 150 words
9. Use emojis sparingly (1-2 max)
10. If they ask about skills they don't have, guide them to learn it

RESPONSE STYLE:
- Conversational and friendly
- Like a senior developer mentoring a junior
- Practical and specific
- Encouraging but realistic

Your response:"""

        return prompt
    
    def _get_fallback_response(self, message: str, context: Dict) -> str:
        """Fallback response if LLM fails"""
        message_lower = message.lower()
        
        # Common questions
        if "weak" in message_lower or "struggle" in message_lower:
            return f"I understand you're facing challenges. Based on your profile, I'd recommend focusing on one skill at a time. Start with the fundamentals and build projects to practice. What specific area are you finding most difficult?"
        
        elif "dsa" in message_lower or "algorithm" in message_lower:
            return "Data Structures & Algorithms are crucial! Start with arrays and strings, then move to linked lists and trees. Practice on LeetCode daily - even 1 problem helps. Want me to suggest a learning path?"
        
        elif "project" in message_lower:
            return f"Great question! For {context['target_role']}, I'd suggest building projects that showcase the skills you're learning. Start small, then increase complexity. What technologies are you comfortable with?"
        
        elif "job" in message_lower or "interview" in message_lower:
            if context['completion_percentage'] > 50:
                readiness_msg = "you're on the right track"
            else:
                readiness_msg = "focus on building your skills first"
            return f"With {context['completion_percentage']}% readiness, {readiness_msg}. Work on projects, contribute to open source, and network on LinkedIn. Need specific interview prep advice?"
        
        elif "time" in message_lower or "long" in message_lower:
            return "Learning takes time, but consistency matters more than speed. Aim for 2-3 hours daily of focused practice. You'll see progress in weeks, not months. What's your current study schedule?"
        
        else:
            return f"That's a great question! Based on your current progress ({context['completion_percentage']}% ready for {context['target_role']}), I'd recommend focusing on your missing skills first. Can you be more specific about what you need help with?"
    
    def clear_history(self, email: str):
        """Clear conversation history for user"""
        if email in self.conversation_history:
            del self.conversation_history[email]
    
    def get_history(self, email: str) -> List[Dict]:
        """Get conversation history for user"""
        return self.conversation_history.get(email, [])

    def generate_interview_questions(
        self,
        target_role: str = "Full Stack Developer",
        experience_level: str = "Mid-Level",
        interview_type: str = "Comprehensive (Mixed)",
        count: int = 4
    ) -> List[Dict]:
        """Generate structured interview questions tailored to target role and level"""
        prompt = f"""You are an elite Principal Technical Interviewer at top tech companies.
Create exactly {count} realistic, challenging interview questions for a candidate.

CANDIDATE DETAILS:
- Target Role: {target_role}
- Experience Level: {experience_level}
- Interview Focus: {interview_type}

RULES:
1. Return ONLY valid JSON as a list of question objects.
2. No markdown formatting outside the JSON, no backticks, just valid JSON array.
3. Each question object MUST follow this schema:
[
  {{
    "id": 1,
    "type": "technical" | "behavioral" | "system_design",
    "topic": "Brief topic name (e.g. Distributed Caching, Concurrency, Conflict Resolution)",
    "question": "Full interview question text addressed to the candidate",
    "hints": ["Hint or key concept 1", "Hint or key concept 2"],
    "rubric": "What interviewer is looking for in a top tier answer"
  }}
]"""
        try:
            raw_response = self.llm.generate(prompt, temperature=0.6, max_tokens=1500)
            if raw_response:
                clean_json = raw_response.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                elif clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                clean_json = clean_json.strip()
                parsed = json.loads(clean_json)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed[:count]
        except Exception as e:
            print(f"[AI COACH] Question generation error: {e}, falling back to curated bank.")

        return self._get_fallback_questions(target_role, interview_type, count)

    def evaluate_interview_answer(
        self,
        target_role: str,
        experience_level: str,
        question: str,
        question_type: str,
        user_answer: str
    ) -> Dict:
        """Evaluate a candidate's answer with multi-dimensional scoring and feedback"""
        if not user_answer or len(user_answer.strip()) < 10:
            return {
                "score": 25,
                "rating": "Needs Improvement",
                "technical_depth_score": 20,
                "communication_score": 30,
                "strengths": ["Answer submitted"],
                "improvements": [
                    "Response is too brief to evaluate technical depth or context.",
                    "Elaborate on specific architectural tradeoffs, concrete examples, or technical metrics."
                ],
                "feedback": "Your answer was too brief. Try to structure your answer using specific examples, concrete technical tools, and problem-solving methodology.",
                "ideal_answer": f"For {target_role}, an ideal answer would provide concrete context, discuss specific architectural patterns or tradeoffs, and explain rationale with real-world examples."
            }

        prompt = f"""You are a strict, world-class Principal Engineering Interviewer evaluating a candidate's response.

ROLE: {target_role} ({experience_level})
QUESTION TYPE: {question_type}
INTERVIEW QUESTION:
"{question}"

CANDIDATE'S SUBMITTED ANSWER:
"{user_answer}"

STRICT EVALUATION CRITERIA:
1. RELEVANCE FIRST (CRUCIAL):
   - Determine if the candidate actually answered the question asked.
   - If the answer is OFF-TOPIC, unrelated, gibberish, repetitive filler words, or says "I don't know":
     Assign a score between 5 and 25 (rating: "Off-Topic / Incomplete").
     Do NOT award good marks for unrelated speech, filler words, or repeated phrases!
   - State clearly in feedback: "The response was off-topic or did not address the question asked."
2. ACCURACY & TECHNICAL DEPTH:
   - High scores (75+) are reserved ONLY for answers that directly explain the specific mechanisms, tradeoffs, and concepts asked in the question.
   - Average answers (50-70) touch on the right concepts but miss key details or metrics.
3. CONSTRUCTIVE HONESTY:
   - Provide realistic, accurate ratings. Never falsely praise a superficial or irrelevant answer.

Return ONLY valid JSON matching this schema:
{{
  "score": <integer from 0 to 100>,
  "rating": "<Strong Hire | Good | Needs Improvement | Off-Topic / Incomplete>",
  "technical_depth_score": <integer from 0 to 100>,
  "communication_score": <integer from 0 to 100>,
  "feedback": "<2-3 sentences concise, honest feedback directly critiquing whether and how well they answered>",
  "strengths": [
    "<Concrete thing done well, or 'Attempted to provide an answer' if off-topic>"
  ],
  "improvements": [
    "<Crucial missing technical concept or topic that must be covered>",
    "<How to structure this answer effectively for top tech interviews>"
  ],
  "ideal_answer": "<A comprehensive, articulate model answer demonstrating how a top 5% candidate would answer this question>"
}}"""

        try:
            raw_response = self.llm.generate(prompt, temperature=0.3, max_tokens=1500)
            if raw_response:
                clean_json = raw_response.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                elif clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                clean_json = clean_json.strip()
                parsed = json.loads(clean_json)
                if "score" in parsed:
                    return parsed
        except Exception as e:
            print(f"[AI COACH] Answer evaluation error: {e}, falling back to rule-based evaluation.")

        return self._get_fallback_evaluation(target_role, question, user_answer)

    def summarize_interview_session(self, target_role: str, evaluations: List[Dict]) -> Dict:
        """Generate final interview session scorecard and recommendations"""
        if not evaluations:
            return {
                "overall_score": 0,
                "recommendation": "Needs Preparation",
                "summary": "No answers evaluated.",
                "top_strengths": [],
                "key_focus_areas": ["Practice complete mock sessions."]
            }

        avg_score = int(sum(e.get("score", 0) for e in evaluations) / len(evaluations))
        avg_tech = int(sum(e.get("technical_depth_score", 0) for e in evaluations) / len(evaluations))
        avg_comm = int(sum(e.get("communication_score", 0) for e in evaluations) / len(evaluations))

        if avg_score >= 85:
            rec = "Strong Hire"
        elif avg_score >= 72:
            rec = "Hire / Advance"
        elif avg_score >= 58:
            rec = "Borderline / Needs Polish"
        else:
            rec = "Needs Focused Preparation"

        all_strengths = []
        all_improvements = []
        for e in evaluations:
            all_strengths.extend(e.get("strengths", []))
            all_improvements.extend(e.get("improvements", []))

        # Take unique top strengths & improvements
        top_strengths = list(dict.fromkeys(all_strengths))[:4]
        key_focus_areas = list(dict.fromkeys(all_improvements))[:4]

        return {
            "overall_score": avg_score,
            "technical_average": avg_tech,
            "communication_average": avg_comm,
            "recommendation": rec,
            "total_questions": len(evaluations),
            "summary": f"Completed mock interview session for {target_role}. Demonstrated solid baseline competency with an average score of {avg_score}%.",
            "top_strengths": top_strengths,
            "key_focus_areas": key_focus_areas
        }

    def _get_fallback_questions(self, target_role: str, interview_type: str, count: int) -> List[Dict]:
        """Curated bank of interview questions tailored to popular roles"""
        role_lower = target_role.lower()

        if "frontend" in role_lower or "react" in role_lower:
            pool = [
                {
                    "id": 1,
                    "type": "technical",
                    "topic": "Rendering & React Performance",
                    "question": "Can you explain how React's reconciliation algorithm and Virtual DOM work, and what strategies you use to eliminate unnecessary re-renders in large applications?",
                    "hints": ["Fiber architecture", "useMemo / useCallback / React.memo", "State colocation"],
                    "rubric": "Candidate explains diffing heuristics, reconciliation phase vs commit phase, and demonstrates practical optimization methods."
                },
                {
                    "id": 2,
                    "type": "technical",
                    "topic": "Browser Networking & State Management",
                    "question": "How do you handle client-side caching, data invalidation, and optimistic updates when building interactive web apps?",
                    "hints": ["TanStack Query / SWR / Redux Toolkit Query", "Cache keys & mutation invalidation", "Rollback on error"],
                    "rubric": "Candidate clearly explains cache strategies (stale-while-revalidate), network latency hiding, and error rollbacks."
                },
                {
                    "id": 3,
                    "type": "system_design",
                    "topic": "Frontend Architecture",
                    "question": "Design an infinite scroll feed component (like Twitter/LinkedIn) that remains responsive and fast with thousands of rich media cards.",
                    "hints": ["DOM Virtualization (react-window / virtualizer)", "Intersection Observer API", "Image lazy loading & skeleton states"],
                    "rubric": "Looks for windowing / virtualization to keep DOM light, memory management, and smooth scroll performance."
                },
                {
                    "id": 4,
                    "type": "behavioral",
                    "topic": "Cross-Functional Collaboration (STAR)",
                    "question": "Tell me about a time when a product manager or designer requested a complex feature with an unrealistic deadline. How did you negotiate scope while maintaining code quality?",
                    "hints": ["Situation & Task", "Phased rollout / MVP breakdown", "Clear communication on technical debt"],
                    "rubric": "Looks for constructive compromise, technical tradeoff explanation, and delivery without burnout."
                }
            ]
        elif "backend" in role_lower or "api" in role_lower or "python" in role_lower:
            pool = [
                {
                    "id": 1,
                    "type": "technical",
                    "topic": "Database Concurrency & Transactions",
                    "question": "Explain ACID properties and how database isolation levels (Read Committed vs Repeatable Read vs Serializable) prevent concurrency anomalies like phantom reads or race conditions.",
                    "hints": ["ACID breakdown", "Optimistic vs Pessimistic locking", "Isolation anomalies"],
                    "rubric": "Candidate accurately defines isolation levels, locking mechanisms, and practical locking in high-throughput APIs."
                },
                {
                    "id": 2,
                    "type": "technical",
                    "topic": "API Security & Rate Limiting",
                    "question": "How would you design and implement distributed rate limiting for an API cluster handling millions of requests per day?",
                    "hints": ["Token Bucket / Leaky Bucket algorithm", "Redis atomic operations / Lua scripts", "HTTP 429 Retry-After headers"],
                    "rubric": "Looks for algorithm selection, distributed state management via Redis, and proper client response semantics."
                },
                {
                    "id": 3,
                    "type": "system_design",
                    "topic": "High-Throughput Asynchronous Architecture",
                    "question": "Design a resilient asynchronous task processing pipeline for handling large PDF/video processing without degrading user request latencies.",
                    "hints": ["Message brokers (RabbitMQ / Kafka / Celery)", "Dead letter queues & retries", "Idempotency keys"],
                    "rubric": "Candidate decouples HTTP layer from worker pools, designs retry logic with exponential backoff, and ensures idempotency."
                },
                {
                    "id": 4,
                    "type": "behavioral",
                    "topic": "Root Cause Analysis & Incident Management",
                    "question": "Describe a critical production outage or data inconsistency issue you encountered. Walk me through how you mitigated the incident and implemented permanent guardrails.",
                    "hints": ["Monitoring & Alerting", "Incident mitigation vs root-cause fix", "Blameless post-mortem"],
                    "rubric": "Assesses systematic debugging under pressure, telemetry, and prevention culture."
                }
            ]
        else:
            # Default Full Stack / Software Engineering Pool
            pool = [
                {
                    "id": 1,
                    "type": "technical",
                    "topic": "End-to-End System Architecture",
                    "question": "Walk me through what happens under the hood when a user types an authenticated URL into their browser, clicks submit, and updates a database record. Detail networking, auth verification, and persistence layers.",
                    "hints": ["DNS & TLS handshake", "Reverse proxy / CORS", "JWT validation / Session store", "Database connection pool"],
                    "rubric": "Demonstrates holistic comprehension of network layers, backend middleware, and persistence tradeoffs."
                },
                {
                    "id": 2,
                    "type": "technical",
                    "topic": "Caching Strategy & Cache Invalidation",
                    "question": "Explain the differences between Cache-Aside, Write-Through, and Write-Behind caching patterns. When would you choose one over another, and how do you handle cache invalidation?",
                    "hints": ["Redis / Memcached", "Read-heavy vs Write-heavy access patterns", "Cache stampede / Thundering herd prevention"],
                    "rubric": "Candidate explains data freshness vs latency tradeoffs, thundering herd mitigation, and distributed cache sync."
                },
                {
                    "id": 3,
                    "type": "system_design",
                    "topic": "Scalable System Design",
                    "question": "Design a URL shortening service like Bitly with high read availability (100:1 read to write ratio), sub-50ms latency, and analytics tracking.",
                    "hints": ["Base62 encoding vs UUID hash", "Database indexing & partitioning", "Edge CDN / Redis caching", "Asynchronous click stream logging"],
                    "rubric": "Candidate calculates basic scale, chooses storage engines, designs the short-code generation algorithm, and caches hot URLs."
                },
                {
                    "id": 4,
                    "type": "behavioral",
                    "topic": "STAR Behavioral: Technical Disagreement",
                    "question": "Tell me about a time you had a strong technical disagreement with a team member about architecture or framework selection. How did you resolve it and keep the team aligned?",
                    "hints": ["Situation & Objective", "Data-driven proof of concept / benchmarks", "Commitment to team decision"],
                    "rubric": "Looks for emotional intelligence, objective evaluation criteria (benchmarks/POCs), and bias for action."
                }
            ]

        return pool[:count]

    def _get_fallback_evaluation(self, target_role: str, question: str, user_answer: str) -> Dict:
        """Rule-based evaluation fallback when LLM is unavailable"""
        import re

        clean_text = user_answer.strip().lower()
        words = [re.sub(r'[^a-zA-Z0-9]', '', w) for w in clean_text.split()]
        words = [w for w in words if w]
        total_words = len(words)

        # 1. Repetition / transcription loop check
        if total_words >= 12:
            unique_ratio = len(set(words)) / total_words
            if unique_ratio < 0.38:
                return {
                    "score": 15,
                    "rating": "Repetitive / Incoherent",
                    "technical_depth_score": 10,
                    "communication_score": 20,
                    "feedback": "The submitted audio transcript contains repeatedly looped phrases and lacks coherent technical explanation. Please speak clearly into your microphone or type your answer.",
                    "strengths": ["Audio input received"],
                    "improvements": [
                        "Avoid repeated phrases and structure your response into clear bullet points.",
                        "Directly state the technical steps before expanding on details."
                    ],
                    "ideal_answer": f"For {target_role}, clearly articulate your response step-by-step rather than repeating phrases."
                }

        # 2. Extract core keywords from question (excluding common stop words)
        stop_words = {
            "what", "when", "where", "which", "who", "whom", "this", "that", "these", "those",
            "have", "has", "had", "having", "do", "does", "did", "doing", "would", "should",
            "could", "ought", "how", "why", "can", "you", "walk", "tell", "about", "your",
            "the", "and", "under", "hood", "types", "into", "their", "clicks", "detail", "with",
            "from", "into", "during", "before", "after", "above", "below", "between"
        }
        q_tokens = [re.sub(r'[^a-zA-Z0-9]', '', w.lower()) for w in question.split()]
        key_q_words = [w for w in q_tokens if len(w) > 3 and w not in stop_words]

        # 3. Check question keyword match against user's answer
        answer_word_set = set(words)
        matched_q_words = [w for w in key_q_words if w in answer_word_set]

        # If question had clear technical terms but candidate mentioned NONE of them
        if len(key_q_words) >= 3 and len(matched_q_words) == 0 and total_words < 40:
            return {
                "score": 18,
                "rating": "Off-Topic / Irrelevant",
                "technical_depth_score": 10,
                "communication_score": 25,
                "feedback": f"Your response did not address the specific question asked. The question asks about {', '.join(key_q_words[:4])}, but your response was unrelated.",
                "strengths": ["Attempted response"],
                "improvements": [
                    f"Address the question's core concepts directly: {', '.join(key_q_words[:4])}.",
                    "Avoid generic filler words and focus on the technical mechanisms requested."
                ],
                "ideal_answer": f"A direct answer should explain: {', '.join(key_q_words[:5])}."
            }

        # 4. Technical vocabulary depth check
        tech_keywords = [
            "tradeoff", "latency", "scale", "cache", "redis", "database", "index",
            "concurrency", "async", "lock", "component", "state", "test", "metric",
            "api", "security", "jwt", "star", "result", "action", "architecture",
            "reconciliation", "fiber", "render", "hook", "query", "virtual", "dns",
            "tls", "session", "cookie", "sql", "nosql", "postgres", "kafka", "docker"
        ]
        tech_hits = sum(1 for kw in tech_keywords if kw in answer_word_set)

        # Baseline calculation based on relevance and substance
        match_score = min(40, len(matched_q_words) * 12)
        tech_score = min(30, tech_hits * 6)
        length_score = min(20, int(total_words * 0.3)) if total_words >= 15 else 5
        base_score = min(92, 10 + match_score + tech_score + length_score)

        if base_score >= 80:
            rating = "Strong Hire"
            feedback = "Comprehensive and well-structured response that covers key technical principles and directly answers the question."
        elif base_score >= 60:
            rating = "Good"
            feedback = "Solid answer demonstrating domain understanding. Could be elevated by mentioning specific architectural metrics and concrete edge cases."
        elif base_score >= 35:
            rating = "Needs Improvement"
            feedback = "The answer partially touches on the topic but lacks technical depth, concrete examples, or structured problem solving."
        else:
            rating = "Off-Topic / Incomplete"
            feedback = "The submitted answer lacks sufficient relevance to the question. Focus directly on the technical mechanisms requested."

        return {
            "score": base_score,
            "rating": rating,
            "technical_depth_score": max(10, min(95, base_score - 2)),
            "communication_score": max(20, min(95, base_score + 3)),
            "feedback": feedback,
            "strengths": [
                f"Referenced {len(matched_q_words)} question concepts ({', '.join(matched_q_words[:3])})." if matched_q_words else "Attempted to answer the prompt.",
                f"Used relevant technical terminology ({tech_hits} domain terms)." if tech_hits > 0 else "Kept response clear."
            ],
            "improvements": [
                "Include quantifiable metrics (e.g. latency targets, throughput, or benchmarks).",
                "Discuss potential failure modes or edge-case handling under production loads."
            ],
            "ideal_answer": f"A standout answer for a {target_role} role explicitly states the core objective, outlines the high-level architecture with clear tradeoffs, elaborates on concrete failure modes, and concludes with testing and observability strategies."
        }


# Singleton
_ai_coach = None

def get_ai_coach() -> AICoachService:
    """Get or create AI Coach service"""
    global _ai_coach
    if _ai_coach is None:
        _ai_coach = AICoachService()
    return _ai_coach
