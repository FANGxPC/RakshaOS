from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime, timezone

from ..services.perception.ocr_service import OCRService
from ..services.perception.qr_service import QRService
from ..services.perception.text_normalizer import TextNormalizer
from ..services.reasoning.llm_client import LLMClient
from ..services.reasoning.prompt_builder import PromptBuilder
from ..services.reasoning.scam_genome import ScamGenome
from ..services.reasoning.url_heuristics import URLHeuristics
from ..services.reasoning.upi_analyzer import UPIAnalyzer
from ..services.decision.risk_engine import RiskEngine

router = APIRouter()

class AnalyzeRequest(BaseModel):
    input_type: str  # "text", "screenshot", "qr"
    content: str
    language_hint: Optional[str] = "auto"
    channel: Optional[str] = "web"  # whatsapp, telegram, chrome, email, sms, clipboard, upi, web

@router.post("/analyze")
async def analyze_input(request: AnalyzeRequest, req: Request):
    try:
        # 1. Perception Layer
        raw_text = ""
        extracted_urls_qr = []
        upi_analysis = None
        
        if request.input_type == "text":
            raw_text = request.content
        elif request.input_type == "screenshot":
            raw_text = OCRService.extract_text(request.content)
            if not raw_text:
                raise HTTPException(status_code=400, detail="Could not extract text from screenshot")
        elif request.input_type == "qr":
            extracted_urls_qr = QRService.extract_urls(request.content)
            raw_text = " ".join(extracted_urls_qr)
            if not extracted_urls_qr:
                raise HTTPException(status_code=400, detail="Could not extract URLs from QR code")
        else:
            raise HTTPException(status_code=400, detail="Invalid input_type")
        
        norm_result = TextNormalizer.normalize(raw_text)
        cleaned_text = norm_result["cleaned_text"]
        metadata = norm_result["metadata"]
        
        all_urls = list(set(metadata["extracted_urls"] + extracted_urls_qr))
        
        # Check for UPI deep links
        upi_analyzer = UPIAnalyzer()
        upi_links = [u for u in all_urls if u.startswith("upi://")]
        if upi_links:
            upi_analysis = upi_analyzer.analyze(upi_links)
        
        # Also check in text for UPI links
        import re
        upi_in_text = re.findall(r'upi://[^\s]+', raw_text)
        if upi_in_text and not upi_analysis:
            upi_analysis = upi_analyzer.analyze(upi_in_text)
        
        # 2. Reasoning Layer
        url_heuristics = URLHeuristics()
        url_analysis_result = url_heuristics.analyze(all_urls)
        
        genome = ScamGenome()
        scam_patterns = genome.get_context()
        
        url_context = json.dumps(url_analysis_result)
        if upi_analysis:
            url_context += "\n\nUPI ANALYSIS:\n" + json.dumps(upi_analysis)
        
        prompt = PromptBuilder.build_analysis_prompt(
            user_text=cleaned_text,
            scam_patterns=scam_patterns,
            url_analysis=url_context
        )
        
        llm = LLMClient()
        llm_result = await llm.analyze(prompt)
        
        # 3. Decision Layer
        final_result = RiskEngine.process(llm_result, url_analysis_result)
        
        # Add metadata
        final_result["input_metadata"] = metadata
        final_result["channel"] = request.channel
        final_result["timestamp"] = datetime.now(timezone.utc).isoformat()
        final_result["input_preview"] = cleaned_text[:120] + ("..." if len(cleaned_text) > 120 else "")
        
        if upi_analysis:
            final_result["upi_analysis"] = upi_analysis
        
        if request.input_type == "qr":
            final_result["input_metadata"]["extracted_urls"] = extracted_urls_qr
        
        # 4. Broadcast to WebSocket & update stats
        app_state = req.app.state
        
        app_state.stats["total_scanned"] += 1
        if final_result.get("verdict") in ("HIGH_RISK", "EMERGENCY"):
            app_state.stats["threats_detected"] += 1
        elif final_result.get("verdict") == "SAFE":
            app_state.stats["safe_count"] += 1
        
        event = {
            "type": "new_analysis",
            "data": final_result,
            "stats": app_state.stats,
        }
        app_state.event_history.append(final_result)
        
        # Keep only last 100 events
        if len(app_state.event_history) > 100:
            app_state.event_history = app_state.event_history[-100:]
        
        await app_state.manager.broadcast(event)
        
        return final_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
