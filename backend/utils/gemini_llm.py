"""
Gemini LLM service - Primary LLM (fast and reliable)
Uses Google's Gemini API with proper error handling
"""
import google.generativeai as genai
import os
import json
import logging
from typing import Dict, Optional
import re
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class GeminiLLM:
    def __init__(self):
        """Initialize Gemini"""
        self.gemini_available = False
        self.model_name = None
        self.model = None
        
        # Initialize Gemini
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise Exception("GEMINI_API_KEY not found in environment")
            
            genai.configure(api_key=api_key)
            
            # Use available models (checked via list_models)
            model_attempts = [
                'models/gemini-flash-latest',  # Alias for latest flash model
                'models/gemini-2.5-flash',     # Latest version
                'models/gemini-2.0-flash',     # Stable version
                'models/gemini-pro-latest',    # Pro version
            ]
            
            for model_name in model_attempts:
                try:
                    logger.info(f"Trying model: {model_name}")
                    self.model = genai.GenerativeModel(model_name)
                    
                    # Test with a simple prompt
                    test = self.model.generate_content(
                        "Say 'OK'",
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.1,
                            max_output_tokens=10,
                        )
                    )
                    
                    # Handle different response formats
                    response_text = None
                    if hasattr(test, 'text'):
                        response_text = test.text
                    elif hasattr(test, 'parts') and test.parts:
                        response_text = test.parts[0].text
                    elif hasattr(test, 'candidates') and test.candidates:
                        response_text = test.candidates[0].content.parts[0].text
                    
                    if response_text:
                        self.gemini_available = True
                        self.model_name = model_name
                        logger.info(f"✓ Gemini initialized successfully with {model_name}")
                        break
                except Exception as e:
                    logger.warning(f"Failed {model_name}: {str(e)[:80]}")
                    continue
            
            if not self.gemini_available:
                raise Exception("No Gemini model available. Check API key and quota.")
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini: {e}")
            self.gemini_available = False
    
    def generate(self, prompt: str, temperature: float = 0.3, max_tokens: int = 2000) -> str:
        """
        Generate response using Gemini
        
        Args:
            prompt: Input prompt
            temperature: Creativity (0.0 = deterministic, 1.0 = creative)
            max_tokens: Maximum response length
        
        Returns:
            Generated text
        """
        if not self.gemini_available:
            logger.error("Gemini is not available!")
            return ""
        
        try:
            logger.info("🚀 Generating with Gemini...")
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )
            
            # Handle different response formats
            response_text = None
            
            # Try direct text accessor
            try:
                if hasattr(response, 'text') and response.text:
                    response_text = response.text
            except:
                pass
            
            # Try parts accessor
            if not response_text and hasattr(response, 'parts') and response.parts:
                try:
                    response_text = response.parts[0].text
                except:
                    pass
            
            # Try candidates accessor
            if not response_text and hasattr(response, 'candidates') and response.candidates:
                try:
                    response_text = response.candidates[0].content.parts[0].text
                except:
                    pass
            
            if response_text:
                logger.info("✓ Gemini generation successful")
                return response_text
            else:
                logger.error("Gemini returned empty response")
                return ""
                
        except Exception as e:
            logger.error(f"❌ Gemini generation failed: {e}")
            return ""
    
    def generate_json(self, prompt: str, temperature: float = 0.2) -> Optional[Dict]:
        """
        Generate JSON response
        
        Args:
            prompt: Input prompt (should request JSON output)
            temperature: Lower for more structured output
        
        Returns:
            Parsed JSON dict or None
        """
        try:
            # Add JSON format instruction
            json_prompt = f"""{prompt}

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no extra text.
Start with {{ and end with }}."""

            response = self.generate(json_prompt, temperature=temperature, max_tokens=2000)
            
            if not response:
                return None
            
            # Extract JSON from response
            json_data = self._extract_json(response)
            
            if json_data:
                logger.info("✓ Successfully generated and parsed JSON")
                return json_data
            else:
                logger.warning("Failed to extract valid JSON from response")
                return None
        except Exception as e:
            logger.error(f"JSON generation failed: {e}")
            return None
    
    def _extract_json(self, text: str) -> Optional[Dict]:
        """Extract and parse JSON from text"""
        try:
            # Try direct parsing first
            return json.loads(text)
        except:
            pass
        
        # Try to find JSON in markdown code blocks
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except:
                pass
        
        # Try to find JSON object
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except:
                pass
        
        return None
    
    def get_status(self) -> Dict:
        """Get LLM status"""
        return {
            "primary": "Gemini" if self.gemini_available else "None",
            "fallback": "None",
            "status": "operational" if self.gemini_available else "unavailable"
        }

# Global instance
_gemini_llm = None

def get_gemini_llm() -> GeminiLLM:
    """Get or create Gemini LLM singleton"""
    global _gemini_llm
    if _gemini_llm is None:
        _gemini_llm = GeminiLLM()
    return _gemini_llm

# Alias for compatibility
OllamaLLM = GeminiLLM
