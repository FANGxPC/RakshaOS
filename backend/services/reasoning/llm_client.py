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
        self.model_name = "gemini-3.5-flash"

    async def analyze(self, prompt: str) -> dict:
        if not self.client:
            return self._fallback_response()
            
        try:
            # Generate content with JSON schema enforced using Interactions API
            # Wrap in asyncio.wait_for to prevent infinite hangs on 429 retries
            import asyncio
            interaction = await asyncio.wait_for(
                self.client.aio.interactions.create(
                    model=self.model_name,
                    input=prompt
                ),
                timeout=30.0
            )
            
            try:
                text = interaction.output_text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                elif text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                
                result = json.loads(text.strip())
                return result
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from LLM response: {interaction.output_text}")
                return self._fallback_response()
                
        except Exception as e:
            logger.error(f"LLM API call failed: {repr(e)}")
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

    async def generate_text(self, prompt: str) -> str:
        """Generates plain text response using Gemini"""
        if not self.client:
            return "Error: GEMINI_API_KEY is not set. Could not generate text."
            
        try:
            import asyncio
            interaction = await asyncio.wait_for(
                self.client.aio.interactions.create(
                    model=self.model_name,
                    input=prompt,
                ),
                timeout=30.0
            )
            return interaction.output_text
        except Exception as e:
            logger.error(f"LLM text generation failed: {str(e)}")
            return f"An error occurred while generating text: {str(e)}"
