from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json

from ..services.perception.ocr_service import OCRService
from ..services.perception.qr_service import QRService
from ..services.perception.text_normalizer import TextNormalizer
from ..services.reasoning.llm_client import LLMClient
from ..services.reasoning.prompt_builder import PromptBuilder
from ..services.reasoning.scam_genome import ScamGenome
from ..services.reasoning.url_heuristics import URLHeuristics
from ..services.decision.risk_engine import RiskEngine

router = APIRouter()

class AnalyzeRequest(BaseModel):
    input_type: str  # "text", "screenshot", "qr"
    content: str
    language_hint: Optional[str] = "auto"

@router.post("/analyze")
async def analyze_input(request: AnalyzeRequest):
    try:
        # 1. Perception Layer
        raw_text = ""
        extracted_urls_qr = []
        
        if request.input_type == "text":
            raw_text = request.content
        elif request.input_type == "screenshot":
            raw_text = OCRService.extract_text(request.content)
            if not raw_text:
                raise HTTPException(status_code=400, detail="Could not extract text from screenshot")
        elif request.input_type == "qr":
            extracted_urls_qr = QRService.extract_urls(request.content)
            raw_text = " ".join(extracted_urls_qr) # Treat URLs as text for analysis
            if not extracted_urls_qr:
                 raise HTTPException(status_code=400, detail="Could not extract URLs from QR code")
        else:
            raise HTTPException(status_code=400, detail="Invalid input_type")
            
        norm_result = TextNormalizer.normalize(raw_text)
        cleaned_text = norm_result["cleaned_text"]
        metadata = norm_result["metadata"]
        
        all_urls = list(set(metadata["extracted_urls"] + extracted_urls_qr))
        
        # 2. Reasoning Layer
        url_heuristics = URLHeuristics()
        url_analysis_result = url_heuristics.analyze(all_urls)
        
        genome = ScamGenome()
        scam_patterns = genome.get_context()
        
        prompt = PromptBuilder.build_analysis_prompt(
            user_text=cleaned_text,
            scam_patterns=scam_patterns,
            url_analysis=json.dumps(url_analysis_result)
        )
        
        llm = LLMClient()
        llm_result = await llm.analyze(prompt)
        
        # 3. Decision Layer
        final_result = RiskEngine.process(llm_result, url_analysis_result)
        
        # Add metadata to response
        final_result["input_metadata"] = metadata
        if request.input_type == "qr":
            final_result["input_metadata"]["extracted_urls"] = extracted_urls_qr
            
        return final_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
