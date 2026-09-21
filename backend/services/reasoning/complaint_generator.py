import logging
from typing import Dict, Any
from .llm_client import LLMClient

logger = logging.getLogger(__name__)

class ComplaintGenerator:
    def __init__(self):
        self.llm = LLMClient()
        
    async def generate(self, user_data: Dict[str, Any]) -> str:
        amount = user_data.get("amount_paid", "0")
        method = user_data.get("payment_method", "Unknown")
        desc = user_data.get("scam_description", "")
        contact = user_data.get("contact_info", {})
        
        name = contact.get("name", "[Your Name]")
        phone = contact.get("phone", "[Your Phone]")
        email = contact.get("email", "[Your Email]")
        
        prompt = f"""
You are a highly experienced cybercrime legal expert and victim advocate in India.
Your task is to write a formal, legally precise Cybercrime Police Complaint draft based on the following victim's story.
The output MUST be ready to copy-paste into the cybercrime.gov.in portal or submit to a local cyber cell.

Victim Details:
- Name: {name}
- Phone: {phone}
- Email: {email}
- Amount Lost: ₹{amount}
- Payment Method: {method}

Victim's Description of the Scam:
"{desc}"

Instructions for the Draft:
1. Start with "To: The Station House Officer / Cyber Crime Cell"
2. Include a formal Subject line.
3. Keep the tone professional, objective, and urgent.
4. Clearly state the Modus Operandi (how they were tricked) based on the description.
5. Emphasize the exact amount lost (₹{amount}) and the payment method ({method}).
6. Include placeholders like [Date], [Transaction UTR Number], [Scammer's Account Details] where evidence should be attached.
7. Output ONLY the complaint text. Do not add any introductory or concluding remarks of your own. Do not use markdown formatting (like **), just use plain text with clear paragraph spacing, as this will be pasted into a basic text box.
"""
        logger.info("Generating AI cyber police complaint...")
        draft = await self.llm.generate_text(prompt)
        return draft
