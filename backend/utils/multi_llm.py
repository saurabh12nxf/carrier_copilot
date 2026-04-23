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
        self.gemini_model = None
        self.openai_client = None
        self.groq_client = None
        
        # Try to initialize Gemini (no test call - test on first use)
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key and len(api_key) > 10:
                genai.configure(api_key=api_key)
                # Use gemini-pro which is stable and widely available
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                self.providers.append("gemini")
                logger.info("✅ Gemini configured")
        except Exception as e:
            logger.warning(f"⚠️ Gemini initialization failed: {e}")
        
        # Try to initialize OpenAI (no test call - test on first use)
        try:
            from openai import OpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and len(api_key) > 10:
                self.openai_client = OpenAI(api_key=api_key)
                self.providers.append("openai")
                logger.info("✅ OpenAI configured")
        except Exception as e:
            logger.warning(f"⚠️ OpenAI initialization failed: {e}")
        
        # Try to initialize Groq (no test call - test on first use)
        try:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY")
            if api_key and len(api_key) > 10:
                self.groq_client = Groq(api_key=api_key)
                self.providers.append("groq")
                logger.info("✅ Groq configured")
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
                if provider == "gemini" and self.gemini_model:
                    logger.info(f"🔄 Trying Gemini...")
                    response = self._generate_gemini(prompt, temperature, max_tokens)
                    if response:
                        logger.info(f"✅ Generated with Gemini ({len(response)} chars)")
                        self.current_provider = "gemini"
                        return response
                    else:
                        logger.warning("⚠️ Gemini returned empty response")
                
                elif provider == "openai" and self.openai_client:
                    logger.info(f"🔄 Trying OpenAI...")
                    response = self._generate_openai(prompt, temperature, max_tokens)
                    if response:
                        logger.info(f"✅ Generated with OpenAI ({len(response)} chars)")
                        self.current_provider = "openai"
                        return response
                    else:
                        logger.warning("⚠️ OpenAI returned empty response")
                
                elif provider == "groq" and self.groq_client:
                    logger.info(f"🔄 Trying Groq...")
                    response = self._generate_groq(prompt, temperature, max_tokens)
                    if response:
                        logger.info(f"✅ Generated with Groq ({len(response)} chars)")
                        self.current_provider = "groq"
                        return response
                    else:
                        logger.warning("⚠️ Groq returned empty response")
                
                elif provider == "fallback":
                    logger.info("⚠️ All LLMs failed, using rule-based fallback")
                    self.current_provider = "fallback"
                    return ""  # Empty means use fallback analyzer
                    
            except Exception as e:
                logger.warning(f"⚠️ {provider} failed: {str(e)[:200]}")
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
            model="gpt-3.5-turbo",  # Use cheaper model
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
