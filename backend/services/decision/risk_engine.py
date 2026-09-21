from typing import Dict, Any

class RiskEngine:
    @staticmethod
    def process(llm_result: Dict[str, Any], url_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes LLM output, applies heuristic boosts (e.g., known-bad URL -> +15 to score), 
        maps to final verdict.
        """
        score = llm_result.get("risk_score", 50)
        
        # Apply heuristic boosts
        if url_analysis.get("overall_risk") == "HIGH":
            score = min(100, score + 15)
            
        # Re-evaluate verdict based on final score
        if score <= 25:
            verdict = "SAFE"
        elif score <= 60:
            verdict = "WARNING"
        elif score <= 90:
            verdict = "HIGH_RISK"
        else:
            verdict = "EMERGENCY"
            
        llm_result["risk_score"] = score
        llm_result["verdict"] = verdict
        
        return llm_result
