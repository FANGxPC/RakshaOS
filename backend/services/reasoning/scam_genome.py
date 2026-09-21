import json
import os
from typing import List, Dict, Any

class ScamGenome:
    def __init__(self):
        self.patterns = []
        self._load_patterns()

    def _load_patterns(self):
        # Determine paths relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "../../data/scam_patterns.json")
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                self.patterns = json.load(f)
        except Exception as e:
            print(f"Failed to load scam patterns: {str(e)}")

    def get_context(self, top_k: int = 5) -> str:
        """
        In a real app, this would use vector search to find relevant patterns based on the user_text.
        For the MVP, we just return a sample of all categories.
        """
        # For MVP, just return a JSON string of the loaded patterns.
        # Ensure we don't overflow context window if there are too many.
        return json.dumps(self.patterns[:top_k], indent=2)
