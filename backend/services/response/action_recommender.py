
class ActionRecommender:
    # MVP relies on LLM recommended_action, this provides fallbacks
    @staticmethod
    def get_fallback_action(verdict: str) -> str:
        if verdict == "SAFE":
            return "No obvious risks detected. You can proceed normally."
        elif verdict == "WARNING":
            return "Proceed with caution. Verify through an official channel before sharing details or money."
        elif verdict == "HIGH_RISK":
            return "DO NOT PROCEED. Verify this request by independently contacting the official organization."
        elif verdict == "EMERGENCY":
            return "STOP IMMEDIATELY. This is a known scam pattern. Do not pay or share credentials."
        return "Verify independently before proceeding."
