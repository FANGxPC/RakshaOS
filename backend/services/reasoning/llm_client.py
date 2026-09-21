import os
import json
import logging
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY is not set. LLM calls will fail.")
        self.client = genai.Client(api_key=api_key) if api_key else None
        self.model_name = "gemini-2.5-flash"

    async def analyze(self, prompt: str) -> dict:
        if not self.client:
            return self._fallback_response()
            
        try:
            # Generate content with JSON schema enforced
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1, # Low temperature for more deterministic output
                ),
            )
            
            try:
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from LLM response: {response.text}")
                return self._fallback_response()
                
        except Exception as e:
            logger.error(f"LLM API call failed: {str(e)}")
            return self._fallback_response()

    def _fallback_response(self) -> dict:
        """Returns a safe fallback response when API fails"""
        return {
            "risk_score": 50,
            "verdict": "WARNING",
            "signals": [],
            "explanation": "We could not fully analyze this message due to a technical error. Please be cautious.",
            "recommended_action": "Verify the sender through official channels before proceeding.",
            "scam_type": "unknown"
        }
