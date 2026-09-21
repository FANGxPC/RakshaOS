from typing import List, Dict, Any

class ExplanationBuilder:
    # We rely heavily on the LLM's explanation, but this can format it.
    @staticmethod
    def format_signals(signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # In MVP, the frontend can just render the raw signals list, but here
        # we ensure the format is consistent.
        return signals
