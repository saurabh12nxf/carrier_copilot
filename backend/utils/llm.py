"""
Ollama LLM service for local inference
Uses llama3 model for generating responses
"""
import ollama
import json
import logging
from typing import Dict, Optional
import re

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, model: str = "llama3"):
        """Initialize Ollama client"""
        self.model = model
        self.client = ollama.Client()
        logger.info(f"Ollama service initialized with model: {model}")
    
    def generate(self, prompt: str, temperature: float = 0.3, max_tokens: int = 2000) -> str:
        """
        Generate response from Ollama
        
        Args:
            prompt: Input prompt
            temperature: Creativity (0.0 = deterministic, 1.0 = creative)
            max_tokens: Maximum response length
        
        Returns:
            Generated text
        """
        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                options={
                    "temperature": temperature,
                    "num_predict": max_tokens,
                }
            )
            return response['response']
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return ""
    
    def generate_json(self, prompt: str, temperature: float = 0.2) -> Optional[Dict]:
        """
        Generate JSON response from Ollama
        Includes JSON extraction and validation
        
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
            
            # Extract JSON from response
            json_data = self._extract_json(response)
            
            if json_data:
                logger.info("Successfully generated and parsed JSON")
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
    
    def check_model_available(self) -> bool:
        """Check if Ollama model is available"""
        try:
            models = self.client.list()
            available_models = [m['name'] for m in models.get('models', [])]
            return self.model in available_models or f"{self.model}:latest" in available_models
        except Exception as e:
            logger.error(f"Failed to check model availability: {e}")
            return False

# Global instance
_ollama_service = None

def get_ollama_service() -> OllamaService:
    """Get or create Ollama service singleton"""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service

# Alias for compatibility
OllamaLLM = OllamaService
