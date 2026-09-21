import json
import os
from typing import Dict, Any

class ComplaintGenerator:
    def __init__(self):
        self.template = ""
        self._load_template()
        
    def _load_template(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "../../data/complaint_templates.json")
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.template = data.get("general", "")
        except Exception:
            self.template = "To: Cyber Crime Cell\n\nSubject: Cyber Fraud Report\n\n..."
            
    def generate(self, user_data: Dict[str, Any]) -> str:
        amount = user_data.get("amount_paid", "0")
        method = user_data.get("payment_method", "Unknown")
        desc = user_data.get("scam_description", "")
        contact = user_data.get("contact_info", {})
        
        name = contact.get("name", "[Your Name]")
        phone = contact.get("phone", "[Your Phone]")
        email = contact.get("email", "[Your Email]")
        date = "[Date]"
        
        draft = self.template.format(
            payment_method=method,
            amount_paid=amount,
            date=date,
            scam_description=desc,
            name=name,
            phone=phone,
            email=email
        )
        return draft
