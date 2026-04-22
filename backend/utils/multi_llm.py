"""
Multi-LLM Service with Automatic Fallback
Tries multiple LLM providers in order: Gemini → OpenAI → Groq → Fallback
"""
import os
import logging
from typing import Optional, Dict
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class MultiLLM:
    """
    Multi-LLM service with automatic fallback
    Priority: Gemini (free) → OpenAI (paid) → Groq (free) → Rule-based
    """
    
    def __init__(self):
        """Initialize all available LLM providers"""
        self.providers = []
        self.current_provider = None
        
        # Try to initialize Gemini
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('models/gemini-flash-latest')
                # Test it
                test = self.gemini_model.generate_content("Hi", generation_config=genai.types.GenerationConfig(max_output_tokens=5))
                if test:
                    self.providers.append("gemini")
                    logger.info("✅ Gemini initialized")
        except Exception as e:
            logger.warning(f"⚠️ Gemini initialization failed: {e}")
        
        # Try to initialize OpenAI
        try:
            from openai import OpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = OpenAI(api_key=api_key)
                # Test it
                test = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=5
                )
                if test:
                    self.providers.append("openai")
                    logger.info("✅ OpenAI initialized")
        except Exception as e:
            logger.warning(f"⚠️ OpenAI initialization failed: {e}")
        
        # Try to initialize Groq
        try:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY")
            if api_key:
                self.groq_client = Groq(api_key=api_key)
                # Test it
                test = self.groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=5
                )
                if test:
                    self.providers.append("groq")
                    logger.info("✅ Groq initialized")
        except Exception as e:
            logger.warning(f"⚠️ Groq initialization failed: {e}")
        
        # Always have fallback
        self.providers.append("fallback")
        
        logger.info(f"🚀 MultiLLM initialized with providers: {', '.join(self.providers)}")
    
    def generate(self, prompt: str, temperature: float = 0.3, max_tokens: int = 2000) -> str:
        """
        Generate response using first available LLM
        Automatically tries next provider if current fails
        """
        for provider in self.providers:
            try:
                if provider == "gemini":
                    response = self._generate_gemini(prompt, temperature, max_tokens)
                    if response:
                        logger.info(f"✅ Generated with Gemini")
                        self.current_provider = "gemini"
                        return response
                
                elif provider == "openai":
                    response = self._generate_openai(prompt, temperature, max_tokens)
                    if response:
                        logger.info(f"✅ Generated with OpenAI")
                        self.current_provider = "openai"
                        return response
                
                elif provider == "groq":
                    response = self._generate_groq(prompt, temperature, max_tokens)
                    if response:
                        logger.info(f"✅ Generated with Groq")
                        self.current_provider = "groq"
                        return response
                
                elif provider == "fallback":
                    logger.info("⚠️ All LLMs failed, using rule-based fallback")
                    self.current_provider = "fallback"
                    return ""  # Empty means use fallback analyzer
                    
            except Exception as e:
                logger.warning(f"⚠️ {provider} failed: {str(e)[:100]}")
                continue
        
        # If all fail, return empty (triggers fallback)
        logger.error("❌ All LLM providers failed")
        self.current_provider = "fallback"
        return ""
    
    def _generate_gemini(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Generate with Gemini"""
        import google.generativeai as genai
        
        response = self.gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
        )
        
        # Handle different response formats
        if hasattr(response, 'text') and response.text:
            return response.text
        elif hasattr(response, 'parts') and response.parts:
            return response.parts[0].text
        elif hasattr(response, 'candidates') and response.candidates:
            return response.candidates[0].content.parts[0].text
        
        return ""
    
    def _generate_openai(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Generate with OpenAI"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Cheaper and faster than GPT-4
            messages=[
                {"role": "system", "content": "You are an expert AI career advisor."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
    
    def _generate_groq(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Generate with Groq (very fast!)"""
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast and good quality
            messages=[
                {"role": "system", "content": "You are an expert AI career advisor."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
    
    def get_status(self) -> Dict:
        """Get status of all providers"""
        return {
            "available_providers": self.providers,
            "current_provider": self.current_provider,
            "total_providers": len(self.providers)
        }
    
    @property
    def is_available(self) -> bool:
        """Check if any LLM is available"""
        return len(self.providers) > 1  # More than just fallback


# Global instance
_multi_llm = None

def get_multi_llm() -> MultiLLM:
    """Get or create MultiLLM singleton"""
    global _multi_llm
    if _multi_llm is None:
        _multi_llm = MultiLLM()
    return _multi_llm
