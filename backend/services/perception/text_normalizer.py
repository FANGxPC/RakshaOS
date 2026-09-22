import re
from typing import Dict, Any

class TextNormalizer:
    @staticmethod
    def normalize(text: str) -> Dict[str, Any]:
        """
        Cleans text and extracts metadata like URLs, phone numbers, and amounts.
        """
        # Clean extra whitespace
        cleaned_text = re.sub(r'\s+', ' ', text).strip()
        
        # Extract URLs
        url_pattern = r'(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)'
        urls = re.findall(url_pattern, cleaned_text)
        # Filter out common false positives like "end of sentence.New sentence"
        valid_urls = [url for url in urls if "." in url and not url.endswith('.')]
        
        # Extract Phone numbers (basic Indian format)
        phone_pattern = r'(?:\+91|0)?[6-9]\d{9}'
        phones = re.findall(phone_pattern, cleaned_text)
        
        # Extract Amounts (basic ₹ or Rs format)
        amount_pattern = r'(?:₹|Rs\.?)\s*([\d,]+(?:\.\d{2})?)'
        amounts = re.findall(amount_pattern, cleaned_text)
        
        # Simple language detection hint (Hindi vs English)
        lang_hint = "hi" if re.search(r'[\u0900-\u097F]', cleaned_text) else "en"
        
        return {
            "cleaned_text": cleaned_text,
            "metadata": {
                "extracted_urls": list(set(valid_urls)),
                "extracted_phones": list(set(phones)),
                "extracted_amounts": list(set([f"₹{a}" for a in amounts])),
                "detected_language": lang_hint
            }
        }
